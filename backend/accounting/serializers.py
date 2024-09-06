# TODO: use this to serialise choice fields - https://stackoverflow.com/a/54409752

from django.contrib.auth.models import User
from django.contrib.auth import authenticate, get_user_model
from django.urls import reverse
from django.conf import settings
from django.db.models import Subquery, OuterRef, Value, CharField
from django.db.models.functions import Concat
from djmoney.money import Money
from django.core.exceptions import ObjectDoesNotExist

from accounting.models import *  # TODO: change to named imports
from accounting import models as acc_models  # TODO: change models to these

from accounting.blockchain_provider import blockchain_provider
from accounting.models import Profile
from accounting.mixins import DynamicFieldsMixin
from accounting.exceptions import NoTenantError, InvalidDoubleEntry
from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from drf_writable_nested.mixins import UniqueFieldsMixin
from drf_writable_nested.serializers import WritableNestedModelSerializer
from djmoney.contrib.django_rest_framework.fields import MoneyField
from rest_framework_recursive.fields import RecursiveField
from dj_rest_auth.serializers import UserDetailsSerializer, LoginSerializer
from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.models import TokenModel
from django_countries.serializers import CountryFieldMixin
from django_countries.serializer_fields import CountryField
from web3 import Web3, HTTPProvider

import os
import json
import secrets

from .mixins import *  # TODO: remove wildcard import
from accounting.utils import ReadWriteSerializerMethodField


# TODO URGENT: optimise complex related queries with auto_prefetch, prefetch_related etc.
# see https://adamj.eu/tech/2020/09/01/django-and-the-n-plus-one-queries-problem/ and https://adamj.eu/tech/2021/01/21/simple-in-memory-caching-of-django-models-with-cachetools/
# speed handbook and other resources

# TODO FIXME: add mixin to enable field selection for list views
# TODO: add required=False everywhere for optional fields (except read-only ones)
# TODO: more validation:
# - Check constraints on field ranges, unique constraints
# - Logic e.g. payment not > original bill (put some in UI)
# -

# NOTE: GETTING Transaction, with Sourcedocument nested inside, will be tricky - because
# Foreign Key points to SourceDocument, and Django only returns SourceDocument instances when reverse accessing
# (Not the subclasses, e.g. Expense, Invoice). Can use django-polymorphic, or see SO for other solutions
# BUT, shouldn't be an issue, since I plan to GET a SourceDocument subclass, with Transactions nested inside it instead
# (other way round)

# class AccountingLoginSerializer(LoginSerializer):
#     # If user_type of related profile is not accounting, reject
#     def validate(self, attrs):
#         username = attrs.get("username")
#         password = attrs.get("password")

#         if username and password:
#             try:
#                 user = authenticate(username=username, password=password)
#                 if not user or user.profile.user_type != 1:
#                     msg = 'Invalid credentials'
#                     raise serializers.ValidationError(msg, code='authorization')
#             except (AttributeError, Profile.DoesNotExist):
#                 msg = 'Invalid credentials'
#                 raise serializers.ValidationError(msg, code='authorization')
#         attrs['user'] = user
#         return attrs

class AccountingRegisterSerializer(RegisterSerializer):
    def custom_signup(self, request, user):
        user.user_type = 1
        user.save()

class TrackerRegisterSerializer(RegisterSerializer):
    def custom_signup(self, request, user):
        user.user_type = 0
        user.save()

class AccountingLoginSerializer(LoginSerializer):
    selected_charity = serializers.SerializerMethodField()
    has_charity = serializers.SerializerMethodField()

    # class Meta(LoginSerializer.Meta):
    #     fields = LoginSerializer.Meta.fields + ['selected_charity', 'has_charity']

    def get_selected_charity(self):
        try:
            return self.user.profile.charities.filter(selected=True).first().charity.uuid
        except (AttributeError, ObjectDoesNotExist):
            return None

    def get_has_charity(self):
        try:
            return self.user.profile.charities.exists()
        except (AttributeError, ObjectDoesNotExist):
            return False


    def validate(self, attrs):
        attrs = super().validate(attrs)
        try:
            if attrs['user'].profile.user_type != 1:
                raise serializers.ValidationError("Invalid credentials")
        except (AttributeError, Profile.DoesNotExist):
            msg = 'Invalid credentials'
            raise serializers.ValidationError(msg, code='authorization')
        # attrs['selected_charity'] = self.get_selected_charity()
        # attrs['has_charity'] = self.has_charity()
        return attrs
 
class TrackerLoginSerializer(LoginSerializer):
    def validate(self, attrs):
        attrs = super().validate(attrs)
        try:
            if attrs['user'].profile.user_type != 0:
                raise serializers.ValidationError("Invalid credentials")
        except (AttributeError, Profile.DoesNotExist):
            msg = 'Invalid credentials'
            raise serializers.ValidationError(msg, code='authorization')
        return attrs


# class AccountingLogoutSerializer(LogoutSerializer):
    


# class AccountingRegisterView(RegisterView):
#     def performm_create(self, serializer)
#         serializer.save(self.request)
#         p = Profile.objects.get(user=serializer.instance,)
        

# class AccountingRegisterSerializer(RegisterSerializer):
#     # Create a User, add user_instance.user_type = ..., as flag for signal
#     class Meta:
#         model = get_user_model()

#     def save(self, request):
#         self.cleaned_data = self.get_cleaned_data()
#         adapter = get_adapter()
#         user = adapter.new_user(request)
#         for data in self.cleaned_data:
#             setattr(user, data)
#         user.user_type = 1
#         user.save()
#         adapter.save_user(request, user, self)
#         return user
        

class CustomTokenSerializer(serializers.ModelSerializer):
    # user = UserDetailsSerializer(read_only=True)
    user = serializers.SerializerMethodField()

    def get_user(self, obj):

        try:
            print('profile: ',  obj.user.profile.charities.filter(
                selected=True).first())
            return {
                'profile_id': obj.user.profile.uuid,
                'charity_id': obj.user.profile.charities.filter(selected=True).first().charity.uuid
            }
        except:
            # return UserDetailsSerializer(obj, read_only=True).data
            # raise ValidationError({'user': 'No profile associated with user'})
            return {
                'profile_id': None,
                'charity_id': None
            }

    class Meta:
        model = TokenModel
        fields = ('key', 'user', )


class BaseListSerializer(serializers.ListSerializer):
    """
        Added to all nested serializers to filter sub-resources by charity ID. 
        Idea from https://stackoverflow.com/a/28354281
    """

    def to_representation(self, data):
        current_charity = self.context['request'].user.profile.charities.filter(
            selected=True).first()
        data = data.filter(parent_charity=current_charity.charity.uuid)
        return super().to_representation(data)


class BaseSerializer(serializers.ModelSerializer):
    """
        Immplements multi-tenancy logic:
        - Adding tenant ID to database objects created,
        - Filtering nested fields by tenant ID.
    """
    class Meta:
        model = BaseModel
        fields = ['parent_charity']
        read_only_fields = ['parent_charity']
        list_serializer_class = BaseListSerializer

    # Get the charity the user belongs to and has currently selected
    def get_current_charity(self):
        try:
            charity = self.context['request'].user.profile.charities.filter(
                selected=True).first()
            return str(charity.charity.uuid)
        except (AttributeError, KeyError):
            # NoTenantError should already be raised by the ViewSet if request is not
            # accompanied with a parent_charity value - so no need to raise error here
            return None
            # raise NoTenantError(
            #     f"Cannot {self.context['request'].method} an object without belonging to a charity")

    def create(self, validated_data):
        # def to_internal_value(self, data):
        # Add the tenant ID (user's currently selected charity) to the model object being created
        current_charity = self.context['request'].user.profile.charities.filter(
            selected=True).first()
        if current_charity:
            validated_data['parent_charity'] = current_charity.charity.uuid
            # data['parent_charity'] = current_charity.charity.uuid
            
            return super().create(validated_data)
            # return validated_data
        
        # return super().to_internal_value(data)
        # TODO: this should fail if object is not associated with a tenant ID - throw a custom exception
        # when your code is robust enough to handle it + add unit tests
        raise NoTenantError(
            f'Cannot create a {self.__class__.Meta.model.__name__} until you have joined a charity')

    # TODO: delete this

    # # Credit: code adapted from GitHub Copilot (was stuck here!)
    # # (this filters by current charity in nested serializers - any RelatedField points
    # # to an object nested within the parent object, which we need to filter
    # # separately)
    # def to_representation(self, instance):
    #     data = super().to_representation(instance)

    #     for field_name, field in self.get_fields().items():
    #         if isinstance(field, serializers.RelatedField):
    #             related_queryset = field.get_queryset()
    #             current_charity = self.context['request'].user.profile.charities.filter(
    #                 selected=True).first()
    #             if current_charity:
    #                 filtered_queryset = related_queryset.filter(
    #                     parent_charity=current_charity.charity.uuid)
    #             field.queryset = filtered_queryset

    #     return data

    # def update(self, instance, validated_data):

    # def to_representation(self, instance):
    #     data = super().to_representation(instance)
    #     for field in self.Meta.fields:


