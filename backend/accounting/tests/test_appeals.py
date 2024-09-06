from django.urls import reverse
from django.contrib.auth.models import User
from django.core.cache import cache
from rest_framework.test import APITestCase, APIRequestFactory
from rest_framework import status

from django.test import override_settings
from django.urls import reverse, resolve

from accounting.models import (
    ProjectAppeal
)
from accounting.model_factories import (
    ExpenseFactory,
    CharityFactory,
    ProjectAppealFactory,
    TransactionFactory
)
from accounting.serializers import (
    ProjectAppealSerializer,
    ProjectAppealListSerializer,
    ExpenseSerializer,
    TransactionSerializer
)
import random
import uuid
import datetime
import time

# @override_settings(ACTIVATE_TEST_CACHE=True)
class ProjectAppealAPITest(APITestCase):
    appeal = None
    charity = None
    user = None
    # profile = None
    # charity_profile = None

    def setUp(self):
        self.user = User.objects.create_user(
            username='test123@testing', password='test123')
        self.client.force_authenticate(user=self.user)
        self.charity = CharityFactory.create()
        # self.profileCharity = ProfileCharityFactory.create(
        #     profile=self.user.profile,
        #     charity=self.charity)
        # self.expense = ExpenseFactory.create(parent_charity=self.charity.uuid)
        # self.supplier = SupplierFactory.create()

        self.appeal = ProjectAppealFactory.create(is_live=True)

    # def tearDown(self):
    #     cache.clear()
    #     Transaction.objects.all().delete()
    #     Expense.objects.all().delete()
    #     ProfileCharity.objects.all().delete()
    #     Profile.objects.all().delete()
    #     User.objects.all().delete()

    # TESTING ROUTING
    def test_correct_URL_generated(self):
        # Test that the URL created for the endpoint for our dummy object is correct
        # by comparing with the expected value (e.g. 'api/v1/account_types/1')
        created_object_id = self.appeal.uuid
        created_object_url = reverse(
            'projectappeal-detail', kwargs={'uuid': created_object_id})
        self.assertEqual(created_object_url,
                         f'/api/v1/appeals/{created_object_id}/')

    def test_correct_view_selected(self):
        # Check that the correct view function is called from the URL
        resolver = resolve(f'/api/v1/appeals/')
        retrieved_view = resolver._func_path.rsplit('.', 1)[1]
        self.assertEqual(retrieved_view, 'ProjectAppealViewSet')

    # TESTING STATUS CODES

    def test_200_on_valid_GET(self):
        valid_id = self.appeal.uuid
        response = self.client.get(
            reverse('projectappeal-list'), kwargs={'uuid': valid_id}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_404_on_invalid_GET(self):
        # Test that a 404 'Not Found' code is returned on trying to access an invalid
        # object
        # incorrect_id = self.expense.id + random.randint(100, 1000)
        incorrect_id = str(uuid.uuid4())
        response = self.client.get(
            f'api/v1/appeals/{incorrect_id}')
        # reverse('expense-detail'),
        # kwargs={'pk': incorrect_id})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_201_on_valid_POST(self):
        # transaction_data = TransactionSerializer(TransactionFactory()).data
        # Test that a 201 status code is returned for a valid POST request
        data = {
            'project': str(self.appeal.project.id),
            'title': 'Emergency relief - Nepal 2024',
            'subtitle': 'Appeal for emergency relief. Donate today to save lives.',
            'story': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            'date_started': '2024-01-01',
            'is_live': True,
        }
        response = self.client.post(reverse('projectappeal-list'), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_204_on_valid_DELETE(self):
        # Test that a 204 is returned after a DELETE *and* the deleted
        # object is no longer available
        response = self.client.delete(
            reverse('projectappeal-detail', kwargs={'uuid': self.appeal.uuid})
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        check_available = self.client.get(
            reverse('projectappeal-detail', kwargs={'uuid': self.appeal.id})
        )
        self.assertEqual(check_available.status_code,
                         status.HTTP_404_NOT_FOUND)

    def test_405_on_invalid_method(self):
        # Try to send a POST to a detail endpoint (which do not support POSTs)
        response = self.client.post(
            reverse('projectappeal-detail',
                    kwargs={'uuid': uuid.uuid4()})
        )
        self.assertEqual(response.status_code,
                         status.HTTP_405_METHOD_NOT_ALLOWED)

    # OTHER API TESTS

    def test_valid_payload_GET(self):
        # Create multiple project appeals
        batch_size = 3
        # Make sure that the is_live flag is set to true, as completed appeals
        # won't be returned by the endpoint
        appeals = ProjectAppealFactory.create_batch(size=batch_size, is_live=True)
        # Test length of output and contents
        response = self.client.get(
            reverse('projectappeal-list')
        )
        # Total number of ProjectAppeal objects are the batch + single
        # appeal created in setUp()
        self.assertEqual(len(response.data), batch_size + 1)

        # Iterate through the appeal data returned and check it
        # matches
        for appeal, response in zip(appeals, response.data[1:]):
            actual_data = ProjectAppealListSerializer(appeal).data
            self.assertEqual(actual_data, dict(response))

    def test_valid_update(self):
        # Test that updating an existing model object works
        new_data = {'title': 'Updated title - 2024', 'subtitle': 'The subtitle of this project appeal has now been changed.'}
        # print('Old data', { 'expense_type': self.expense.expense_type, 'payment_type': self.expense.payment_type })
        # print('New data', new_data)
        # print('All old data', ExpenseSerializer(self.expense).data)
        response = self.client.patch(
            reverse(
                'projectappeal-detail',
                kwargs={'uuid': self.appeal.uuid}),
            data=new_data
        )

        # Check that the field has been updated successfully with a
        # second GET request
        check_response = self.client.get(
            reverse('projectappeal-detail', kwargs={'uuid': self.appeal.uuid}))
        self.assertEqual(new_data['title'],
                         check_response.data['title'])
        self.assertEqual(new_data['subtitle'],
                         check_response.data['subtitle'])

    def test_invalid_create(self):
        # Test POST route fails with invalid payload
        bad_appeal = {
            'project': 'invalidID-abc234',
            'title': 384,
            'subtitle': 'over_the_char_limit' * 100,
            'date_started': 888,
            'is_live': 'maybe',
        }
        response = self.client.post(reverse('projectappeal-list'), bad_appeal)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_GET_idempotent(self):
        responses = []
        # Send the same GET request multiple times
        for i in range(3):
            response = self.client.get(reverse('projectappeal-list'))
            responses.append(response.data)
        # Check all the responses in the list are identical
        # (Check from https://stackoverflow.com/a/3844832)
        self.assertTrue(responses[:-1] == responses[1:])

    def test_response_time(self):
        start_time = time.time()
        response = self.client.get('/api/appeals/')
        end_time = time.time()

        self.assertLess(end_time - start_time, 0.2)


    # FILTERING/SEARCH TESTS
    
    # Passing query params returns correctly filtered results
    def test_search_filtering(self):
        # Create titles - some contain the search keyword, others don't
        search_keyword = 'emergency_food_aid'
        appeal_titles = [
            f'{search_keyword} relief - Nepal 2024',
            f'{search_keyword} aid 2024',
            'Other title',
            'Other title 2'
        ]
        # Create multiple project appeals, with the titles
        appeals = ProjectAppealFactory.create_batch(size=3, is_live=True) 
        for index, appeal in enumerate(appeals + [self.appeal]):
            appeal.title = appeal_titles[index]
            appeal.save()

        # Search for appeals containing the keyword
        response = self.client.get(
            reverse('projectappeal-list'), {'search': search_keyword }
        )

        # Check that the appropriate appeals (here, the first and second)
        # are returned
        for index, appeal in enumerate(response.data):
            actual_data = ProjectAppealListSerializer(appeals[index]).data
            self.assertEqual(dict(appeal), actual_data)

    # Passing a query param with no search results returns an empty list
    def test_filtering_no_results(self):
        # Create appeals with titles and subtitles - none contain the search keyword
        search_keyword = 'emergency_food_aid'
        appeal_data = [
            {'title': 'Title 1', 'subtitle': 'Subtitle 1'},
            {'title': 'Recycling campaign, London, 2024', 'subtitle': 'Getting London recycling.'},
            {'title': 'Help the homeless - a Christmas appeal', 'subtitle': 'Give generously to help rough sleepers find a home.'}
        ]
        appeals = [ProjectAppealFactory.create(is_live=True, **d) for d in appeal_data]

        # Search for appeals containing the keyword
        response = self.client.get(
            reverse('projectappeal-list'), {'search': search_keyword }
        )

        # Check that no results were returned
        self.assertEqual(len(response.data), 0)
        # self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
