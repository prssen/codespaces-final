from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIRequestFactory
from accounting.models import Supplier

class SupplierAPITest(APITestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.view = Supplier.as_view({'get': 'list'})
        self.url = reverse('supplier-list')

    def test_list_view(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)

    def test_create_supplier(self):
        data = {
            'name': 'Test Supplier',
            'address': '123 Test Street',
            'phone_number': '1234567890',
            # Add any other required fields here
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, 201)
        # Add any other assertions to verify the response data

    def test_retrieve_supplier(self):
        supplier = Supplier.objects.create(name='Test Supplier', address='123 Test Street', phone_number='1234567890')
        url = reverse('supplier-detail', kwargs={'pk': supplier.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        # Add any other assertions to verify the response data

    def test_update_supplier(self):
        supplier = Supplier.objects.create(name='Test Supplier', address='123 Test Street', phone_number='1234567890')
        url = reverse('supplier-detail', kwargs={'pk': supplier.pk})
        data = {
            'name': 'Updated Supplier',
            'address': '456 Updated Street',
            'phone_number': '9876543210',
            # Add any other fields to update here
        }
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, 200)
        # Add any other assertions to verify the updated data

    def test_delete_supplier(self):
        supplier = Supplier.objects.create(name='Test Supplier', address='123 Test Street', phone_number='1234567890')
        url = reverse('supplier-detail', kwargs={'pk': supplier.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)
        # Verify that the supplier has been deleted