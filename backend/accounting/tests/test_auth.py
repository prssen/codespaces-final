# Test cases for authentication and multi-tenancy logic
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.exceptions import ErrorDetail
from accounting.model_factories import DonationFactory, ExpenseFactory, ProfileCharityFactory, CharityFactory
from accounting.serializers import ExpenseSerializer

class AuthTestCase(APITestCase):
    # set up: create user?
    user = None
    charity1 = None
    charity2 = None
    charity1_expense = None
    charity2_expense = None
    credentials = None

    def setUp(self):
        self.credentials = {
            'username': 'test123@testing',
            'password': 'test123'
         }
        self.user = User.objects.create_user(**self.credentials)
        [ self.charity1, self.charity2 ] = CharityFactory.create_batch(size=2)
        ProfileCharityFactory.create(profile=self.user.profile, charity=self.charity1)
        ProfileCharityFactory.create(profile=self.user.profile, charity=self.charity2)
        self.charity1_expense = ExpenseFactory.create(parent_charity=self.charity1.uuid)
        self.charity2_expense = ExpenseFactory.create(parent_charity=self.charity2.uuid)


    # Can create a user with valid credentials
    def test_valid_accounting_registration(self):
        credentials = {
            'username': 'testuser123',
            'password1': 'changepassword',
            'password2': 'changepassword'
        }
        response = self.client.post(reverse('accounting-register'), credentials)
        print(response)
        print('Response data: ', response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # self.assertEqual(response.data['username'], self.credentials['username'])

    # Login is successful with valid credentials
    def test_success_on_valid_accounting_login(self):
        register_credentials = {
            'username': 'testuser123',
            'password1': 'changepassword',
            'password2': 'changepassword'
        }
        login_credentials = {
            'username': register_credentials['username'],
            'password': register_credentials['password1'],
        }
        # Create user before logging them in
        self.client.post(reverse('accounting-register'), register_credentials)
        login_response = self.client.post(reverse('accounting-login'), login_credentials)
        # print(login_response.data)
        # print('Response data: ', response.data)
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        
        # Assert data returned on valid login has the correct structure
        self.assertIn('key', login_response.data)
        self.assertEqual(login_response.data['has_charity'], 'false')
        self.assertEqual(login_response.data['selected_charity'], None)
        # self.assertEqual(response.data['username'], self.credentials['username'])

    # Login fails with invalid user credentials
    def test_fail_on_invalid_accounting_login(self):
        invalid_credentials = {
            'username': 'invaliduser123',
            'password': 'changepassword4883'
        }
        response = self.client.post(reverse('accounting-login'), invalid_credentials)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {
            'non_field_errors': [ErrorDetail(string='Unable to log in with provided credentials.', code='invalid')]}
        )
        

    # Registration fails when passwords do not match
    def test_fail_when_passwords_conflict_accounting_registration(self):
        # 2nd password does not match the first
        invalid_credentials = {
            'username': 'testuser123',
            'password1': 'changepassword',
            'password2': 'changepassword123Different'
        }
        response = self.client.post(reverse('accounting-register'), invalid_credentials)
        print(response, response.data)
        # Check that correct status code and error is raised
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['non_field_errors'][0], "The two password fields didn't match.")

    # Registration fails when user already exists
    def test_fail_on_duplicate_user_accounting_registration(self):
        duplicate_credentials = {
            'username': 'test123@testing',
            'password1': 'test123',
            'password2': 'test123'
         }
        # Try to register the user we have already created
        register_response = self.client.post(reverse('accounting-register'), duplicate_credentials)

        self.assertEqual(register_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(register_response.data['username'][0], "A user with that username already exists.")


    # Registration fails when password is too short and common
    def test_fail_on_short_common_password_accounting_registration(self):
        short_password_credentials = {
            'username': 'testuser123',
            'password1': 'abc',
            'password2': 'abc'
        }
        register_response = self.client.post(reverse('accounting-register'), short_password_credentials)
        
        self.assertEqual(register_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(register_response.data['password1'], [
                ErrorDetail(string='This password is too short. It must contain at least 8 characters.', code='password_too_short'),
                ErrorDetail(string='This password is too common.', code='password_too_common')
        ])


    # MULTITENANCY TESTS

    # User cannot access database object with a different tenant ID
    def test_get_fails_on_invalid_tenant_ID(self):
        # Create new database objects
        new_charity = CharityFactory.create()
        charity_donation = DonationFactory.create(parent_charity=new_charity.uuid)
        
        # User cannot access donation, as it has a different parent_charity
        self.client.force_authenticate(user=self.user)
        response = self.client.get(reverse('donation-detail', kwargs={'uuid': charity_donation.uuid}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


    # Updating the selected charity changes the charity data the user can access
    def test_update_charity_affects_user_data(self):
        self.client.force_authenticate(user=self.user)

        # User selects charity1
        self.client.patch(
            reverse(
                'profile_charities-detail', 
                kwargs={'uuid': self.charity1.uuid}
            ),
            data={'selected': True}
        )
        # Check that user can access charity1, but not charity2's expense
        charity1_response = self.client.get(reverse('expense-detail', kwargs={'pk': self.charity1_expense.id}))
        self.assertEqual(charity1_response.status_code, status.HTTP_200_OK)
        self.assertEqual(charity1_response.data, ExpenseSerializer(self.charity1_expense).data)

        charity2_response = self.client.get(reverse('expense-detail', kwargs={'pk': self.charity2_expense.id}))
        self.assertEqual(charity2_response.status_code, status.HTTP_404_NOT_FOUND)
        
        # User selects charity2
        self.client.patch(
            reverse(
                'profile_charities-detail', 
                kwargs={'uuid': self.charity2.uuid}
            ), 
            data={'selected': True}
        )
        
        # Check that user can access charity2, but not charity1's expense
        charity1_response = self.client.get(reverse('expense-detail', kwargs={'pk': self.charity2_expense.id}))
        self.assertEqual(charity1_response.status_code, status.HTTP_200_OK)
        self.assertEqual(charity1_response.data, ExpenseSerializer(self.charity2_expense).data)

        charity2_response = self.client.get(reverse('expense-detail', kwargs={'pk': self.charity1_expense.id}))
        self.assertEqual(charity2_response.status_code, status.HTTP_404_NOT_FOUND)
        

        