# TODO: make all serializers inherit BaseSerializer AND add:
#    class Meta(BaseSerializer.Meta):
#         fields = BaseSerializer.Meta.fields + ('additional_field',)


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['pk', 'url', 'username', 'email', 'groups']


# class CountrySerializer(UniqueFieldsMixin, serializers.ModelSerializer):
class CountrySerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = Country
        fields = BaseSerializer.Meta.fields + ['iso_code', 'name']

        # validators = [
        #         UniqueTogetherValidator(queryset=Country.objects.all(), fields=['iso_code', 'name'], message='Country with this ISO code already exists.')
        # ]
        # extra_kwargs = {
        #     'name': {} # TODO: this is a hack - see midterm to find out how to maintain uniqueness constraint
        # }


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ['pk', 'name', 'code', 'state_area_code']


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['pk', 'name']


class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = ['pk', 'name']

# TODO: this currently changes the nested district, city, region etc.
# with each user who submits a slightly different variation in spelling
# Implement some proper validation (matching addresses to a real dataset)


# class AddressSerializer(WritableNestedModelSerializer):
class AddressSerializer(BaseSerializer, WritableNestedModelSerializer, CountryFieldMixin):
    district = DistrictSerializer(required=False, allow_null=True)
    city = CitySerializer(required=False, allow_null=True)
    region = RegionSerializer(required=False, allow_null=True)
    # country = CountrySerializer(required=False, allow_null=True)

    class Meta:
        model = Address
        fields = BaseSerializer.Meta.fields + ['pk', 'address1', 'address2', 'address3',
                                               'postal_code', 'district', 'city', 'region', 'country']

    # def to_internal_value(self, data):
    #     validated_data = super().to_internal_value(data)

    #     validated_data['parent_charity'] = self.context['request'].user

# TODO: delete - can't use ModelSerializer with abstract models


class NotificationSerializer(serializers.ModelSerializer):
    sender = serializers.SlugRelatedField(slug_field='name', read_only=True)
    receiver = serializers.SlugRelatedField(slug_field='name', read_only=True)
    receiver_uuid = serializers.UUIDField(source='receiver.uuid')
    notification_type = serializers.CharField(source='get_notification_type_display')

    class Meta:
        model = Notification
        fields = ['uuid', 'sender', 'receiver', 'timestamp', 'notification_type', 'message', 'is_seen', 'receiver_uuid']

    # def perform_create(self, serializer):
    #     serializer.save(sender=self.context['request'].user)


class ContactSerializer(BaseSerializer):
    address = AddressSerializer(required=False, allow_null=True)
    avatar = serializers.ImageField(required=False, allow_null=True)
    # blockchain_address = serializer.CharField(max_length=42, write_only=True, allow_null=True)

    # blockchain_id = serializers.SlugRelatedField(
    #     slug_field='blockchain_address',
    #     allow_null=True,
    #     queryset=acc_models.BlockchainUser.objects.all())

    class Meta:
        model = Contact
        fields = BaseSerializer.Meta.fields + \
            ['pk', 'phone_number', 'email', 'address', 'avatar', 'blockchain_id']
        
    # def create(self, validated_data):
    #     blockchain_address = validated_data.get('blockchain_id', None)
    #     # 'name' exists in Organisation subclasses, 'first_name' and 'last_namme' in Personn
    #     # subclasses - Contacts can only be one of these two, so the two conditions are effectively
    #     # mutually exclusive
    #     if 'name' in validated_data:
    #         name = validated_data('name')
    #     elif 'first_name' or 'last_name' in validated_data:
    #         name = f'{validated_data.get("first_name", None)} {validated_data.get("last_name", None)}'

    #     if blockchain_address:
    #         blockchain_user = acc_models.BlockchainUser.objects.create(
    #             blockchain_address=blockchain_address,
    #             name=name,
    #             avatar=validated_data.get('avatar', None)
    #         )
    #     return super().create(validated_data)


# class OrganisationSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Organisation
#         fields = ['name', 'sector']

class OrganisationSerializer(ContactSerializer):
    class Meta:
        model = Organisation
        fields = ContactSerializer.Meta.fields + ['name', 'sector']


class PersonSerializer(serializers.ModelSerializer):
    nationality = CountryField(allow_blank=True, required=False)
    
    class Meta:
        model = Person
        fields = '__all__'

class CharityListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Charity
        fields = ['avatar', 'name', 'uuid']


class CharitySerializer(DynamicFieldsMixin, WritableNestedModelSerializer):
    address = AddressSerializer(required=False, allow_null=True)
    # selected = serializers.BooleanField(required=False, read_only=True, allow_null=True, source='')
    # selected = serializers.SerializerMethodField()

    class Meta:
        model = Charity
        fields = ['legal_structure', 'legal_structure_other',
                  'charity_commission_number', 'slogan', 'mission',
                  'name', 'sector', 'uuid', 'phone_number', 'email', 'address', 'avatar', 'blockchain_id']

    # def get_selected(self, obj):
    #     return obj.profiles.filter(user=)

    def to_internal_value(self, data):
        address = data['address']
        if address:
            # Remove address fields in the form { 'field': { 'name' : ''}}
            # from the serialised input to avoid validation errors
            print(address)
            for field in ['district', 'city', 'region']:
                if field in address \
                        and isinstance(address[field], dict) \
                        and 'name' in address[field] \
                        and address[field]['name'] == '':
                    data['address'].pop(field)
            # Add a random UUID to pass AddressSerializer validation checks
            # (will be removed during is_valid() before saving the model obect)
            data['address']['parent_charity'] = uuid.uuid4()
        # Skipping BaseSerializer's to_internal_value(), which adds
        # a 'parent_charity' attribute (not meaningful in the
        # case of a Charity object itself)
        return serializers.ModelSerializer.to_internal_value(self, data)

    # # Add to context of nested AddressSerializer, so it correctly retrieves
    # # Credit: from GitHub Copilot suggestion
    # def get_fields(self):
    #     fields = super().get_fields()
    #     fields['address'].context.update({ 'type': 'new_charity'})
    #     return fields

    # To ensure Address contains a reference to the charity it belongs to,
    # create it afteer we have instantiated a Charity object
    # Credit: adapted from GitHub copilot suggestion
    def create(self, validated_data):
        address_data = validated_data.pop('address', None)
        charity = Charity.objects.create(**validated_data)
        if address_data:
            # Remove the dummy UUID we added to the address data to pass validation
            # checks
            address_data.pop('parent_charity', None)
            if (district := address_data.pop('district', None)):
                district_obj = District.objects.create(parent_charity = charity.uuid, **district)
                address_data['district'] = district_obj
            if (city := address_data.pop('city', None)):
                city_obj = City.objects.create(parent_charity = charity.uuid, **city)
                address_data['city'] = city_obj
            if (region := address_data.pop('region', None)):
                region_obj = Region.objects.create(parent_charity = charity.uuid, **region)
                # region_obj = Region.objects.create(**region)
                address_data['region'] = region_obj
            Address.objects.create(parent_charity=charity.uuid, **address_data)
        return charity

    # # Override the BaseSerializer create() method, as Charity is a special case
    # # (see corresponding create() method in ViewSet)
    # def create(self, validated_data):
    #     return serializers.ModelSerializer.create(self, validated_data)

    # TODO: validate that legal_structure_other is empty UNLESS
    # 'legal_structure' has a value of 'OTH' ('Other')

# TODO: make this updatable, so we can set the 'selected' property


class ProfileCharitySerializer(DynamicFieldsMixin, serializers.ModelSerializer):
    charity = CharitySerializer(fields=['uuid', 'name', 'mission', 'avatar'])

    class Meta:
        model = ProfileCharity
        fields = ['charity', 'selected']


