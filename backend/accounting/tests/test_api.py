from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIRequestFactory
from rest_framework import status

from django.urls import reverse, resolve
from accounting.models import (
    AccountType, Country, Profile, ProfileCharity
)
from accounting.model_factories import (
    AccountTypeFactory, CountryFactory,
    ProfileFactory,
    ContactFactory,
    CharityFactory,
    ProfileCharityFactory
)
import random
import time

# TODO: may have to put good data/bad data/other data in a JSON to parameterise
# tests
# param_list = [
#     {
#         'model': Indicator,
#         'factory': IndicatorFactory,
#         'dependent_models': [
#             { 'model': Service, 'factory': ServiceFactory },
#             { 'model': Project, 'factory': ProjectFactory },
#         ]
#     },
#     {
#         'model': Service
#     }
# ]


# TODO: put tests repeated across all endpoints here, and parameterise
# Credit; authenticate() and test_post() from https://www.youtube.com/watch?v=NyWY2OktDAs
# TODO: separate classes for ViewSets (all methods), APIViews/ListAPIViews (list/retrieve only)
class AccountTypeAPITest(APITestCase):
    # model_class = models.AccountType
    account_type = None
    country = None
    charity = None
    user = None
    profile = None
    charity_profile = None

    # # TODO: re-enable if necessary
    def authenticate(self):
        # new_user = User.objects.create_user('test', 'test123@gmaiil.com', 'test123')
        self.client.post(reverse('register'), {
                         'username': 'testing', 'password': 'test123'})
        response = self.client.post(reverse('login'), {
            'username': 'test',
            'password': 'test123'
        })
        token = response.data['tokens']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def setUp(self):
        # # Create a dummy user
        # self.user = User.objects.create(username='test', password='test123')

        # TODO: create the factory instances, in the order given
        # for model in self.
        self.account_type = AccountTypeFactory.create()
        # Database objects must belong to a charity - user must belong to the same charity:
        # Set up these relationships in the test data
        self.user = User.objects.create_user(
            username='test123@testing', password='test123')
        # self.client.login(username=self.user.username,
        #                   password=self.user.password)
        self.client.force_authenticate(user=self.user)
        self.charity = CharityFactory.create()
        self.profileCharity = ProfileCharityFactory.create(
            profile=self.user.profile,
            charity=self.charity)

        self.country = CountryFactory.create(parent_charity=self.charity.uuid)

        # Another way to instantiate the client
        self.factory = APIRequestFactory()

        # Get the view we are trying to test from parameters
        # self.view = model_class.as_view({'get': 'list'})

        # self.url = reverse()
        # self.uri = f'/api/{modelClass.__name__.lower()}'

    def tearDown(self):
        AccountType.objects.all().delete()
        ProfileCharity.objects.all().delete()
        Profile.objects.all().delete()
        User.objects.all().delete()
        Country.objects.filter(parent_charity=getattr(
            self.charity, 'uuid', None)).delete()

    # >>>>>>>> TESTING ROUTING >>>>>>>>>>>
    # Code adapted from my Advanced Web Development midterm assignment
    def test_correct_URL_generated(self):

        # Test that the URL created for the endpoint for our dummy object is correct
        # by comparing with the expected value (e.g. 'api/v1/account_types/1')
        created_object_id = self.account_type.id
        created_object_url = reverse(
            'accounttype-detail', kwargs={'pk': created_object_id})
        self.assertEqual(created_object_url,
                         f'/api/v1/account_types/{created_object_id}/')

    def test_correct_view_selected(self):
        # Check that the correct view function is called from the URL
        resolver = resolve(f'api/v1/account_types/1')
        retrieved_view = resolver._func_path.rsplit('.', 1)[1]
        self.assertEqual(retrieved_view, 'AccountTypeViewSet')

    # >>>>>>>>>>>> TESTING RESPONSE STATUS CODES >>>>>>>>>>>

    def test_200_on_valid_GET(self):
        # Test that a 200 status code is returned for a valid GET request
        valid_id = self.account_type.id
        response = self.client.get(
            reverse('accounttype-list'), kwargs={'pk': valid_id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_404_on_invalid_GET(self):
        # Test that a 404 'Not Found' code is returned on trying to access an invalid
        # object
        incorrect_id = self.account_type.id + random.randint(100, 1000)
        response = self.client.get(
            reverse('accounttype-list'), kwargs={'pk': incorrect_id})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_201_on_valid_POST(self):
        # Test that a 201 status code is returned for a valid POST request
        data = {
            'name': 'Test account type',
            'code': '600'
        }
        response = self.client.post(reverse('accounttype-list'), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_204_on_valid_DELETE(self):
        # Test that a 204 is returned after a DELETE *and* the deleted
        # object is no longer available
        response = self.client.delete(
            # reverse('accounttype-detail', kwargs={'pk': self.account_type.id})
            reverse('country-detail', kwargs={'pk': self.country.iso_code})
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        check_available = self.client.get(
            # reverse('accounttype-detail', kwargs={'pk': self.account_type.id})
            reverse('country-detail', kwargs={'pk': self.country.iso_code})
        )
        self.assertEqual(check_available.status_code,
                         status.HTTP_404_NOT_FOUND)

    def test_405_on_invalid_method(self):
        # Try to send a POST to a detail endpoint (which do not support POSTs)
        response = self.client.post(
            reverse('accounttype-detail',
                    kwargs={'pk': self.account_type.id + random.randint(20, 70)})
        )
        self.assertEqual(response.status_code,
                         status.HTTP_405_METHOD_NOT_ALLOWED)

    # def test_post(self):
    #     # For each test, get the url for the view and method we want to test

    #     request = self.factory.get(self.url)
    #     request.user = self.user
    #     response = self.view(request)

    #     # Create mock data for the view, and pass to test here

    #     self.assertEqual(response.status_code, 200)
    #     # etc.

    # def test_list_view(self):
    #     # TODO: authenticate to view
    #     self.authenticate()

    #     response = self.client.get('/api/projects/')
    #     self.assertEqual(response.status_code, 200)


    def test_response_headers(self):
        response = self.client.get('/api/projects/')
        self.assertEqual(response['Content-Type'], 'application/json')
        self.assertEqual(response['Content-Language'], 'en')
        # Test for:

        # Cache-Control: no-cache, no-store, must-revalidate
        # Pragma: no-cache
        # Expires: 0

        # Access-Control-Allow-Credentials: true
        # Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS

        # From https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html
        # server: server # Changed to non-informative value to prevent fingerprinting
        # X-Frame-Options: DENY
        # X-XSS-Protection: 0
        # X-Content-Type-Options: nosniff
        # Referrer-Policy: strict-origin-when-cross-origin
        # Permissions-Policy: geolocation=(), camera=(), microphone=()

        # Avoid this one untl you know how to use it
        # Strict-Transport-Security: max-age=63072000; includeSubDomains; preload

        # I think this is set by Django (include front-end domains here, allows them to access the data requested)
        # Access-Control-Allow-Origin: localhost or *

        # Content-Security-Policy: default-src 'self' CHECK iF YOU NEED A WHItELIST

        # Expect-CT: enforce, max-age=86400
        # Permissions-policy: IS THIS NECESSARY?

    # Check that nested resources are accessible at their respective endpoints
    # TODO: indicate nested fields separately in the input data JSON/dict
    def test_nesting(self):
        # TODO: create a nested resource (e.g. Address), go to the sub-resource (e.g. City)
        # endpoint and check that the new sub-resource is present
        pass

    # The happy path
    def test_tenancy_success(self):
        response = self.client.get(reverse('country-list'))
        # Check that the response is successful
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check that the objects retrieved belong to the user's charity
        self.assertEqual(response.data[0].get(
            'parent_charity'), self.charity.uuid)

    # TODO: test that if user hasn't joined/created a charity yet, they cannot
    # access any resources
    def test_tenancy_failsOnNoTenant(self):
        # TODO: check NoTenantError is raised
        pass

    # TODO: test that GET/POST/PUT etc. fail when accessing a resource
    # belonging to another tenant
    def test_tenancy_failsOnInvalidID(self):
        # TODO: create 2 users, each cretes one object; check
        # one can't access the other

        # TODO: test that WrongTenantError is raised in both cases
        pass

    # TODO: test that accessing an object belonging to a charity other than the
    # one selected (but one to which the user still belongs) also fails

    def test_tenant_failsOnInvalidSelection(self):
        pass

    def test_response_time(self):
        start_time = time.time()
        response = self.client.get('/api/projects/')
        end_time = time.time()

        self.assertLess(end_time - start_time, 0.2)

    def test_update(self):
        # Test that updating an existing model object works
        new_data = {'name': 'Newlandia'}
        response = self.client.patch(
            reverse(
                'country-detail',
                kwargs={'pk': self.country.iso_code}),
            data=new_data
        )
        # self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check that the field has been updated successfully with a
        # second GET request
        check_response = self.client.get(
            reverse('country-detail', kwargs={'pk': self.country.iso_code}))
        self.assertEqual(new_data['name'], check_response.data['name'])

    def test_GET_idempotent(self):
        responses = []
        # Send the same GET request multiple times
        for i in range(3):
            response = self.client.get(reverse('expense-list'))
            responses.append(response)
        # Check all the responses in the list are identical
        # (Check from https://stackoverflow.com/a/3844832)
        self.assertTrue(responses[:-1] == responses[1:])


# TODO: put endpoint-specific tests here


# class DonorAPITest(APITestCase):
#     '''For example, test the 'Donor' endpoints here'''
#     pass
