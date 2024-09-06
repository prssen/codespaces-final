from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIRequestFactory
from rest_framework import status

from django.urls import reverse, resolve
from django.core.cache import cache
from accounting.models import (
    Project, Profile, ProfileCharity, Donation
)
from accounting.model_factories import (
    ProjectFactory,
    SupplierFactory,
    ProfileFactory,
    ContactFactory,
    CharityFactory,
    ProfileCharityFactory,
    TransactionFactory
)
from accounting.serializers import (
    ProjectSerializer,
    ProjectListSerializer,
    TransactionSerializer
)
from unittest.mock import patch
import random
import uuid
import datetime
import time
 
class ProjectAPITest(APITestCase):
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
        self.project = ProjectFactory.create(parent_charity=self.charity.uuid)

    def tearDown(self):
        cache.clear()
        # Donation.objects.all().delete()
        # Project.objects.all().delete()
        # ProfileCharity.objects.all().delete()
        # Profile.objects.all().delete()
        # User.objects.all().delete()

    # TESTING ROUTING
    def test_correct_URL_generated(self):
        # Test that the URL created for the endpoint for our dummy object is correct
        # by comparing with the expected value (e.g. 'api/v1/account_types/1')
        created_object_id = self.project.uuid
        created_object_url = reverse(
            'project-detail', kwargs={'uuid': created_object_id})
        self.assertEqual(created_object_url,
                         f'/api/v1/projects/{created_object_id}/')

    def test_correct_view_selected(self):
        # Check that the correct view function is called from the URL
        resolver = resolve(f'/api/v1/projects/')
        retrieved_view = resolver._func_path.rsplit('.', 1)[1]
        self.assertEqual(retrieved_view, 'ProjectViewSet')

    # TESTING STATUS CODES

    def test_200_on_valid_GET(self):
        valid_id = self.project.uuid
        response = self.client.get(
            reverse('project-list'), kwargs={'uuid': valid_id}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_404_on_invalid_GET(self):
        # Test that a 404 'Not Found' code is returned on trying to access an invalid
        # object
        # incorrect_id = self.project.id + random.randint(100, 1000)
        incorrect_id = str(uuid.uuid4())
        response = self.client.get(
            f'api/v1/projects/{incorrect_id}')
        # reverse('project-detail'),
        # kwargs={'pk': incorrect_id})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    @patch('accounting.api.brownie_blockchains.create_project', autospec=True)
    def test_201_on_valid_POST(self, blockchain_mock):
        # transaction_data = TransactionSerializer(TransactionFactory()).data
        # Test that a 201 status code is returned for a valid POST request
        data = {
            'parent_charity': str(self.charity.uuid),
            'name': 'Education Initiative, 2021',
            'start_date': str(datetime.date.today()),
            'services': [
                {
                    'name': 'School building',
                    'description': 'Building new schools in rural districts together with local government departments'
                },
                {
                    'name': 'Raising awareness',
                    'description': 'Holding workshops with local communities to raise awareness of the importance of education'
                }
            ],
            'target_donations': '1000.00',
        }
        response = self.client.post(reverse('project-list'), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_204_on_valid_DELETE(self):
        # Test that a 204 is returned after a DELETE *and* the deleted
        # object is no longer available
        response = self.client.delete(
            reverse('project-detail', kwargs={'uuid': self.project.uuid})
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        check_available = self.client.get(
            reverse('project-detail', kwargs={'uuid': self.project.uuid})
        )
        self.assertEqual(check_available.status_code,
                         status.HTTP_404_NOT_FOUND)

    def test_405_on_invalid_method(self):
        # Try to send a POST to a detail endpoint (which do not support POSTs)
        response = self.client.post(
            reverse('project-detail',
                    # kwargs={'pk': self.project.id + random.randint(20, 70)})
                    kwargs={'uuid': str(uuid.uuid4())})
        )
        self.assertEqual(response.status_code,
                         status.HTTP_405_METHOD_NOT_ALLOWED)

    # OTHER API TESTS

    def test_valid_payload_GET(self):
        # Create multiple projects
        batch_size = 3
        projects = ProjectFactory.create_batch(
            size=batch_size, parent_charity=self.charity.uuid)
        # Test length of output and contents
        response = self.client.get(
            reverse('project-list')
        )
        # Total number of project objects are the batch + single
        # project created in setUp()
        self.assertEqual(len(response.data), batch_size + 1)

        # Iterate through the project data returned and check it
        # matches
        for project, response in zip(projects, response.data[1:]):
            actual_data = ProjectListSerializer(project).data
            self.assertEqual(actual_data, response)

    def test_valid_update(self):
        # Test that updating an existing model object works
        new_data = {'name': 'New project name', 'target_donations': 1573}
        response = self.client.patch(
            reverse(
                'project-detail',
                kwargs={'uuid': self.project.uuid}),
            data=new_data
        )

        # Check that the field has been updated successfully with a
        # second GET request
        check_response = self.client.get(
            reverse('project-detail', kwargs={'uuid': self.project.uuid}))
        self.assertEqual(new_data['name'],
                         check_response.data['name'])
        self.assertEqual(float(new_data['target_donations']),
                         float(check_response.data['target_donations']))

    def test_invalid_create(self):
        # Test POST route fails with invalid payload
        bad_project = {
            'parent_charity': 'invalidUUID!!!',
            'name': 'name too long ' * 150,
            'start_date': '@993j03!',
            'target_donations': 'abcdef',
        }
        response = self.client.post(reverse('project-list'), bad_project)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_GET_idempotent(self):
        responses = []
        # Send the same GET request multiple times
        for i in range(3):
            response = self.client.get(reverse('project-list'))
            responses.append(response.data)
        # Check all the responses in the list are identical
        # (Check from https://stackoverflow.com/a/3844832)
        self.assertTrue(responses[:-1] == responses[1:])

    def test_response_time(self):
        start_time = time.time()
        response = self.client.get('/api/projects/')
        end_time = time.time()

        self.assertLess(end_time - start_time, 0.2)