class ProfileSerializer(serializers.ModelSerializer):
    profile_charities = ProfileCharitySerializer(
        many=True, fields=['charity', 'selected'], source='charities')
    address = AddressSerializer(required=False, allow_null=True)

    def validate_blockchain_id(self, blockchain_id):
        if not Web3.is_address(blockchain_id):
            raise serializers.ValidationError(
                'Please enter a valid Ethereum address')
        return blockchain_id

    class Meta:
        model = Profile
        fields = ['pk', 'blockchain_id', 'notifications_enabled', 'profile_charities',
                  'user_type', 'first_name', 'last_name', 'user',
                  'uuid', 'phone_number', 'email', 'address', 'avatar']


class LocationSerializer(WritableNestedModelSerializer):
    address = AddressSerializer(required=False, allow_null=True)

    class Meta:
        model = Location
        fields = ['name', 'address', 'latitude', 'longitude']

    def create(self, validated_data):
        address_data = validated_data.pop('address')
        address = Address.objects.create(**address_data)

        location = Location.objects.create(**validated_data)
        return location


class ActivityAttachmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = ActivityAttachment
        fields = ['uuid', 'activity', 'file', 'is_public']


class ActivitySerializer(serializers.ModelSerializer):
    # attachments = serializers.SlugRelatedField(
    #     many=True,
    #     required=False,
    #     allow_null=True
    #     slug_field='file',
    #     queryset=ActivityAttachment.objects.all(),
    # )
    attachments = ActivityAttachmentSerializer(
        many=True, required=False, allow_null=True)
    
    location = LocationSerializer(required=False, allow_null=True)

    class Meta:
        model = Activity
        fields = ['date', 'start_time', 'end_time', 'status',
                  'title', 'notes', 'attachments', 'location', 'indicator_amount']
 

class CreateActivitySerializer(BaseSerializer):
    # attachments = serializers.FileField(many=True, required=False)
    attachments = serializers.ListField(
        child=serializers.FileField(
            # max_length=100000,
            required=False,
            allow_empty_file=True,
            allow_null=True
        ), required=False
    )
    location = LocationSerializer(required=False, allow_null=True)

    class Meta:
        model = Activity
        fields = ['date', 'start_time', 'end_time', 'status',
                  'title', 'notes', 'indicator', 'location', 'attachments', 'indicator_amount']

    def to_internal_value(self, data):
        indicator = Indicator.objects.get(uuid=data['indicator'])
        # # New value
        # indicator = Indicator.objects.get(pk=data['indicator'])

        # data._mutable = True
        # data['indicator'] = indicator.id

        data_copy = data.copy()
        data_copy['indicator'] = indicator.id

        # Handle the empty string and other nullish values
        # by removing from serialised input
        # if not data.get('attachments'):
        #     data.pop('attachments', None)
        if not data_copy.get('attachments'):
            data_copy.pop('attachments', None)
        print('Check this is called: ', data)
        # return super().to_internal_value(data)
        return super().to_internal_value(data_copy)

    def create(self, validated_data):
        validated_data = super().create(validated_data)
        attachments_data = validated_data.pop('attachments', None)
        # indicator_uuid = validated_data.pop('indicator', None)
        # # Create Activity object and related ActivityAttachment instances
        # indicator = Indicator.objects.get(uuid=indicator_uuid)
        # print('indicator: ', indicator)
        location_data = validated_data.pop('location', None)
        location_serializer = LocationSerializer(data=location_data)

        if (location_serializer.is_valid()):
            location = location_serializer.save()
            # location = Location.objects.create(**location_data)
            activity = Activity.objects.create(location=location, **validated_data)
        else:
            activity = Activity.objects.create(**validated_data)

        if attachments_data:
            for attachment in attachments_data:
                ActivityAttachment.objects.create(
                    file=attachment,
                    activity=activity
            )
        return activity


class IndicatorUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = IndicatorUnit
        fields = ['uuid', 'name']


class IndicatorSerializer(WritableNestedModelSerializer):
    activities = ActivitySerializer(many=True, allow_null=True, required=False)

    # TODO: check and debug if options don't work
    actual = serializers.DecimalField(
        max_digits=15, decimal_places=2, read_only=True, required=False, allow_null=True, min_value=0, coerce_to_string=True)
    progress = serializers.DecimalField(
        max_digits=15, decimal_places=2, read_only=True, required=False, allow_null=True, min_value=0, coerce_to_string=True)
    unit = IndicatorUnitSerializer()

    service = serializers.PrimaryKeyRelatedField(queryset=acc_models.Service.objects.all(), write_only=True)

    class Meta:
        model = Indicator
        fields = ['uuid', 'activities', 'service', 'name', 'target_quantity',
                  'actual', 'progress', 'unit', 'description', 'is_cumulative']
        extra_kwargs = {
            'service': {'write_only': True}
        }

    # def to_internal_value(self, data):
    #     validated_data =  super().to_internal_value(data)
    #     if validated_data['activities'] == '':
    #         validated_data['activities'] = None
    #     return validated_data


class ServiceSerializer(serializers.ModelSerializer):
    indicators = IndicatorSerializer(many=True, required=False, allow_null=True)

    class Meta:
        model = Service
        fields = ['indicators', 'uuid', 'name', 'description']


class ProjectListSerializer(BaseSerializer):
    class Meta:
        model = Project
        fields = BaseSerializer.Meta.fields + ['uuid', 'name', 'start_date']

# Just the Project object
class ProjectSerializer(BaseSerializer, DynamicFieldsMixin):
    services = ServiceSerializer(many=True, required=False, allow_null=True)
    actual_donations = MoneyField(
        max_digits=19, decimal_places=4, read_only=True, required=False, allow_null=True)

    class Meta:
        model = Project
        fields = BaseSerializer.Meta.fields + ['services', 'actual_donations', 'uuid', 'name',
                                               'start_date', 'end_date', 'target_donations']

    def to_internal_value(self, data):
        # if data['services'] == '':
        #     del data['services']
        print(data)
        return super().to_internal_value(data)

    # def create(self, validated_data):
    #     instance = super().create(validated_data)
    #     # Once project record is created, add to blockchain
    #     blockchain_provider.create_project(instance)

        """
        # TODO: check this works and add Project
        w3 = Web3(HTTPProvider('http://localhost:8545'))
        print("Latest Ethereum block number", w3.eth.block_number)

        # Get ABI (Application Binary Interface) and address of smart contract from its
        # JSON build file (located in settins.CONTRACT_ABI_DIR)
        contract_file = os.path.join(settings.CONTRACT_ABI_DIR, 'Projects.json')
        with open(contract_file, 'r') as file:
            contract_metadata = json.load(file)
            contract_abi = contract_metadata['abi']
            # Get the address of the most recent deployment
            last_deployment = list(contract_metadata['networks'])[-1]
            contract_address = contract_metadata['networks'][last_deployment]['address']

        # Use ABI and address to access smart contract
        contract = w3.eth.contract(address=contract_address, abi=contract_abi)

        # project_uuid = validated_data['uuid'].encode('utf-8')
        # project_uuid = Web3.soliditySha3(['string'], [str(validated_data['uuid'])])
        
        # Smart contract requires UUID as a 'bytes32'  object, so a 32-byte encrypted string is generated 
        # to access the project. Ensure we remove dashes from the UUID before conversion:
        # '8fd1e7e8-2cd1-4181-abb2-e755b47b72b2' -> '8fd1e7e82cd14181abb2e755b47b72b2'
        project_uuid = Web3.keccak(text=str(instance.uuid).replace('-', ''))

        # project_name = validated_data['name']
        # project_start_date = validated_data['start_date']
        project_name = instance.name
        # Convert project start date to an integer UNIX timestamp, discarding fractions of seconds
        project_start_date = datetime.datetime.combine(instance.start_date, datetime.time())
        project_start_date_timestamp = str(int(project_start_date.timestamp()))

        # TODO: replace 'from' (currently default account created by Ganache)
        # with address of blockchain user
        tx_hash = contract.functions.setProject(project_uuid, project_name, project_start_date_timestamp).transact({ 'from': w3.eth.accounts[0]})

        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        print(tx_receipt)
        # TODO: replace bytes32 conversion code with web3.py/other internet code
        # random_project_id = 'hello world'.encode('utf-8').ljust(32, b'\0')
        # projects = contract.functions.projects(random_project_id).call()
        # print(projects)
        """


