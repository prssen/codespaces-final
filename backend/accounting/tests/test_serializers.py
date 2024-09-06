from django.core.exceptions import ValidationError
from django.test import TestCase
from contextlib import contextmanager
from rest_framework.test import APITestCase
from accounting.models import (
    Expense, Profile, Charity, ProfileCharity
)
from accounting.model_factories import (
    ExpenseFactory,
    ProfileFactory,
    CharityFactory,
    ProfileCharityFactory
)
from django.contrib.auth.models import User


class ValidationErrorTestMixin(object):
    # TODO: adapt to work with serializers (as you're not doing much Django model validation)
    # From goodcode.io/articles/django-assert-raises/validationerror/

    @contextmanager
    def assertValidationErrors(self, fields):
        """
            Assert that a validation error is raised, contains the specified fields
            and only the specified fields.
        """

        try:
            yield  # TODO: What does this do?
            raise AssertionError("Validation error not raised")
        except ValidationError as e:
            self.assertEqual(set(e.message_dict.keys()), set(fields))


# TODO: test for the following:
# - upper and lower bounds of min/max validator constraints (on models or serializers)
# - unique constraints
# - only allowable values are permitted for ChoiceFields
# - money fields are stored as the correct type (see https://www.vinta.com.br/blog/how-i-test-my-drf-serializers)
# MAKE SURE YOU CALL REFRESH_FROM_DB() AFTER CREATING A MODEL INSTANCE (to make sure DB is updated,
# data types are transformed correctly, etc.)

# - that the serializer is valid/invalid with partial and full update, partial/full create, partial/full delete, list and retrieve

# TODO: include these test cases in your serialiser tests
class SerializerTests(APITestCase, ValidationErrorTestMixin):
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

    def tearDown(self):
        Expense.objects.all().delete()
        ProfileCharity.objects.all().delete()
        Charity.objects.all().delete()
        Profile.objects.all().delete()
        User.objects.all().delete()

    def test_successOnValidInput(self):
        pass

    # Fails when nested fields are not provided
    def test_failOnMissingNestedFields(self):
        pass

    # Passes when nested fields are flattened
    def test_successOnValidFlatInput(self):
        pass

    # Passes when nested fields are in an incorrect but
    # non-ambiguous position
    def test_successOnDifferentNesting(self):
        pass

    # Fails when nested fields are in an incorrect position
    # that makes their meaning ambiguous
    def test_failureOnAmbiguousNesting(self):
        pass

        # FROM COPILOT
    # def test_serializer_validates(self):
    #     serializer = MySerializer(data={'name': 'John'})
    #     self.assertTrue(serializer.is_valid())
