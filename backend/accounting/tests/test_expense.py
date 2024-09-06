from django.urls import reverse
from django.contrib.auth.models import User
from django.core.cache import cache
from rest_framework.test import APITestCase, APIRequestFactory
from rest_framework import status

from django.test import override_settings
from django.urls import reverse, resolve

from accounting.models import (
    Expense, Profile, ProfileCharity, Transaction
)
from accounting.model_factories import (
    ExpenseFactory,
    SupplierFactory,
    ProfileFactory,
    ContactFactory,
    CharityFactory,
    ProfileCharityFactory,
    TransactionFactory
)
from accounting.serializers import (
    ExpenseSerializer,
    TransactionSerializer
)
from unittest.mock import patch
import random
import uuid
import datetime
import time


# @override_settings(ACTIVATE_TEST_CACHE=True)
class ExpenseAPITest(APITestCase):
    project = None
    charity = None
    user = None
    profile = None
    charity_profile = None

    def setUp(self):
        self.user = User.objects.create_user(
            username='test123@testing', password='test123')
        self.client.force_authenticate(user=self.user)
        self.charity = CharityFactory.create()
        self.profileCharity = ProfileCharityFactory.create(
            profile=self.user.profile,
            charity=self.charity)
        self.expense = ExpenseFactory.create(parent_charity=self.charity.uuid)
        self.supplier = SupplierFactory.create()

    def tearDown(self):
        cache.clear()
    #     Transaction.objects.all().delete()
    #     Expense.objects.all().delete()
    #     ProfileCharity.objects.all().delete()
    #     Profile.objects.all().delete()
    #     User.objects.all().delete()

    # TESTING ROUTING
    def test_correct_URL_generated(self):
        # Test that the URL created for the endpoint for our dummy object is correct
        # by comparing with the expected value (e.g. 'api/v1/account_types/1')
        created_object_id = self.expense.id
        created_object_url = reverse(
            'expense-detail', kwargs={'pk': created_object_id})
        self.assertEqual(created_object_url,
                         f'/api/v1/expenses/{created_object_id}/')

    def test_correct_view_selected(self):
        # Check that the correct view function is called from the URL
        resolver = resolve(f'/api/v1/expenses/1/')
        retrieved_view = resolver._func_path.rsplit('.', 1)[1]
        self.assertEqual(retrieved_view, 'ExpenseViewSet')

    # TESTING STATUS CODES

    def test_200_on_valid_GET(self):
        valid_id = self.expense.id
        response = self.client.get(
            reverse('expense-list'), kwargs={'pk': valid_id}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_404_on_invalid_GET(self):
        # Test that a 404 'Not Found' code is returned on trying to access an invalid
        # object
        incorrect_id = self.expense.id + random.randint(100, 1000)
        response = self.client.get(
            f'api/v1/expenses/{incorrect_id}')
        # reverse('expense-detail'),
        # kwargs={'pk': incorrect_id})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # def test_201_on_valid_POST(self):
    #     transaction_data = TransactionSerializer(TransactionFactory()).data
    #     # Test that a 201 status code is returned for a valid POST request
    #     data = {
    #         'parent_charity': self.charity.uuid,
    #         'uuid': uuid.uuid4(),
    #         'date': datetime.date.today(),
    #         'supplier': self.supplier.id,
    #         'payment_type': 0,
    #         'expense_type': 'materials',
    #         'transaction': transaction_data
    #     }
    #     response = self.client.post(reverse('expense-list'), data)
    #     self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_204_on_valid_DELETE(self):
        # Test that a 204 is returned after a DELETE *and* the deleted
        # object is no longer available
        response = self.client.delete(
            reverse('expense-detail', kwargs={'pk': self.expense.id})
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        check_available = self.client.get(
            reverse('expense-detail', kwargs={'pk': self.expense.id})
        )
        self.assertEqual(check_available.status_code,
                         status.HTTP_404_NOT_FOUND)

    def test_405_on_invalid_method(self):
        # Try to send a POST to a detail endpoint (which do not support POSTs)
        response = self.client.post(
            reverse('expense-detail',
                    kwargs={'pk': self.expense.id + random.randint(20, 70)})
        )
        self.assertEqual(response.status_code,
                         status.HTTP_405_METHOD_NOT_ALLOWED)

    # OTHER API TESTS

    def test_valid_payload_GET(self):
        # Create multiple expenses
        batch_size = 3
        expenses = ExpenseFactory.create_batch(
            size=batch_size, parent_charity=self.charity.uuid)
        # Test length of output and contents
        response = self.client.get(
            reverse('expense-list')
        )
        # Total number of Expense objects are the batch + single
        # expense created in setUp()
        self.assertEqual(len(response.data), batch_size + 1)

        # Iterate through the expense data returned and check it
        # matches
        for expense, response in zip(expenses, response.data[1:]):
            actual_data = ExpenseSerializer(expense).data
            self.assertEqual(actual_data, response)

    def test_valid_update(self):
        # Test that updating an existing model object works
        new_data = {'expense_type': 'labour', 'payment_type': 3}
        # print('Old data', { 'expense_type': self.expense.expense_type, 'payment_type': self.expense.payment_type })
        # print('New data', new_data)
        # print('All old data', ExpenseSerializer(self.expense).data)
        response = self.client.patch(
            reverse(
                'expense-detail',
                kwargs={'pk': self.expense.id}),
            data=new_data
        )

        # Check that the field has been updated successfully with a
        # second GET request
        check_response = self.client.get(
            reverse('expense-detail', kwargs={'pk': self.expense.id}))
        self.assertEqual(new_data['expense_type'],
                         check_response.data['expense_type'])
        self.assertEqual(new_data['payment_type'],
                         check_response.data['payment_type'])

    def test_invalid_create(self):
        # Test POST route fails with invalid payload
        bad_expense = {
            'id': 'ABC',
            'date': 'abcde',
            'supplier_id': '-2',
            'expense_type': 'e' * 100}
        response = self.client.post(reverse('expense-list'), bad_expense)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_GET_idempotent(self):
        responses = []
        # Send the same GET request multiple times
        for i in range(3):
            response = self.client.get(reverse('expense-list'))
            responses.append(response.data)
        # Check all the responses in the list are identical
        # (Check from https://stackoverflow.com/a/3844832)
        self.assertTrue(responses[:-1] == responses[1:])

    def test_response_time(self):
        start_time = time.time()
        response = self.client.get('/api/projects/')
        end_time = time.time()

        self.assertLess(end_time - start_time, 0.2)