class ProjectGallerySerializer(WritableNestedModelSerializer):
    # project = ProjectAppealSerializer(allow_null=True)

    class Meta:
        model = ProjectGallery
        fields = '__all__'


class ProjectUpdatesMediaSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProjectUpdatesMedia
        fields = ['media']


# TODO: FINISH ADDING RELATED_NAMES SO REVERSE RELATIONS WORK!!!!!
class ProjectAppealUpdatesSerializer(serializers.ModelSerializer):
    media = ProjectUpdatesMediaSerializer(many=True, allow_null=True)

    class Meta:
        model = ProjectAppealUpdate
        fields = ['update_title', 'text', 'media']


class ProjectTransactionSerializer(serializers.Serializer):

    # # TODO: find out how to get the subclass a model instance belongs to,
    # # to be able to print out 'transaction type' here
    # transaction_type = serializers.SerializerMethodField()
    # def get_transaction_type(self, obj):
    #     obj.source_doc.expense?

    date = serializers.DateField()
    description = serializers.CharField()
    amount = MoneyField(max_digits=19, decimal_places=4)
    dr_account = serializers.CharField(max_length=200)
    cr_account = serializers.CharField(max_length=200)
    fund = serializers.SlugRelatedField(
        queryset=Fund.objects.all(), slug_field='name', allow_null=True)
    # Hyperlink to the transaction detail endpoint where the transaction
    # can be viewed in its entirety
    link = serializers.URLField(allow_blank=True)

# Read-only project object, and all related information except transactions
# For charity appeals page
# TODO: make this serializer read-only


class ProjectAppealSerializer(DynamicFieldsMixin, WritableNestedModelSerializer):
    # project = ProjectSerializer(read_only=True)
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all())
    target_donations = MoneyField(
        max_digits=19, decimal_places=4, read_only=True, required=False, allow_null=True, source='project.target_donations'
    )
    # actual_donations = MoneyField(
    #     max_digits=19, decimal_places=4, read_only=True, required=False, allow_null=True, source='project__actual_donations'
    # )
    actual_donations = serializers.DecimalField(
        max_digits=19, decimal_places=4, read_only=True, required=False, allow_null=True, source='project.actual_donations'
    )
    updates = ProjectAppealUpdatesSerializer(
        many=True, required=False, allow_null=True)
    photos = ProjectGallerySerializer(
        many=True, required=False, allow_null=True)
    charity_uuid = serializers.UUIDField(
        source="project.parent_charity", 
        required=False, 
        allow_null=True)

    class Meta:
        model = ProjectAppeal
        fields = ['uuid', 'project', 'updates', 'photos', 'title', 'subtitle', 'date_started', 'date_ended', 'story', 'is_live', 'charity_name', 'charity_uuid', 'actual_donations', 'target_donations']


class ProjectAppealListSerializer(serializers.ModelSerializer):
    """
        TODO: just the title, subtitle, photo, location/date started
        Filter by 'is_live'
    """
    # photo = serializers.ImageField(source='photos.first.photo')
    # avatar = serializers.ImageField(source='photos.last.photo')
    photo = serializers.ImageField(source='get_photo')
    avatar = serializers.ImageField(source='get_avatar')

    class Meta:
        model = ProjectAppeal
        fields = ['uuid', 'title', 'subtitle', 'photo', 'charity_name', 'avatar', 'date_started', 'is_live']


class ProjectSummarySerializer(serializers.ModelSerializer):
    # - Proportion of expenses spent + total activites by indicator for impact
    # TODO FIXME: add expenseType to models, once you've researched a standard expense
    #       classification scheme
    # appeal = ProjectAppealSerializer(required=False, allow_null=True, fields=[
    #                                  'updates', 'photos', 'title', 'subtitle', 'date_started', 'date_ended', 'story', 'is_live'])
    appeal = serializers.SerializerMethodField()
    # transactions = ProjectTransactionSerializer()
    expense_breakdown = serializers.SerializerMethodField()
    total_activities = serializers.SerializerMethodField()

    def get_appeal(self, obj):
        appeal = obj.appeals.last()
        return ProjectAppealSerializer(
            appeal, 
            fields=['title', 'subtitle', 'target_donations']).data

    # TODO: debug this
    def get_expense_breakdown(self, obj):
        # TODO: delete all this
        # Get all expenses
        if not obj:
            return []

        expenses = obj.transactions.filter(source_doc__expense__isnull=False)

        # result = TransactionDetail.objects.filter(transaction__in=expenses)

        # This query gets all expense transactions within the project with the first filter(),
        # then groups by expense type with values(), before keeping only debit transactions
        # and calculating their total amount with annotate()

        # Returns a list of object in the form:
        # {
        #   'source_doc__expense__expense_type': 'expenseTypeHere',
        #   'total': Decimal('260.000000000000000000')
        # }
        if not expenses.exists():
            return []
        # result = obj.transactions\
        #             .filter(source_doc__expense__isnull=False)\
        result = expenses\
                    .values('source_doc__expense__expense_type')\
                    .filter(entries__direction=1)\
                    .distinct()\
                    .annotate(total=Sum(F('entries__amount') * F('entries__direction')))

        # result = expenses.values('expense_type')\
        #     .filter(entries__direction=1)\
        #     .aggregate(Sum(F('entries__amount') * F('entries__direction')))

        # TODO: serialise this
        return list(result)

    # Get the outcomes of the project: totals for each indicator used
    # in the project, sorted by total amount
    def get_total_activities(self, obj):
        indicators = Indicator.objects.filter(service__project=obj)
        if indicators.exists():
            # Credit: annotate()/values() from AI response
            # TODO: debug or remmove
            # indicator_photo = ActivityAttachment.objects\
            #     .annotate(
            #         file_url=Concat(Value('/media/'), 'file', output_field=CharField())
            #         )\
            #     .values('file_url')\
            #     .filter(activity__indicator=OuterRef('pk'))\
            #     .values(url='file__url')
            result = indicators\
                .annotate(
                    total=Sum('activities__indicator_amount')
                    # photo=Random('activities__attachment')
                    
                    # TODO: debug or remove
                    # photo=Subquery(indicator_photo[:1])
                )\
                .values('name', 'total', unit_name=F('unit__name'))\
                .order_by('-total')[:3]
            return result

        # # Get all expenses for the project
        # expenses = obj.expenses.all()
        # # Get total amount spent
        # total_spent = sum(expense.amount for expense in expenses)
        # # Get proportion of expenses spent
        # proportion_spent = total_spent / obj.budget
        # return {
        #     'total_spent': total_spent,
        #     'proportion_spent': proportion_spent
        # }

    def to_representation(self, obj):
        data = super().to_representation(obj)

        # TODO:
        # 1) Get date from obj.transaction.source_doc.date
        # 2) Get description from obj.transaction.entries[0].description
        # 3) Get amount from obj.transaction.entries.filter(direction=1).aggregate(Sum(‘amount’)
        # 4) Get dr account from obj.transaction.entries.filter(direction=1).annotate(dr_account=F(‘account.name’))
        # 5) Get cr from … direction=-1
        # 6) Get amount from obj.transaction.entries.filter(direction=1).annotate(amount=Sum(‘amount’))
        # 7) Get link from obj.transaction like so: reverse(‘transaction’, args=[obj.id], see https://stackoverflow.com/questions/35546825/django-rest-framework-custom-hyperlink-field-in-serializer
        transaction_data = []
        for transaction in obj.transactions.prefetch_related('entries__account').all():
            # Use the largest debit and credit entry as representative of the transaction
            debit_entry = transaction.entries.filter(
                direction=1).order_by('amount').first()
            credit_entry = transaction.entries.filter(
                direction=-1).order_by('amount').first()

            # Get optional fields
            try:
                debit_account = debit_entry.account.account_name
            except AttributeError:
                debit_account = None

            try:
                credit_account = credit_entry.account.account_name
            except AttributeError:
                credit_account = None

            try:
                fund = debit_entry.account.fund
            except AttributeError:
                fund = None

            try:
                transaction_data.append({
                    'date': transaction.source_doc.date,
                    'description': transaction.entries.first().narration,
                    'amount': transaction.entries.filter(direction=1).aggregate(amount=Sum('amount'))['amount'],
                    'dr_account': debit_account,
                    'cr_account': credit_account,
                    'fund': fund,
                    # 'dr_account': debit_entry.account.account_name,
                    # 'cr_account': credit_entry.account.account_name,
                    # 'fund': getattr(debit_entry.account, 'fund') if debit_entry and debit_entry.account else None,
                    'link': reverse('transaction-detail', args=[transaction.id])
                })
            except AttributeError:
                # If the mandatory fields are missing (date, description, amount),
                # then move on to next transaction
                pass
        data['transactions'] = ProjectTransactionSerializer(
            transaction_data, many=True).data

        return data

    class Meta:
        model = Project
        fields = ['appeal', 'expense_breakdown', 'total_activities', 'uuid',
                  'name', 'start_date', 'end_date', 'target_donations', 'actual_donations']


