from accounting.tests.test_serializers import ValidationErrorTestMixin
from django.core.exceptions import ValidationError
from django.test import RequestFactory 
from contextlib import contextmanager
from rest_framework.test import APITestCase
from rest_framework.exceptions import ErrorDetail
from accounting.models import (
    Expense, Profile, Charity, ProfileCharity,
    Activity, Indicator, IndicatorUnit, Service, Project,
    Transaction, TransactionDetail
)
from accounting.model_factories import (
    ExpenseFactory,
    ProfileFactory,
    CharityFactory,
    SupplierFactory,
    UserFactory,
    ProfileCharityFactory
)
from accounting.serializers import (
    ExpenseSerializer
)
from accounting.utils import all_keys
from django.contrib.auth.models import User

from copy import deepcopy
import uuid


class ExpenseSerializerTests(APITestCase, ValidationErrorTestMixin):
    supplier = None
    project = None
    charity = None
    user = None
    profile = None
    charity_profile = None
    expense_serializer = None
    serialised_data = None
    request = None

    def setUp(self):
        self.user = User.objects.create_user(
            username='test123@testing', password='test123')
        # self.user = UserFactory(username='test123@testing', password='test123')
        self.client.force_authenticate(user=self.user)
        self.charity = CharityFactory.create()
        self.profileCharity = ProfileCharityFactory.create(
            profile=self.user.profile,
            charity=self.charity)
        self.expense = ExpenseFactory.create(parent_charity=self.charity.uuid)
        self.supplier = SupplierFactory.create(
            parent_charity=self.charity.uuid)
        # Dummy request object to store the 'user' attribute accessed by serialiser code
        self.request = RequestFactory().get('/dummy-url')
        self.request.user = self.user
        # Curry the ExpenseSerializer with user context, so multitenancy methods can run succesfully
        self.expense_serializer = lambda *args, **kwargs: ExpenseSerializer(*args, context={ 'request': self.request}, **kwargs)
        # self.serialised_data = {
        #     # 'parent_charity': self.charity.uuid,
        #     'parent_charity': 'e90485c5-da17-4874-b1da-52a5f72a4666',
        #     'uuid': 'e90485c5-da17-4874-b1da-52a5f72a4666',
        #     'date': '2024-03-16',
        #     'supplier_id': 1,
        #     'payment_type': 0,
        #     'expense_type': 'office',
        #     'transaction': [{
        #         'entries': [{
        #             'account': 'Security',
        #             'uuid': '86828fec-1ebc-4d35-8909-1a0a9fbea59b',
        #             'amount_currency': 'GBP',
        #             'amount': '732.00',
        #             'narration': 'Description here',
        #             'direction': '1'
        #         },
        #             {
        #             'account': 'Bank',
        #             'uuid': '86828fec-1ebc-4d35-8909-1a0a9fbea59b',
        #             'amount_currency': 'GBP',
        #             'amount': '732.00',
        #             'narration': 'Description here',
        #             'direction': '-1'
        #         }]
        #     }]
        # }
        self.serialised_data = {
            'expense_type': 'maintenance',
            'payment_type': 0,
            'supplier_id': self.expense.supplier.uuid,
            'line_items': [{
                'parent_charity': '6226186d-836b-424d-975e-c45682a10425',
                'date': '1996-02-01T09:06:09.511162Z',
                'dr_account': 'Utilities',
                'cr_account': 'Credit card',
                'amount': '448.97',
                'description': 'Gas and electricity bills for quarter',
                # 'project': '9428376e-47b8-49db-9d65-7dd05cfe7e4d',
                'project': str(self.expense.transaction.first().project.uuid),
                # 'fund': None
            }]
        }
        print('The project UUID is:', str(self.expense.transaction.first().project.uuid))

    def tearDown(self):
        Activity.objects.all().delete()
        Indicator.objects.all().delete()
        IndicatorUnit.objects.all().delete()
        Service.objects.all().delete()
        Transaction.objects.all().delete()
        Project.objects.all().delete()
        TransactionDetail.objects.all().delete()
        Expense.objects.all().delete()
        ProfileCharity.objects.all().delete()
        Charity.objects.all().delete()
        Profile.objects.all().delete()
        User.objects.all().delete()


    # DESERIALISATION TESTS
    def test_success_on_valid_input(self):
        # is_valid() is true and object properties match serialised data
        serialised = self.expense_serializer(data=self.serialised_data)
        is_valid = serialised.is_valid()
        if (not is_valid): print('Errors:', serialised.errors)
        # self.assertTrue(serialised.is_valid())
        self.assertTrue(is_valid)

    def test_fail_on_invalid_data_type(self):
        # Pass in a string instead of an integer
        self.serialised_data['payment_type'] = 'ShouldBeAnInteger'                

        serialised = self.expense_serializer(data=self.serialised_data) # type: ignore
        self.assertFalse(serialised.is_valid())
        self.assertEqual(serialised.errors, {
            'payment_type': [ErrorDetail(string='A valid integer is required.', code='invalid')]
        })


    def test_fail_on_missing_field(self):
        incomplete = deepcopy(self.serialised_data)
        incomplete.pop('expense_type')

        serialised = self.expense_serializer(data=incomplete) # type: ignore
        self.assertFalse(serialised.is_valid())
        self.assertEqual(serialised.errors, {
            'expense_type': [ErrorDetail(string='This field is required.', code='required')]
        })

    def test_nested_data(self):
        # Fail when nested ExpenseLineItem data has the incorrect format
        
        # Make the line_items data incorrect
        self.serialised_data['line_items'][0]['date'] = 'not a date',
        self.serialised_data['line_items'][0].pop('amount')

        serialised = self.expense_serializer(data=self.serialised_data)
        self.assertFalse(serialised.is_valid())

        # Check that error messages are correct, and apply to the correct fields
        self.assertEqual(set(['line_items', 'date', 'amount']), set(all_keys(serialised.errors, [ErrorDetail])))
        errors = [serialised.errors['line_items'][0]['date'][0], serialised.errors['line_items'][0]['amount'][0]]
        self.assertEqual(errors[0].code, 'invalid')
        self.assertEqual(errors[1].code, 'required')
        # self.assertEqual(serialised.errors, {
        #     'line_items': {
        #         'date': [ErrorDetail(string='Datetime has wrong format. Use one of these formats instead: YYYY-MM-DDThh:mm[:ss[.uuuuuu]][+HH:MM|-HH:MM|Z].', code='invalid')],
        #         'amount': [ErrorDetail(string='This field is required.', code='required')]
        #     }
        # })

    def test_read_only_fields(self):
        # Ensure read-only fields are not modified by user input
        user_uuid = uuid.uuid4()
        self.serialised_data['uuid'] = user_uuid

        serialised = self.expense_serializer(data=self.serialised_data)
        serialised.is_valid()
        instance = serialised.save()
        self.assertNotEqual(instance.uuid, user_uuid)

    def test_to_internal_value(self):
        # Test the custom to_internal_value() method works correctly - it should
        # add the user's charity UUID to the serialised data
        # Check data does not contain charity UUID before serialisation
        self.assertNotEqual(self.serialised_data['parent_charity'], str(self.charity.uuid))
        serialised = self.expense_serializer(data=self.serialised_data)
        serialised.is_valid()
        # check that it does after serialisation
        self.assertEqual(serialised.validated_data, str(self.charity.uuid))
        

    # SERIALISATION TESTS

    def test_own_fields_present(self):
        serialised_data = self.expense_serializer(self.expense).data
        self.assertEqual(set(serialised_data.keys()), set(['expense_type', 'payment_type', 'supplier']))

    def test_nested_fields_present(self):
        # Check each ExpenseLineItem has the correct fields
        serialised_data = self.expense_serializer(self.expense).data
        for line_item in serialised_data['line_items']:
            self.assertEqual(set(line_item.keys()), set(['parent_charity', 'data', 'dr_account', 'cr_account',
                                               'amount', 'description', 'project', 'fund']))
        
    def test_correct_field_values(self):
        expected_output = {
            'expense_type': self.expense.expense_type,
            'payment_type': self.expense.payment_type,
            'supplier': self.expense.supplier.display_name
        }
        serialised_data = self.expense_serializer(self.expense).data
        self.assertEqual(serialised_data['expense_type'], expected_output['expense_type'])
        self.assertEqual(serialised_data['payment_type'], expected_output['payment_type'])
        self.assertEqual(serialised_data['supplier'], expected_output['supplier'])