from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIRequestFactory
from rest_framework import status

from django.urls import reverse, resolve
from accounting.models import (
    Donation, Profile, ProfileCharity, Donation, Fund, 
    Account, AccountType, Transaction, TransactionDetail, 
    Donor
)
from accounting.model_factories import (
    DonationFactory,
    SupplierFactory,
    ProfileFactory,
    ContactFactory,
    CharityFactory,
    ProfileCharityFactory,
    TransactionFactory
)
from accounting.serializers import (
    DonationSerializer,
    DonationListSerializer,
    TransactionSerializer
)
import random
import uuid
import datetime
import time


class DonationAPITest(APITestCase):
    donation = None
    charity = None
    user = None
    profile = None
    charity_profile = None

    def setUp(self):
        self.user = User.objects.create_user(
            username='test123@testing', password='test123')
        self.client.force_authenticate(user=self.user)
        profile=ProfileFactory.create(user=self.user)
        self.charity = CharityFactory.create()
        self.profileCharity = ProfileCharityFactory.create(
            profile=self.user.profile,
            charity=self.charity)
        self.donation = DonationFactory.create(
            parent_charity=self.charity.uuid,
            received_by=self.user)
            # ,

    # def tearDown(self):
        # TransactionDetail.objects.all().delete()
        # Transaction.objects.all().delete()
        # Account.objects.all().delete()
        # AccountType.objects.all().delete()
        # Fund.objects.all().delete()
        # Donation.objects.all().delete()
        # Donor.objects.all().delete()
        # ProfileCharity.objects.all().delete()
        # Profile.objects.all().delete()
        # User.objects.all().delete()

    # TESTING ROUTING
    def test_correct_URL_generated(self):
        # Test that the URL created for the endpoint for our dummy object is correct
        # by comparing with the expected value (e.g. 'api/v1/account_types/1')
        created_object_id = self.donation.uuid
        created_object_url = reverse(
            'donation-detail', kwargs={'uuid': created_object_id})
        self.assertEqual(created_object_url,
                         f'/api/v1/donations/{created_object_id}/')

    def test_correct_view_selected(self):
        # Check that the correct view function is called from the URL
        resolver = resolve(f'/api/v1/donations/')
        retrieved_view = resolver._func_path.rsplit('.', 1)[1]
        self.assertEqual(retrieved_view, 'DonationViewSet')

    # TESTING STATUS CODES

    def test_200_on_valid_GET(self):
        valid_id = self.donation.id
        response = self.client.get(
            reverse('donation-list'), kwargs={'pk': valid_id}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_404_on_invalid_GET(self):
        # Test that a 404 'Not Found' code is returned on trying to access an invalid
        # object
        incorrect_id = self.donation.id + random.randint(100, 1000)
        response = self.client.get(
            f'api/v1/donations/{incorrect_id}')
        # reverse('donation-detail'),
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
    #         'donation_type': 'materials',
    #         'transaction': transaction_data
    #     }
    #     response = self.client.post(reverse('donation-list'), data)
    #     self.assertEqual(response.status_code, status.HTTP_201_CREATED)


    def test_204_on_valid_DELETE(self):
        # Test that a 204 is returned after a DELETE *and* the deleted
        # object is not returned in any subsequent queryset
        response = self.client.delete(
            reverse('donation-detail', kwargs={'uuid': self.donation.uuid})
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        check_available = self.client.get(
            reverse('donation-detail', kwargs={'uuid': self.donation.uuid})
        )
        self.assertEqual(check_available.status_code,
                         status.HTTP_404_NOT_FOUND)


    def test_405_on_invalid_method(self):
        # Try to send a POST to a detail endpoint (which does not support POSTs)
        response = self.client.post(
            reverse('donation-detail',
                    # kwargs={'pk': self.donation.id + random.randint(20, 70)})
                    # Generate a new random, incorrect UUID
                    kwargs={'uuid': str(uuid.uuid4())})
        )
        self.assertEqual(response.status_code,
                         status.HTTP_405_METHOD_NOT_ALLOWED)

    # OTHER API TESTS
    def test_valid_payload_GET(self):
        # Create multiple donations
        batch_size = 3
        donations = DonationFactory.create_batch(
            size=batch_size, parent_charity=self.charity.uuid)
        # Test length of output and contents
        response = self.client.get(
            reverse('donation-list')
        )
        # Total number of donation objects are the batch + single
        # donation created in setUp()
        self.assertEqual(len(response.data), batch_size + 1)

        # Iterate through the donation data returned and check it
        # matches
        for donation, response in zip(donations, response.data[1:]):
            actual_data = DonationListSerializer(donation).data
            print('Actual: ', actual_data)
            print('Response: ', dict(response))
            self.assertEqual(actual_data, dict(response))

    def test_valid_update(self):
        # Test that updating an existing model object works
        new_data = {
            'amount': 1111,
            'memo': 'Changed description of donation',
            'acknowledged': True
        }
        response = self.client.patch(
            reverse(
                'donation-detail',
                # kwargs={'pk': self.donation.id}),
                kwargs={'uuid': self.donation.uuid}),
            data=new_data
        )

        # Check that the field has been updated successfully with a
        # second GET request
        check_response = self.client.get(
            # reverse('donation-detail', kwargs={'pk': self.donation.id}))
            reverse('donation-detail', kwargs={'uuid': self.donation.uuid}))
        # for key in new_data:
        #     self.assertEqual(new_data[key], check_response.data[key])

        self.assertEqual(new_data['memo'], check_response.data['memo'])
        self.assertEqual(new_data['acknowledged'],
                         check_response.data['acknowledged'])
        self.assertEqual(self.user.username,
                         check_response.data['received_by'])
        self.assertEqual(float(new_data['amount']),
                         float(check_response.data['amount']))

    def test_invalid_create(self):
        # Test POST route fails with invalid payload

        bad_donation = {
            'id': 'ABC',
            'amount': '-74.2031.3',
            'acknowledged': 'Maybe',
            'received_by': random.randint(10000, 20000)}
        response = self.client.post(reverse('donation-list'), bad_donation)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_GET_idempotent(self):
        responses = []
        # Send the same GET request multiple times
        for i in range(3):
            response = self.client.get(reverse('donation-list'))
            responses.append(response.data)
        # Check all the responses in the list are identical
        # (Check from https://stackoverflow.com/a/3844832)
        self.assertTrue(responses[:-1] == responses[1:])

    def test_response_time(self):
        start_time = time.time()
        response = self.client.get('/api/donations/')
        end_time = time.time()

        self.assertLess(end_time - start_time, 0.2)