# Gives fund name only


class FundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fund
        fields = '__all__'


# class AccountTypeSerializer(UniqueFieldsMixin, serializers.ModelSerializer):
class AccountTypeSerializer(BaseSerializer, UniqueFieldsMixin):

    # TODO: swap order of parents (BaseSerializer, then UniqueFieldsMixin)
    # and call the following method (why am I using this mixin anyway?)
    def create(self, validated_data):
        data = super(UniqueFieldsMixin).create(validated_data)
        return super().create(data)

    class Meta:
        model = AccountType
        fields = '__all__'


class AccountSerializer(ExcludeFieldsMixin, serializers.ModelSerializer):
    ultimate_parent = AccountTypeSerializer(required=False, allow_null=True)
    # parent = serializers.SerializerMethodField()
    # Attempt 2: # parent = WritableSerializerMethodField(deserializer_field=AccountSerializer)
    # Attempt 3:
    parent_account = serializers.SlugRelatedField(
        slug_field='code',
        queryset=Account.objects.all(),
        allow_null=True
    )
    # # Attempt 4 (doesn't work unless you make the field read-only: https://github.com/heywbj/django-rest-framework-recursive/issues/32)
    # parent_account = RecursiveField(required=False, allow_null=True)
    standard_account = serializers.SlugRelatedField(
        slug_field='code',
        queryset=StandardAccount.objects.all(),
        allow_null=True
    )
    fund = FundSerializer(required=False, allow_null=True)

    class Meta:
        model = Account
        fields = ['account_name', 'code', 'ultimate_parent',
                  'parent_account', 'standard_account', 'fund']

    # TODO: create hierarhical numbering for account codes (https://github.com/skoobytechforimpact/drf_chart_of_account/blob/master/drf_chart_of_account/models.py)
    # # For recursive 'parent_account' field
    # # Adapted from https://stackoverflow.com/a/39122426
    # def get_parent(self, obj):
    #     if obj.parent_account is not None:
    #         return AccountSerializer(obj.parent_account).data
    #     else:
    #         return None

    # TODO: do validation here instead of in Django model

# Shows all Funds and all of the accounts associated with them


class ChartOfAccountsSerializer(serializers.ModelSerializer):
    # 1) Gets all accounts in each fund belonging to a charity
    # - Get all funds + reverse access their accounts
    # 2) Serialise fund with the nested accounts

    # could be as simple as:
    accounts = AccountSerializer(
        exclude=['fund'], many=True, required=False, allow_null=True)

    class Meta:
        model = Fund
        fields = '__all__'


class BankAccountSerializer(WritableNestedModelSerializer):
    # 'owner' field is omitted from the serialised representation
    # double_entry_account = AccountSerializer(required=False, allow_null=True)
    double_entry_account = serializers.HyperlinkedRelatedField(
        view_name='account-detail',
        queryset=Account.objects.all(),
        allow_null=True)

    class Meta:
        model = BankAccount
        fields = '__all__'


class SourceDocumentAttachmentsSerializer(WritableNestedModelSerializer):

    class Meta:
        model = SourceDocumentAttachments
        fields = ['file']


class SourceDocumentSerializer(WritableNestedModelSerializer):
    attachments = SourceDocumentAttachmentsSerializer(
        many=True, required=False, allow_null=True, allow_empty=True)

    class Meta:
        model = SourceDocument
        fields = '__all__'


class VATRatesSerializer(serializers.ModelSerializer):

    class Meta:
        model = VATRates
        fields = '__all__'


class TransactionDetailSerializer(serializers.ModelSerializer):
    # TODO: MoneyField should work out of the box (see https://stackoverflow.com/a/61822697)
    # - check if this is the case
    # account = AccountSerializer()
    account = serializers.SlugRelatedField(
        slug_field='account_name', read_only=True)

    class Meta:
        model = TransactionDetail
        fields = '__all__'


# class TransactionSerializer(BaseSerializer, WritableNestedModelSerializer):
class TransactionSerializer(WritableNestedModelSerializer, serializers.ModelSerializer):
    VAT_rate = VATRatesSerializer(required=False, allow_null=True)
    source_doc = SourceDocumentSerializer(required=False, allow_null=True)
    entries = TransactionDetailSerializer(
        many=True, required=False, allow_null=True)

    class Meta:
        model = Transaction
        fields = ['uuid', 'project', 'timestamp',
                  'source_doc', 'VAT_rate', 'entries']

    # def to_internal_value(self, data):
    #     # Add transaction reference to each nested entry, to satisfy
    #     # TransactionDetailSerializer
    #     for entry in data['entries']:
    #         entry['transaction'] = data['id']
    #     return super().to_internal_value(data)

    def to_representation(self, instance):
        # Remove redundant transaction references from
        # child TransactionDetail entries
        data = super().to_representation(instance)
        if 'entries' in data and data['entries'] is not None:
            for entry in data['entries']:
                del entry['transaction']

    # validate that debits and credits balance - in other words,
    # they add up to 0
    def validate(self, data):
        if 'entries' in data:
            total = sum(float(i['amount']) * float(i['direction'])
                        for i in data['entries'])

            if total != 0:
                raise ValidationError("Debits and credits must balance")

        return data

    def validate_entries(self, data):
        if 'entries' in data and len(data['entries']) < 2:
            # TODO: incorrect - replace with 'if len(data) < 2', as only the 'entries'
            # dict itself is passed to this method
            raise InvalidDoubleEntry()
        return data

    #     # Multiply transaction amounts by direction, and add up
    #     # transaction_legs = self.entries.all()

    #     # if transaction_legs:
    #     if self.filter(transactiondetail_isnull=False):
    #         transaction_legs = self.entries.all()
    #         total = sum(i.amount * i.direction for i in transaction_legs)

    #         # Total should equal 0
    #         if total != 0:
    #             raise ValidationError("Debits and credits must balance.")


class DonationSerializer(BaseSerializer, UniqueFieldsMixin, WritableNestedModelSerializer):
    # received_by = UserSerializer()
    received_by = serializers.SlugRelatedField(
        read_only=True, slug_field='username')
    transaction = TransactionSerializer(required=False, allow_null=True)
    # TODO: delete this (from GitHub copilot); resolves appeal KeyError (UniqueFieldsMixin
    # expects OneToOneFields to always be present, unique_fields method throws error if optional field 
    # is mmissing), but creates other issues.
    appeal = serializers.PrimaryKeyRelatedField(
        queryset=acc_models.ProjectAppeal.objects.all(), required=False, allow_null=True)


    # TODO: validate that the user who receives the donation is a
    # charity employee (not a donation tracker user)
    class Meta:
        model = Donation
        fields = '__all__'
        # extra_kwargs = {
        #     "appeal": {"required": False}
        # }


    # TODO: check this works with a unit test
    def validate(self, data):
        if 'transaction' in data and 'entries' in data['transaction']:
            donation_entries = data['transaction']['entries']
            total_amount = sum(
                i['amount'] * i['direction'] for i in donation_entries if i['direction'] == 1)
            if data['amount'].amount != total_amount:
                raise serializers.ValidationError(
                    {'amount': 'Total amount of the donation should match the transaction entries.'})
        return data


class DonationHistorySerializer(DonationSerializer):
    charity_name = serializers.SerializerMethodField(read_only=True, required=False, allow_null=True)
    project_uuid = serializers.SerializerMethodField(allow_null=True)

    def get_charity_name(self, obj):
        try:
            charity = acc_models.Charity.objects.get(uuid=obj.parent_charity)
            print('returned charity name: ', charity.name)
            return charity.name
        except (acc_models.Charity.DoesNotExist, AttributeError):
            return None

    def get_project_uuid(self, obj):
        try:
            return obj.transaction.first().project.uuid
        except AttributeError:
            return None

class DonationHistoryListSerializer(serializers.ModelSerializer):
    """
        Serializer for donation history page in donation tracker.

        Fields: uuid (to redirect), date, appeal, charity, ammount
    """

    uuid = serializers.UUIDField()
    date = serializers.SerializerMethodField()
    appeal = serializers.SlugRelatedField(
        read_only=True, required=False, allow_null=True, slug_field='title')
    charity_name = serializers.SerializerMethodField()
    amount = MoneyField(max_digits=19, decimal_places=4, source="calculate_amount")

    class Meta:
        model = acc_models.Donation
        fields = ['uuid', 'date', 'appeal', 'charity_name', 'amount']

    def get_date(self, obj):
        try:
            return obj.transaction.first().timestamp
        except AttributeError:
            return None
        
    def get_charity_name(self, obj):
        try:
            charity = acc_models.Charity.objects.get(uuid=obj.parent_charity)
            print('returned charity name: ', charity.name)
            return charity.name
        except (acc_models.Charity.DoesNotExist, AttributeError):
            return None


# Summary of donations: name of donor, donated amount and date
class DonationListSerializer(DynamicFieldsMixin, serializers.ModelSerializer):
    # donor = serializers.CharField(source='donor.name') # Get 'name' attribute of
    donor = serializers.SerializerMethodField()
    # Hidden field, only used to calculate value of 'amount' field
    # amount_calc = serializers.SerializerMethodField()
    # amount = serializers.DecimalField(source='calculate_amount', max_digits=19, decimal_places=4)
    amount = MoneyField(source='calculate_amount',
                        max_digits=19, decimal_places=4)
    # amount = serializers.SerializerMethodField()

    class Meta:
        model = Donation
        fields = '__all__'

    # Get the total amount on one side of the transaction
    # (this may include bank fees and other amounts reducing the transaction)
    # def get_amount(self, obj):
    #     credit_entries = obj.transaction.first().entries.filter(direction__exact=-1)
    #     amount = sum(entry.amount for entry in credit_entries)
    #     return serializers.DecimalField(amount.amount, max_digits=19, decimal_places=4).data

    def get_donor(self, obj):
        return f'{obj.donor.first_name} {obj.donor.last_name}'

# TODO: serialise a ManyToMany field instead - here's one suggestion: https://stackoverflow.com/a/28706751
# class DonorInterestsSerializer(WritableNestedModelSerializer):
#     interests = serializers.SerializerMethodField()

#     class Meta:
#         model = DonorInterests
#         fields ='__all__'

#     def get_interests(self, obj):
#         interests = obj.projects.values('name')


# class DonationHistoryListSerializer(DonationListSerializer):
#     project_uuid = serializers.SerializerMethodField(read_only=True, required=False, allow_null=True)

#     def get_project_uuid(self, obj):
#         try:
#             return obj.transaction.first().project.uuid
#         except AttributeError:
#             print('Getting project UUID failed')
#             return None

class DonorSerializer(serializers.ModelSerializer):
    # TODO: add filtering by giving status etc.
    address = AddressSerializer(required=False, allow_null=True)

    class Meta:
        model = Donor
        fields = '__all__'


class ItemsByMonthSerializer(serializers.Serializer):
    month = serializers.IntegerField()
    total = MoneyField(max_digits=19, decimal_places=4)

class CountByYearSerializer(serializers.Serializer):
    year = serializers.IntegerField()
    total = serializers.IntegerField()


class DonorsByLocationSerializer(serializers.Serializer):
    city = serializers.CharField()
    count = serializers.IntegerField()


class DonorAnalyticsSerializer(serializers.Serializer):
    """
        TODO: 1) three cards - 'total donations', 'change this month' (see https://fundraisingkit.com/wp-content/uploads/2022/02/Sample-KIT-Donor-Profile.png)
                               'number of donors this year', 'change vs last year',
                               'average donation size', 'change vs last year'
              2) bar chart - donors by location
              3) line chart - donations over time
    """

    # total_donations = MoneyField(
    #     max_digits=19, decimal_places=4, allow_null=True)
    # change_this_month = MoneyField(
    #     max_digits=19, decimal_places=4, allow_null=True)
    # number_of_donors_this_year = serializers.IntegerField(
    #     min_value=0, allow_null=True)
    # change_from_last_year = serializers.IntegerField(
    #     min_value=0, allow_null=True)
    donor_numbers_by_year = CountByYearSerializer(many=True, allow_null=True)
    # average_donation = MoneyField(
    #     max_digits=19, decimal_places=4, allow_null=True)
    # average_donation_by_month_this_year = ItemsByMonthSerializer(many=True, allow_null=True)
    # change_in_average = MoneyField(
    #     max_digits=19, decimal_places=4, allow_null=True)

    # donors_by_location = serializers.ListField(
    #     child=serializers.DictField(
    #         child=serializers.IntegerField()
    #     ), allow_empty=True)
    donors_by_country = DonorsByLocationSerializer(
        many=True, allow_null=True
    )
    # donations_by_month_this_year = serializers.ListField(
    # child=serializers.DictField(
    #     child=MoneyField(max_digits=19, decimal_places=4, allow_null=True)
    # ), allow_empty=True
    # child=DonationsByMonthSerializer(), allow_empty=True
    # )
    # donations_by_month_this_year = ItemsByMonthSerializer(
    #     many=True, allow_null=True)
    recurring_donation_ratio = ItemsByMonthSerializer(
        many=True, allow_null=True)

    # change_vs_last_year = MoneyField(
    #     max_digits=19, decimal_places=4, allow_null=True)
    # average_donation_size = MoneyField(
    #     max_digits=19, decimal_places=4, allow_null=True)
    # change_vs_last_year = MoneyField(
    #     max_digits=19, decimal_places=4, allow_null=True)
    # number_of_donors_this_year = serializers.IntegerField(allow_null=True)

    # total_donations = serializers.SerializerMethodField()
    # donations_this_month = serializers.SerializerMethodField()

    # def get_total_donations(self, obj):
    #     return obj.donations.aggregate(amount=Sum('amount'))['amount']

    # def get_donations_this_month(self, obj):
    #     start_of_month = datetime.today().replace(day=1)
    #     now = datetime.now()
    #     return obj.donations.filter(transaction__timestamp__range=(start_of_month, now))

    # class Meta:
    #     model = Donor
    #     fields = ['total_donations', 'change_this_month',
    #               'number_of_donors_this_year',]

# Summary of donors for list view - first name, last name, giving stage, total donated


class DonorListSerializer(serializers.ModelSerializer):
    donated = serializers.SerializerMethodField()

    class Meta:
        model = Donor
        fields = ['uuid', 'first_name', 'last_name',
                  'birthdate', 'giving_stage', 'donated']

    # TODO: replace when you've added an 'amount' field
    def get_donated(self, obj):
        total_donated = 0
        for donation in obj.donations.all():
            total_donated += donation.calculate_amount()
            # credit_entries = donation.transaction.first().entries.filter(direction__exact=-1)
            # total_donated += sum(entry.amount for entry in credit_entries)
        return total_donated


class DonationAnalyticsSerializer(serializers.Serializer):
    average_donation = MoneyField(
        max_digits=19, decimal_places=4, allow_null=True)
    average_donation_by_month_this_year = ItemsByMonthSerializer(many=True, allow_null=True)
    donations_by_month_this_year = ItemsByMonthSerializer(
        many=True, allow_null=True)
    

class SupplierSerializer(ContactSerializer, WritableNestedModelSerializer):
    primary_contact = PersonSerializer(required=False, allow_null=True)
    address = AddressSerializer(required=False, allow_null=True)

    class Meta:
        model = Supplier
        fields = ContactSerializer.Meta.fields + ['display_name', 'primary_contact', 'VAT_number', 'is_VAT_number_validated']

# Summary for list view - name, avatar, phone, email, city, country


class SupplierListSerializer(serializers.ModelSerializer):
    city = serializers.CharField(source='address.city', allow_null=True)
    country = serializers.CharField(source='address.country', allow_null=True)

    class Meta:
        model = Supplier
        fields = ['uuid', 'display_name', 'phone_number',
                  'avatar', 'email', 'city', 'country']


class ItemsBySupplierSerializer(serializers.Serializer):
    vendor = serializers.CharField()
    total = MoneyField(max_digits=19, decimal_places=4)


class ExpensesByMonthSerializer(serializers.Serializer):
    month = serializers.IntegerField()
    expenses = MoneyField(max_digits=19, decimal_places=6)


class RatioByMonthSerializer(serializers.Serializer):
    month = serializers.CharField()
    ratio = serializers.DecimalField(allow_null=True, max_digits=19, decimal_places=6)


class ExpenseAnalyticsSerializer(serializers.Serializer):
    """
        TODO: 1) two cards for 'total expense', 'expense this month'
              2) Line graph for expense over time
              3) Table of total expenses per supplier/vendor, top down
    """
    total_expenses = MoneyField(
        max_digits=19, decimal_places=None, allow_null=True)
    expenses_this_month = MoneyField(
        max_digits=19, decimal_places=None, allow_null=True)
    expenses_by_month = ExpensesByMonthSerializer(many=True, allow_null=True)
    expenses_by_supplier = ItemsBySupplierSerializer(
        many=True, allow_null=True)
    expenses_over_donations = RatioByMonthSerializer(many=True, allow_null=True)


# class ExpenseLineItemSerializer(serializers.ModelSerializer):
class ExpenseLineItemSerializer(BaseSerializer):
    """
        Read-only serializer for list view of expenses.

        TODO: make this a generic serializer for Invoice etc.
        TODO: move expense transaction-creating logic to the create() method here

        TODO: nest Expense and ExpenseAnalytics Serializer here
    """
    # dr_account = serializers.CharField(source='transaction__entries__account__account_name')

    # dr_account = serializers.SerializerMethodField()
    dr_account = ReadWriteSerializerMethodField()

    # cr_account = source('transaction__entries__account__account_name')
    # cr_account = serializers.CharField(source='get_cr_account')

    # cr_account = serializers.SerializerMethodField()
    cr_account = ReadWriteSerializerMethodField()

    # amount = source('transaction__entries__amount')
    # amount = MoneyField(source='get_amount', max_digits=19, decimal_places=4)

    # amount = serializers.SerializerMethodField()
    amount = ReadWriteSerializerMethodField()

    # description = straight from Expense
    project = serializers.UUIDField(
        # source='transaction.project.name', required=False, allow_null=True)

        # source='project.name', required=False, allow_null=True)
        source='project.uuid', required=False, allow_null=False)
    date = serializers.DateTimeField(
        # source='transaction.timestamp', required=False, allow_null=True)
        source='timestamp', required=False, allow_null=True)
    # fund = serializers.CharField(source='transaction.account.fund', required=False, allow_null=True)
    # fund = serializers.CharField(
    #     source='account.fund', required=False, allow_null=True)

    # fund = serializers.SerializerMethodField()
    fund = ReadWriteSerializerMethodField(required=False)
    # description = serializers.SerializerMethodField()
    description = ReadWriteSerializerMethodField()

    class Meta:
        model = Transaction
        fields = BaseSerializer.Meta.fields + ['date', 'dr_account', 'cr_account',
                                               'amount', 'description', 'project', 'fund']

    def get_dr_account(self, obj):
        try:
            # return obj.transaction.entries.filter(direction=1).first().account.account_name
            return obj.entries.filter(direction=1).exclude(account__account_name=None).first().account.account_name
        except:
            return None

    def get_cr_account(self, obj):
        try:
            # return obj.transaction.entries.filter(direction=-1).first().account.account_name
            return obj.entries.filter(direction=-1).exclude(account__account_name=None).first().account.account_name
        except:
            return None

    def get_amount(self, obj):
        try:
            # return obj.transaction.entries.filter(direction=1).order_by('amount').first().amount
            amount = obj.entries.filter(
                direction=1).order_by('amount').first().amount
            return str(amount)
        except:
            return None

    def get_description(self, obj):
        try:
            # return obj.transaction.entries.filter(direction=1).order_by('amount').first().amount
            return obj.entries.filter(direction=1).exclude(narration__isnull=True).first().narration
        except:
            return None

    def get_fund(self, obj):
        try:
            # return obj.transaction.entries.filter(direction=1).order_by('amount').first().amount
            return obj.entries.filter(direction=1).exclude(account__fund__isnull=True).first().account.fund.fund_name
        except:
            return None

    def to_internal_value(self, data):
        # Have to include this, as to_internal_value() is called multiple times (when instantiating the serialiser [s = ExpenseLineItemSerializer()
        # in ExpenseSerialiser's create()], when
        # calling is_valid() after that to check serialisation  is successful, and when calling .save()),
        # and each time the data is READ according to the serialiser class definitions (i.e. 'project'
        # is expected in the 'project' field), but the validated_data output is saved to the serialiser according to the
        # 'source' attribute (so 'project' data is now in 'project.uuid'). So we 'undo' the changes made,
        # so the next call to internal_value will work as expected

        if 'project' in data and 'uuid' in data['project']:
            data['project'] = data['project']['uuid']
        if 'timestamp' in data:
            data['date'] = data.pop('timestamp')
        return super().to_internal_value(data)

    def create(self, validated_data):
        """
            TODO:
            Create a transaction object, link to expense; create transaction entries for dr_account + amount, and cr/amount;
            populate each entry with the repeated data; link to transaction, and save

            - Create a transaction object
            - Create two transaction details
            - Create an expense object
            - Link the transaction to the expense
            - Link the transaction details to the transaction
        """

        # Done in two steps because { 'project': { 'uuid': 'nested here' }}
        # To keep 'source='project.uuid' for a writable field
        print('Validated line item data is:', validated_data)
        # project_uuid = validated_data.pop('project', None)

        proj = validated_data.pop('project', None)
        project_uuid = None
        if proj and proj.get('uuid'):
            project_uuid = proj.pop('uuid', None)
        # project_uuid = validated_data.pop('project')

        try:
            project = acc_models.Project.objects.get(uuid=project_uuid)
        except acc_models.Project.DoesNotExist:
            project = None
        print('Project is: ', project)

        # Create linked Transaction
        timestamp = validated_data.pop('date', timezone.now())
        transaction = acc_models.Transaction.objects.create(
            # TODO: re-enable when BaseModels are inherited
            parent_charity=validated_data['parent_charity'],
            project=project,
            source_doc=self.context['expense'],
            timestamp=timestamp
        )

        # Create the two double entries
        asset, _ = acc_models.AccountType.objects.get_or_create(
            name='AST', parent_charity=validated_data['parent_charity'], defaults={'code': 100})
        print('Asset account:', asset)
        expense, _ = acc_models.AccountType.objects.get_or_create(
            name='EXP', parent_charity=validated_data['parent_charity'],  defaults={'code': 400})

        credit_account = validated_data.pop('cr_account')
        credit_entry = acc_models.TransactionDetail.objects.create(
            # TODO: re-enable
            parent_charity=validated_data['parent_charity'],
            transaction=transaction,
            account=acc_models.Account.objects.get_or_create(
                account_name=credit_account, defaults={
                    'ultimate_parent': expense,
                    # TODO: re-enable when Account inherits from Basemodel
                    'parent_charity': validated_data['parent_charity'],
                    'normal': -1,
                    # 'code': random.randint(400, 499),
                    'code': secrets.choice(range(400, 499)),
                })[0],
            # amount=Money(payload.amount_total, payload.currency),
            amount=Money(validated_data['amount'], 'GBP'),
            narration=validated_data['description'],
            direction=-1
        )

        debit_account = validated_data.pop('dr_account')
        debit_entry = acc_models.TransactionDetail.objects.create(
            # TODO: re-enable
            # parent_charity=payload.metadata.charity_id,
            parent_charity=validated_data['parent_charity'],
            transaction=transaction,
            account=acc_models.Account.objects.get_or_create(
                account_name=debit_account, defaults={
                    'ultimate_parent': asset,
                    'parent_charity': validated_data['parent_charity'],
                    'normal': 1,
                    # 'fund': validated_data['fund'],
                    # 'code': random.randint(300, 399),
                    'code': secrets.choie(range(300, 399)),
                })[0],
            amount=Money(validated_data['amount'], 'GBP'),
            narration=validated_data['description'],
            direction=1
        )

        return transaction


class ExpenseSerializer(BaseSerializer, WritableNestedModelSerializer):
    # supplier = SupplierSerializer(allow_null=True)
    supplier = serializers.SlugRelatedField(
        read_only=True, required=False, allow_null=True, slug_field='display_name')
    supplier_id = serializers.SlugRelatedField(
        queryset=acc_models.Supplier.objects.all(),
    write_only=True, 
        required=False, 
        allow_null=True, 
        slug_field='uuid')
    payment_type = serializers.IntegerField(required=False, allow_null=True)
    line_items = ExpenseLineItemSerializer(source='transaction', many=True)

    """
        supplier = slug
        dr_account = source('transaction__entries__account__account_name')
        cr_account = source('transaction__entries__account__account_name')
        amount = source('transaction__entries__amount')
        description = straight from Expense
        project = source('project')
        date = source('transaction__timestamp')
        fund = source('transaction__account__fund')
    """

    class Meta:
        model = Expense
        fields = ['expense_type', 'payment_type', 'supplier', 'supplier_id', 'line_items']

    # def __init__(self, *args, **kwargs):
    #     self.fields['line_items'].context.update()

    def to_internal_value(self, data):
        #     # Add the expense object to the context, so that the line items
        #     # can be created with the expense object as the parent
        #     data['expense'] = self.instance

        # if not self.instance:
            # Only do this if there is no instance associated with serialiser,
            # i.e. when we are creating a new record, rather than updating one
        parent_charity = self.get_current_charity()
        # for line_item in data['line_items']:
        # Replaced 'if not self.instance' check with an optional get(), as this eliminates
        # need for distinguishing b/w updates and creates
        for line_item in data.get('line_items', None) or []:
            line_item['parent_charity'] = parent_charity
            line_item['cr_account'] = 'Expenses'
        print('Data to validate is:', data)
        return super().to_internal_value(data)

    def create(self, validated_data):
        # Get the parent_charity from my BaseSerializer superclass (which is not
        # directly called, because of MRO in Python)
        # validated_data = super().create(validated_data)

        current_charity = self.context['request'].user.profile.charities.filter(
            selected=True).first()
        if current_charity:
            validated_data['parent_charity'] = current_charity.charity.uuid
        else:
            raise NoTenantError(
                'Cannot create an Expense until you have joined a charity')

        # Create an Expense object, and separate double-entry transactions
        # for each line item in the Expense

        # Fetch the related_supplier. Suppress any 'supplier does not exist'
        # exceptions and continue
        # print('Expense data:', validated_data)
        # supplier_id = validated_data.pop('supplier_id', None)
        # try:
        #     supplier = acc_models.Supplier.objects.get(
        #         uuid=supplier_id)
        # except acc_models.Supplier.DoesNotExist:
        #     supplier = None

        # Create Expense object
        expense = acc_models.Expense.objects.create(
            parent_charity=validated_data['parent_charity'],
            # supplier=supplier,
            supplier=validated_data.get('supplier_id', None),
            payment_type=validated_data.pop('payment_type', None),
            expense_type=validated_data.pop('expense_type', None)
            # reference=payload.id[:64],
            # amount=Money(payload.amount_total, payload.currency),
            # payment_method=1,
        )

        # TODO: instead of all the code below, call create() on the LineItemSerializer
        # line_items = ExpenseLineItemSerializer().create(validated_data['line_items'])
        # Actually, this - for multiple items
        line_items = []
        for item in validated_data['transaction']:
            s = ExpenseLineItemSerializer(
                data=item, context={'expense': expense})
            if s.is_valid():
                # TODO: should raise an error to warn user here if line item is not valid

                # line_item = ExpenseLineItemSerializer().create(item, context={'expense': expense})
                line_item = s.save()
                line_items.append(line_item)

        # TODO: delete when ExpenseLineItemSerializer handles this
        """
        # Loop through the transactions associated with the expense (if
        # any) and save them
        # line_items = validated_data.pop('line_items', None)
        if (line_items := validated_data.pop('line_items', None)):

            for item in line_items:
                # Get related project
                project_uuid = item.pop('project', None)
                try:
                    project = acc_models.Project.objects.get(uuid=project_uuid)
                except acc_models.Project.DoesNotExist:
                    project = None

                # Create linked Transaction
                timestamp = item.pop('date', timezone.now())
                transaction = acc_models.Transaction.objects.create(
                    # TODO: re-enable when BaseModels are inherited
                    # parent_charity=validated_data['charity_id'],
                    project=project,
                    source_doc=expense,
                    timestamp=timestamp
                )

                # Create the two double entries
                asset, _ = acc_models.AccountType.objects.get_or_create(
                    name='AST', defaults={'code': 100, 'parent_charity': validated_data['parent_charity']})
                expense, _ = acc_models.AccountType.objects.get_or_create(
                    name='EXP', defaults={'code': 400, 'parent_charity': validated_data['parent_charity']})

                credit_account = validated_data.pop('cr_account')
                credit_entry = acc_models.TransactionDetail.objects.create(
                    # TODO: re-enable
                    # parent_charity=validated_data['charity_id'],
                    transaction=transaction,
                    account=acc_models.Account.objects.get_or_create(
                        account_name=credit_account, defaults={
                            'ultimate_parent': expense,
                            # TODO: re-enable when Account inherits from Basemodel
                            # parent_charity=validated_data['charity_id'],
                            'normal': -1,
                            'code': random.randint(400, 499),
                        })[0],
                    # amount=Money(payload.amount_total, payload.currency),
                    amount=Money(validated_data['amount'], 'GBP'),
                    narration=validated_data['description'],
                    direction=-1
                )

                debit_account = item.pop('dr_account')
                debit_entry = acc_models.TransactionDetail.objects.create(
                    # TODO: re-enable
                    # parent_charity=payload.metadata.charity_id,
                    transaction=transaction,
                    account=acc_models.Account.objects.get_or_create(
                        account_name=debit_account, defaults={
                            'ultimate_parent': asset,
                            # parent_charity=validated_data['charity_id'],
                            'normal': 1,
                            'code': random.randint(300, 399),
                        })[0],
                    amount=Money(validated_data['amount'], 'GBP'),
                    narration=validated_data['description'],
                    direction=1
                )
        """

        return expense


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'


class InvoiceTermSerializer(serializers.ModelSerializer):

    def validate(self, data):
        # Ensure that trade discount days has been set if trade discount has been set
        if data['trade_discount'] and not data['trade_discount_days']:
            raise serializers.ValidationError({
                "trade_discount_days": "Cannot add a trade discount without specifying number of days for discount"
            })
        return data

    class Meta:
        model = InvoiceTerm
        fields = '__all__'


class InvoiceTemplateSerializer(serializers.ModelSerializer):

    class Meta:
        model = InvoiceTemplate
        fields = '__all__'


class PartnerRelatedField(serializers.SlugRelatedField):
    """
        Get the queryset for a slug related field, filtering by the user's charity.
        Return an empty queryset if no charity is selected/accessible.
    """

    def __init__(self, *args, **kwargs):
        self.model_type = kwargs.pop('model_type')
        super().__init__(*args, **kwargs)

    def get_queryset(self):
        try:
            current_charity = self.context['request'].user.profile.charities.filter(
                selected=True).first().charity.uuid
        except:
            return self.model_type.objects.none()
        print('Returned customer: ', self.model_type.objects.filter(
            parent_charity=current_charity))
        return self.model_type.objects.filter(parent_charity=current_charity)


class InvoiceSerializer(serializers.ModelSerializer):
    # Pass the user's charity's customer as the queryset for the serializer, or
    # an empty queryset if a charity is not selected/accessible
    # def get_customers(self):
    #     try:
    #         current_charity = self.context['request'].user.profile.charities.filter(
    #             selected=True).first().charity.uuid
    #     except:
    #         return Customer.objects.none()
    #     return Customer.objects.filter(parent_charity=current_charity)

    # customer = serializers.SlugRelatedField(
    #     queryset=self.get_customers(), slug_field='name')
    customer = PartnerRelatedField(
        model_type=acc_models.Customer, slug_field='display_name')
    terms = InvoiceTermSerializer(allow_null=True)
    transaction = TransactionSerializer()

    class Meta:
        model = Invoice
        fields = '__all__'


class BillSerializer(serializers.ModelSerializer):
    """Based on InvoiceSerializer"""
    supplier = PartnerRelatedField(
        model_type=acc_models.Supplier, slug_field='display_name')
    # supplier = serializers.SlugRelatedField(
    #     queryset=self.get_suppliers(), slug_field='display_name')
    transaction = TransactionSerializer()

    class Meta:
        model = Bill
        fields = '__all__'
