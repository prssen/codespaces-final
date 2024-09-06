from django.db import models
from django.contrib.auth.models import User
from django.core.validators import (MinValueValidator,
                                    MaxValueValidator,
                                    MinLengthValidator,
                                    int_list_validator,
                                    RegexValidator)

# TODO: replace with DRF exceptions
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.db import transaction
from django.db.models import F, Sum
from django.dispatch import receiver
from django.db.models.signals import pre_save, post_save
from model_utils.managers import InheritanceManager

from model_utils.fields import StatusField
from model_utils.choices import Choices

from djmoney.models.fields import MoneyField
from phonenumber_field.modelfields import PhoneNumberField
from django_countries.fields import CountryField
from colorfield.fields import ColorField
import datetime
from .constants import PAYMENT_METHODS
from .utils import current_date
import random
import uuid
from decimal import Decimal

# Create your models here.
# User model has: first_name, last_name, email, pasword, groups (M2M), user_permissions (m2m),
# is_staff, is_active, is_superuser, last_login, date_joined

# TODO FIXME: add the following biz logic:
# 0. Cannot delete accounts, just mark them as 'inactive' (like QB) UNLESS they have no transactions (like Xero)
# 1. If account is marked as 'system', it cannot be made inactive (in QB, these are undeposited funds, opening equity etc. - see https://quickbooks.intuit.com/learn-support/en-us/help-article/chart-accounts/manage-default-special-accounts-chart-accounts/L3WvLaIfa_US_en_US)
# 1.5 (DON'T DO THIS)If non-system account is marked as 'inactive', journal entry balancing account to 0 (transfer to parent account) is performed
#       If there is no parent account, the name of an existing account must be provided to transfer transactions to? This new account MUST be the same accountType.
# 2. Journals: skip the VAT rate (unnecessary complication)

# TODO: split these models into related apps
# TODO: add indexes
# TODO: add unique UUID fields, and use them as the pk for API endpoints,
# for security (see https://stackoverflow.com/q/3936182, https://www.reddit.com/r/django/comments/xbss16/uuid_vs_sequential_id_as_primary_key/
# for good reasons why) AND for reference in the blockchain

#

# From https://stackoverflow.com/a/69946522
PERCENTAGE_VALIDATOR = [MinValueValidator(0), MaxValueValidator(100)]


# TODO FIXME: use this
# class TenantModel(models.Model):
#     # This is the concatenation of username and password hash, to avoid collisions b/w users
#     # who have the same username (perhaps due to a system fault)
#     charity_id = models.CharField(max_length=200)


# class TenantModelManager(models.Manager):
#     def get_queryset(self):
#         return super().get_queryset().filter(charity_id=request.user.charity_id)


# Function to dynamically determine at runtime which parent a model should have
# based on user input
def decide_parent(is_person):
    if is_person:
        return Person
    else:
        return Organisation

# TODO: choices for any lookup values (e.g. COUNTRIES = [('ARG', 'Argentina')]) etc,
# though try to find libraries to do this for you/move data to settings.ENUMS

# TODO: add to AccountingUser model the field 'notificationsEnabled = models.BooleanField(default=True)'
# Notifications


class BaseModelManager(models.Manager):
    """
        Checks for model constraints before saving. We need this because the
        clean() method is not automatically called when saving a model instance in Django.
    """

    def get_or_create(self, **kwargs):
        instance, created = super().get_or_create(**kwargs)
        # Call clean() on model object created with get_or_create
        if created:
            try:
                instance.clean()
            except ValidationError as e:
                # If constraints not met, revert the model save and
                # propagate error to user
                instance.delete()
                raise e
        return instance, created

# # Credit: https://stackoverflow.com/q/61486725
# # TODO: incomplete - see link to finish
# class Search(models.Lookup):
#    lookup_name = 'search'

#    def as_mysql(self, compiler, connection):
#        lhs, lhs_params = self.process_lhs(compiler, connection)
#        rhs, rhs_params = self.process_rhs(compiler, connection)
#        params = lhs_params + rhs_params
#        return 'MATCH (%s) AGAINST (%s IN BOOLEAN MODE)' % (lhs, rhs), params

# models.CharField.register_lookup(Search)
# models.TextField.register_lookup(Search)


class BaseModel(models.Model):
    # Store the ID  of the charity the model instance belongs to
    parent_charity = models.UUIDField()
    
    # # TODO: add uuid + other fields below, delete uuid field from all models
    # uuid = models.UUIDField(
    #     default=uuid.uuid4, editable=False, unique=True, null=True, blank=True)
    # created_at = models.DateTimeField(auto_now_add=True, editable=False)
    # modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True



class BlockchainUser(models.Model):
    name = models.CharField(max_length=500, unique=True)
    avatar = models.ImageField(blank=True, null=True)
    # address of user's blockchain account
    blockchain_address = models.CharField(max_length=42, blank=True, null=True)
    # TODO: add fields for private/pubic keys if necessary

    # def __str__(self):
    #     return self.name


# class Country(models.Model):
class Country(BaseModel):
    # Primary key - for ISO 3166-1 code
    iso_code = models.CharField(max_length=3, primary_key=True)
    name = models.CharField(max_length=200)

 # county, province, state or other administrative sub-division of a country


class Region(BaseModel):
    name = models.CharField(max_length=200)
    # for 3-digit ISO 3166-2 code (https://en.wikipedia.org/wiki/ISO_3166-2)
    code = models.CharField(max_length=3, null=True, blank=True)
    # for other types of code (from https://vertabelo.com/blog/address-in-database-model/)
    state_area_code = models.CharField(max_length=50, null=True, blank=True)


class City(BaseModel):
    # Not primary key, as multiple cities can have the same name
    name = models.CharField(max_length=200)

 # represents borough or other administrative sub-division of a city


class District(BaseModel):
    name = models.CharField(max_length=200)

# TODO: compare with django-address: https://pypi.org/project/django-address/


class Address(BaseModel):
    # 3 lines of text avoids need to manage street numbers, names, suffixes and other edge cases
    uuid = models.UUIDField(
        default=uuid.uuid4, editable=False, unique=True, null=True, blank=True)
    address1 = models.CharField(max_length=200)
    address2 = models.CharField(max_length=200, null=True, blank=True)
    address3 = models.CharField(max_length=200, null=True, blank=True)
    # 32 characters enough to cover almost all postcodes (https://stackoverflow.com/q/325041)
    postal_code = models.CharField(max_length=32)
    district = models.ForeignKey(
        District, on_delete=models.SET_NULL, null=True, blank=True)
    city = models.ForeignKey(City,
                             on_delete=models.SET_NULL, null=True, blank=True)
    region = models.ForeignKey(
        Region, on_delete=models.SET_NULL, null=True, blank=True)
    # TODO: correct foreign keys
    # country = models.ForeignKey(
    #     Country, on_delete=models.SET_NULL, null=True, blank=True)

    # TODO: check this works
    country = CountryField(null=True, blank=True)

# TODO: notifications (for transaction approval)
class Location(BaseModel):
    name = models.CharField(max_length=64, blank=True, null=True)
    address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True)
    latitude = models.DecimalField(max_digits=8, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    

# Superclass for all contact records (Donor, Customer, Supplier etc)
class Contact(BaseModel):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    phone_number = PhoneNumberField(null=True, blank=True)
    email = models.EmailField(max_length=254)
    # TODO: change to one to many, if need to store history of changes in address
    address = models.OneToOneField(
        Address,
        # related_name='contact',
        related_name="%(app_label)s_%(class)s_related",
        related_query_name="%(app_label)s_%(class)ss",
        on_delete=models.SET_NULL,
        blank=True,
        null=True)
    avatar = models.ImageField(blank=True, null=True)
    # blockchain_id = models.OneToOneField(
    #     BlockchainUser, 
    #     on_delete=models.SET_NULL, 
    #     blank=True, 
    #     null=True)
    blockchain_id = models.CharField(max_length=42, blank=True, null=True)

    class Meta:
        abstract = True

    # def save(self, *args, **kwargs) -> None:
    #     if self.blockchain_id:
    #         BlockchainUser.objects.create(
    #             avatar=self.avatar,

    #         )
    #     return super().save(*args, **kwargs)


# User profiles
class Profile(Contact):
    class UserType(models.IntegerChoices):
        DONATION_USER = 0,
        ACCOUNTING_USER = 1

    # Override the parent_charity attribute from Contact, as it is not applicable
    # (charity <-> user links stored in ProfileCharity instead)
    parent_charity = None
    notifications_enabled = models.BooleanField(default=True)
    user_type = models.IntegerField(
        choices=UserType.choices, default=UserType.ACCOUNTING_USER)
    first_name = models.CharField(max_length=64, blank=True, null=True)
    last_name = models.CharField(max_length=64, blank=True, null=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # blockchain_id = models.CharField(max_length=42, blank=True, null=True)


# # Record of other names, such as trading names and colloquial names, for a contact
# class ContactNames(models.Model):


class Organisation(Contact):
    """Contact records relating to an organisation or other corporate entity"""
    # Companies House permits UK company names to be up to 160 characters
    name = models.CharField(max_length=160)
    # TODO: change this into a ... [enum?]
    sector = models.CharField(max_length=64, blank=True, null=True)


# Contact records relating to a physical person
class Person(Contact):
    class Titles(models.IntegerChoices):
        MR = 0, 'Mr'
        MS = 1, 'Ms'
        MRS = 2, 'Mrs'
        MISS = 3, 'Miss'
    title = models.IntegerField(choices=Titles.choices, blank=True, null=True)
    first_name = models.CharField(max_length=64, blank=True, null=True)
    middle_names = models.CharField(max_length=400, blank=True, null=True)
    last_name = models.CharField(max_length=64, blank=True, null=True)
    birthdate = models.DateField(blank=True, null=True)
    suffix = models.CharField(max_length=100, blank=True, null=True)
    occupation = models.CharField(max_length=200, blank=True, null=True)
    # TODO: change to a list of choices
    # nationality = models.CharField(max_length=64, blank=True, null=True)
    nationality = CountryField(blank=True, null=True)


# class Charity(Organisation):
class Charity(models.Model):
    # TODO: find exhaustive list + avoid hardcoding the keys (CIO = 'CIO', then { myModel.CIO} instead of {'CIO'})
    CHARITY_TYPES = (
        ('CIO', 'CIO: Charitable Incorporated Organisation'),
        ('COMP', 'Charity company (limited by guarantee)'),
        ('UNC', 'Unincorporated association'),
        ('TR', 'Trust'),
        ('OTH', 'Other')
    )
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    phone_number = PhoneNumberField(null=True, blank=True)
    email = models.EmailField(max_length=254)
    # TODO: change to one to many, if need to store history of changes in address
    address = models.OneToOneField(
        Address,
        # related_name='contact',
        related_name="%(app_label)s_%(class)s_related",
        related_query_name="%(app_label)s_%(class)ss",
        on_delete=models.SET_NULL,
        blank=True,
        null=True)
    avatar = models.ImageField(blank=True, null=True)

    # parent_charity = None
    legal_structure = models.CharField(
        max_length=64, choices=CHARITY_TYPES, blank=True, null=True)
    # TODO: only display if 'OTH' choice above is selected
    legal_structure_other = models.CharField(
        max_length=64, blank=True, null=True)
    # Companies House permits UK company names to be up to 160 characters
    name = models.CharField(max_length=160)
    # TODO: change this into a ... [enum?]
    sector = models.CharField(max_length=64, blank=True, null=True)

    # Registration numbers for UK charities (https://foodstandardsagency.github.io/enterprise-data-models/patterns/charity_commission_number.html)
    charity_commission_number = models.CharField(
        max_length=8, validators=[int_list_validator(sep=''), MinLengthValidator(8),], blank=True, null=True)  # Fixed length (8 characters)
    # TODO: HMRC charity number etc

    # Subtitle on charity page
    slogan = models.CharField(max_length=150, blank=True, null=True)
    # Brief 'About Us' description on charity page
    mission = models.TextField(blank=True, null=True)

    blockchain_id = models.CharField(max_length=42, blank=True, null=True)

    # def save(self, *args, **kwargs):
    #     self.parent_charity = None
    #     super().save(*args, **kwargs)


class Notification(models.Model):
    # TODO: finish this
    NOTIFICATION_TYPES = (
        (1, 'Donation'),
        (2, 'Approval'),  # TEA and internal control transaction approvals
        (3, 'Comment'),  # On a source document which user has already commented on
        # (4, 'Email/message') # If this is implemented?
    )
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    sender = models.ForeignKey(
        Charity, related_name='notifications_sent', on_delete=models.CASCADE)
    receiver = models.ForeignKey(
        Charity, related_name='notifications_received', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    notification_type = models.PositiveSmallIntegerField(
        choices=NOTIFICATION_TYPES, default=1)  # TODO: select correct default
    # message = models.CharField(max_length=200)
    message = models.JSONField()
    is_seen = models.BooleanField(default=False)

    # TODO: enable›
    class Meta:
        ordering = ['-timestamp']
        indexes = [models.Index(fields=['receiver'])]


class ProfileCharity(models.Model):
    """
        Junction table to resolve the many-to-many relationship between user
        profiles and charities and persist session information (selected charity)
        to the database.
    """
    profile = models.ForeignKey(
        Profile, on_delete=models.CASCADE, related_name='charities')
    charity = models.ForeignKey(
        Charity, on_delete=models.CASCADE, related_name='profiles')
    selected = models.BooleanField(default=False, blank=True, null=True)


class Project(BaseModel):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=200)
    start_date = models.DateField(
        null=True, blank=True, default=datetime.date.today)
    end_date = models.DateField(null=True, blank=True)
    # How much the appeal is trying to raise
    target_donations = MoneyField(
        max_digits=19, decimal_places=4, default_currency='GBP')

    @property
    def actual_donations(self):
        # donations = self.transactions.filter(
        #     source_doc__donation__isnull=False)
        donations = Donation.objects.filter(transaction__project=self)
        if donations.exists():
            return donations.aggregate(actual_donations=Sum('amount'))['actual_donations']
        return Decimal(0)

    # @actual_donations.setter
    # def actual_donations(self, value):
    #     self.actual_donations = value


class Service(BaseModel):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(null=True)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name='services')


class IndicatorUnit(BaseModel):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=200)


class Indicator(BaseModel):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=200)
    target_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    # The unit of measure for this indicator; for example, 'aid packages distributed'
    unit = models.ForeignKey(
        IndicatorUnit, on_delete=models.PROTECT, related_name='indicators')
    # If an indicator is non-cumulative, this is its starting value
    baseline = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    is_cumulative = models.BooleanField(default=True)
    service = models.ForeignKey(
        Service, on_delete=models.CASCADE, related_name='indicators')

    # Actual indicator values. If an indicator is cumulative,
    # meaning its values can be added together (e.g. 'meals served') then we
    # calculate the sum of activities for that indicator.
    # If not (e.g. '% attendance rate'), return the latest value
    @property
    def actual(self):
        if self.is_cumulative:
            activities = self.activities.aggregate(actual=Sum('indicator_amount'))
            if activities.exists():
                return activities['actual'] or 0
            return 0
            # return self.activities.aggregate(actual=Sum('indicator_amount'))['actual'] or 0
        else:
            activities = self.activities.order_by('-date').order_by('-end_time')
            if activities.exists():
                return activities[0].indicator_amount or 0
            return 0
            # return self.activities.order_by('-date').order_by('-end_time')[0].indicator_amount or 0

    # Progress made towards target for indicator. Compare with target_quantity
    # or baseline, depending on indicator type.
    @property
    def progress(self):
        if self.is_cumulative:
            return self.actual / self.target_quantity
        return self.actual - (self.baseline or 0)

# TODO: add UUIDs to everything


class Activity(BaseModel):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    STATUS = Choices('completed', 'in progress')

    # date = models.DateField(default=lambda: timezone.now().date())
    date = models.DateField(default=current_date)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    status = StatusField()
    title = models.CharField(max_length=100)
    notes = models.TextField(null=True, blank=True)
    indicator = models.ForeignKey(
        Indicator, on_delete=models.CASCADE, related_name='activities')
    indicator_amount = models.DecimalField(max_digits=15, decimal_places=2)
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, related_name='locations', null=True, blank=True)

def activity_attachment_path(instance, filename):
    return '{}/activities/attachments/{}/{}'\
        .format(instance.parent_charity, datetime.datetime.now().strftime("%Y/%m/%d"), filename)


class ActivityAttachment(BaseModel):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    ipfs_hash = models.CharField(max_length=64, blank=True, null=True)
    activity = models.ForeignKey(
        Activity, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to=activity_attachment_path, max_length=200)
    # Flag indicating whether attachment will be published to decentralised storage as
    #  proof of the project outcome
    is_public = models.BooleanField(default=False)
    # hash = models.CharField(max_length=256, null=True, blank=True)


# Fields used to populate charity appeals page in donation tracker
# One project may have many appeals
class ProjectAppeal(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name='appeals')
    title = models.CharField(max_length=200, blank=True,
                             null=True, default='Charity Project')
    subtitle = models.CharField(max_length=400, default='Insert text here')
    date_started = models.DateField(
        null=True, blank=True, default=datetime.date.today)
    date_ended = models.DateField(null=True, blank=True)
    story = models.TextField(
        blank=True, null=True, default='Insert story of your charity project here')
    # Activates/deactivates charity appeal page
    is_live = models.BooleanField(default=False)


    # TODO: make parent_charity on BaseModel an FK to the actual charity, rahter than a UUID
    # field. When you've done that, delete this + replace with FK lookup
    @property
    def charity_name(self):
        charity_uuid = self.project.parent_charity
        try:
            charity = Charity.objects.get(uuid=charity_uuid).name
            return charity
        # TODO: This shouldn't happen when real data is imported - delete
        except (Charity.DoesNotExist, AttributeError):
            return None
        
    def get_photo(self):
        try:
            return self.photos.first().photo
        except (IndexError, AttributeError):
            return None

    # TODO: delete this
    def get_avatar(self):
        try:
            avatar = self.photos.last().photo
            print('Avatar found: ', avatar)
            return avatar
        except (IndexError, AttributeError):
            return None

# TODO: rename to ProjectAppealGallery
class ProjectGallery(BaseModel):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    project = models.ForeignKey(
        ProjectAppeal, on_delete=models.CASCADE, related_name='photos')
    # TODO: add default placeholder image
    photo = models.ImageField(default='placeholder.png')


# Updates posted to a charity project/appeal page
class ProjectAppealUpdate(BaseModel):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    appeal = models.ForeignKey(ProjectAppeal, on_delete=models.CASCADE)
    # TODO: perhaps omit, if UI doesn't need it
    update_title = models.CharField(max_length=200, blank=True, null=True)
    text = models.TextField()


# Taken from https://docs.djangoproject.com/en/5.0/ref/models/fields/#model-field-types
def user_project_path(instance, filename):
    # TODO: replace with 'media/userName/projectName/year/month/day?

    # file will be uploaded to MEDIA_ROOT / user_<id>/<filename>
    # return 'user_{0}/{1}'.format(instance.user.id, filename)
    return 'user_{0}/{1}'.format(0, filename)

# Images, video or other media attached to a project update


class ProjectUpdatesMedia(BaseModel):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    project = models.ForeignKey(
        ProjectAppealUpdate, on_delete=models.CASCADE, related_name='media')
    media = models.FileField(upload_to=user_project_path)


# A group of accounts set aside for a specific purpose (e.g. 'Youth Club fund', 'Africa Projects Fund')
class Fund(BaseModel):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    fund_name = models.CharField(max_length=200)

# TODO: automatically create a balancing equity account for each fund, if any accounts for the fund are > 0 (not empty)


class AccountType(BaseModel):
    # ACCOUNT_TYPES = (
    #     ('AST', 'Asset'),
    #     ('LIA', 'Liability'),
    #     ('INC', 'Income'),
    #     ('EXP', 'Expense'),
    #     ('EQU', 'Equity')
    # )
    class AccountTypes(models.TextChoices):
        AST = 'AST', 'Asset'
        LIA = 'LIA', 'Liability'
        INC = 'INC', 'Income'
        EXP = 'EXP', 'Expense'
        EQU = 'EQU', 'Equity'

    # name = models.CharField(max_length=3, choices=ACCOUNT_TYPES)
    name = models.CharField(max_length=3, choices=AccountTypes.choices)
    # code = models.IntegerField(unique=True)
    code = models.IntegerField()

    def clean(self, *args, **kwargs):
        # Check there is only 1 account for Asset, 1 for Liability etc
        if AccountType.objects.filter(name=self.name).count() > 1:
            raise ValidationError(
                f'No more than one %(name) class account allowed', params={"name": self.name})

        # Check that account types for each charity are unique
        if AccountType.objects.filter(name=self.name, parent_charity=self.parent_charity).count() > 1:
            raise ValidationError('Duplicate account type for this charity')

        if AccountType.objects.filter(name=self.name, parent_charity=self.parent_charity).count() > 1:
            raise ValidationError(
                f'No more than one %(name) class account allowed per charity', params={"name": self.name})

        super(AccountType, self).clean(*args, **kwargs)

# class AccountManager(models.Manager):


# TODO: consider using django-mptt to speed up tree traversals
# https://django-mptt.readthedocs.io/en/latest/tutorial.html
class Account(BaseModel):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    account_name = models.CharField(max_length=200)
    # Store whether account is a debit or credit account (e.g. Expenses are credit, assets are debit)
    # TODO: inherit this value from parent
    normal = models.IntegerField(
        choices=((1, 'DEBIT'), (-1, 'CREDIT')), default=1)
    # TODO: enforce that the code is within range of account codes of parent (e.g. '100' -> '100.1' or '105' up to next one in group)
    # or otherwise create hierarchical coding scheme (https://letsledger.com/blog/accounting-projects/the-accounting-code/)
    code = models.IntegerField(unique=True)
    is_active = models.BooleanField(default=True)

    balance = MoneyField(max_digits=19, decimal_places=4,
                         default_currency='GBP', default=0)

    # TODO: delete + replace with Treebeard Materialised Path
    ultimate_parent = models.ForeignKey(
        AccountType, on_delete=models.CASCADE, related_name='primary_accounts', null=True, blank=True)
    parent_account = models.ForeignKey(
        'self', on_delete=models.CASCADE, related_name='children', null=True, blank=True)
    # TODO: create a 'default VAT rate' for an account, which auto-fills the 'VAT rate' for a transaction involving this account
    # Sources: https://central.xero.com/s/article/Components-of-an-account-in-your-chart-of-accounts and https://www.accountsportal.com/docs/chart-of-accounts/215545763

    # Link to the account in the Standard Chart of Accounts for the country the company is in
    standard_account = models.ForeignKey(
        'StandardAccount', on_delete=models.CASCADE, related_name='user_accounts', null=True, blank=True)
    fund = models.ForeignKey(
        Fund, on_delete=models.CASCADE, related_name='accounts', null=True, blank=True)
    

    def clean(self):
        """
            Ensures Account have either an ultimate_parent, if they are at 
            the top of the hierarchy, or another account as parent_account, 
            but not both.
        """
        if (self.ultimate_parent and self.parent_account) or (
            not (self.ultimate_parent) and not (self.parent_account)
        ):
            raise ValidationError(
                {'ultimate_parent': 'Account must have either a parent_account or an ultimate_parent, but not both.'})

    # TODO: make this a mixin to avoid repeated code elsewhere
    def save(self, *args, **kwargs):
        self.full_clean()
        return super(Account, self).save(*args, **kwargs)
    
    # TODO: check balance equals the sum of transactions (perhaps a cron job/celery task
    # is a better place to do this)


# Official account code from the relevant national standard chart of accounts
# (used to produce standards-compliant financial statements)
class StandardAccount(Account):
    # TODO: create an enum of standard CoAs (e.g. GAAP, IFRS, industry-specific, non-prfit, by country) and field to specify which one
    # account belongs to
    # TODO: duplicate properties of Account, and remove 'standard_account' ad 'fund'
    '''Otherwise identical to the regular Chart of Accounts represented by "Account"'''

# TODO: choose fields generic enough for any countries' bank account details
# bank account details for the charity itself, for bank deposits/other bank transactions


class BankAccount(BaseModel):
    '''Bank account details - not a double-entry account'''
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    ACCOUNT_TYPES = (
        (0, 'Savings'),
        (1, 'Current'),
        (2, 'Deposits'),
        (3, 'Money market')
    )
    account_type = models.IntegerField(choices=ACCOUNT_TYPES, default=1)
    double_entry_account = models.OneToOneField(
        Account, related_name='bank_details', on_delete=models.SET_NULL, blank=True, null=True)
    owner = models.ForeignKey(
        Charity, related_name='accounts', on_delete=models.CASCADE)
    # Per ISO 7812 - https://open-banking.pass-consulting.com/json_AccountReference.html
    account_number = models.CharField(max_length=35)
    sort_code = models.CharField(max_length=6)  # For
    bank_name = models.CharField(max_length=200, blank=True, null=True)
    # 9-digit numeric string - ABA routing number for accounts with US banks
    routing_number = models.CharField(max_length=9, validators=[
                                      RegexValidator(r'^\d+$')])


class SourceDocument(BaseModel):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    date = models.DateField(auto_now_add=True)

    objects = InheritanceManager()


class SourceDocumentAttachments(BaseModel):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    source_document = models.ForeignKey(
        SourceDocument, related_name='attachments', on_delete=models.CASCADE)
    file = models.FileField(upload_to='uploads/',
                            max_length=254, null=True, blank=True)
    # Flag to indicate whether attachment will be shared to donors on donation tracker
    # as evidence of the transaction
    is_public = models.BooleanField(default=False)


class SourceDocumentComments(BaseModel):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    source_document = models.ForeignKey(
        SourceDocumentAttachments, related_name='comments', on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    text = models.TextField()
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='comments')


# TODO: Finish and Pre-populate with this info https://www.tide.co/blog/business-tips/vat-codes/ (see also QB VAT rates table)
# if time, create tables for users to set their own rates
class VATRates(BaseModel):
    name = models.CharField(max_length=200)
    # VAT Rates can be 2 decimal place percentage values (e.g. 7.25% in some US states)
    amount = models.DecimalField(
        max_digits=5, decimal_places=2, validators=PERCENTAGE_VALIDATOR)
    description = models.TextField()

# # TODO: for testing, remove
# VATRates(name='standard', amount=20, description="Standard rate - 20\%\ for most goods and services")

# def default_vat_rate():
#     return VATRates.objects.get(name='standard')


class Transaction(BaseModel):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    project = models.ForeignKey(
        Project, on_delete=models.SET_NULL, related_name='transactions', blank=True, null=True)
    timestamp = models.DateTimeField(default=timezone.now)
    # Optional, as journal entries may not be associated with a source document
    source_doc = models.ForeignKey(
        SourceDocument, on_delete=models.SET_NULL, related_name='transaction', null=True, blank=True)
    # Look up relevant VAT (sales tax) rate for transaction
    # TODO: enable default (in commented out code)
    # VAT_rate = models.ForeignKey('VATRates', on_delete=models.SET_DEFAULT, null=True, blank=True, default=default_vat_rate)
    VAT_rate = models.ForeignKey(
        'VATRates', on_delete=models.SET_NULL, null=True, blank=True)

    # # TODO: this doesn't work because you can't call reverse accessors (which is what I'm doing here)
    # # until you've saved the object. So move this validation logic to the serialiser instead
    # # --- Check that debits and credits add up ----
    # def clean(self):
    #     # Multiply transaction amounts by direction, and add up
    #     # transaction_legs = self.entries.all()

    #     # if transaction_legs:
    #     if self.filter(transactiondetail_isnull=False):
    #         transaction_legs = self.entries.all()
    #         total = sum(i.amount * i.direction for i in transaction_legs)

    #         # Total should equal 0
    #         if total != 0:
    #             raise ValidationError("Debits and credits must balance.")

    # TODO: make this a mixin to avoid repeated code elsewhere

    def save(self, *args, **kwargs):
        self.full_clean()
        return super(Transaction, self).save(*args, **kwargs)


class TransactionDetail(BaseModel):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    # Multiply amount by this number, to determine if amount is to be debited or
    # credited to an account (inspired by https://blog.journalize.io/posts/an-elegant-db-schema-for-double-entry-accounting/)

    class Direction(models.IntegerChoices):
        DEBIT = 1,
        CREDIT = -1

    transaction = models.ForeignKey(
        Transaction, related_name='entries', on_delete=models.CASCADE, blank=True, null=True)
    account = models.ForeignKey(
        # Account, on_delete=models.PROTECT, limit_choices_to={'is_active': True})
        Account, on_delete=models.CASCADE, limit_choices_to={'is_active': True})
    # Using DECIMAL(27, 18) to support cryptocurrencies (https://stackoverflow.com/a/224866/405682)
    amount = MoneyField(max_digits=27, decimal_places=18,
                        default_currency='GBP')
    narration = models.TextField(blank=True, null=True)
    direction = models.IntegerField(choices=Direction.choices)

    # TODO: delete - replaced by code below
    # def update_account_balance(self):
    #     self.account.balance += self.amount * self.direction
    #     self.account.save()


    def save(self, *args, **kwargs):
        """Override save to update account balance before saving to DB."""

        # TODO: unit test this works
        # Only add to balance if new transaction amounts are given,
        if 'amount' and 'direction' in kwargs:

            # Instead of 'self.account.balance += self.amount * self.direction',
            # Using the F() query expression asks the DB to retrieve the values
            # for the calculation of balance, avoiding race conditions due to
            # concurrent updates
            self.account.balance += F("amount") * F("direction")
            with transaction.atomic():
                self.account.save()
            # Reload object from DB to avoid F() expression being applied twice
            # (see https://docs.djangoproject.com/en/5.0/ref/models/instances/#django.db.models.Model.arefresh_from_db)
            self.account.refresh_from_db()
        super().save(*args, **kwargs)


class Donor(Person):
    GIVING_STAGES = (
        ('U', 'Unqualified'),
        ('Q', 'Qualified'),
        ('C', 'Cultivated'),
        ('S', 'Solicited'),
        ('SS', 'Stewarded')
    )

    # For donor management (i.e. marketing) purposes - see, for example, https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-prospect-status.html
    giving_stage = models.CharField(
        max_length=2, choices=GIVING_STAGES, default='U')
    description = models.TextField(blank=True, null=True)
    profile = models.OneToOneField(
        Profile, on_delete=models.CASCADE, related_name='donor_account', null=True, blank=True)

    # is_person = models.BooleanField(default=True)
    # TODO: interests, donorType, communicationPreferences

    # TODO: DELETE THIS (can't choose parent model dynamically in Django)
    # class Meta:
    #     bases = decide_parent(is_person=self.is_person)

# TODO: add a ManytoMany field to Donor instead, for DonorInterests
# # Charity projects that donor has expressed an interest in, and may
# # support in future/be supporting
# class DonorInterests(models.Model):
#     donor = models.ForeignKey(Donor, on_delete=models.CASCADE, related_nme='interests')
#     projects = models.ForeignKey(Project, on_delete=models.CASCADE, related_nme='interests')

# TODO: add an 'amount' field totalling the donation value (check it equals the TransactionDetail values)
# perhaps with a UI check (total = value in journal entry form fields)
# TODO: find a way to check this server-side (can't do here, as Transaction is created after the initial Donation)


class Donation(SourceDocument):
    donor = models.ForeignKey(Donor, on_delete=models.SET_NULL,
                              related_name='donations', blank=True, null=True)
    reference = models.CharField(max_length=64, blank=True, null=True, validators=[
                                 RegexValidator(r'^[0-9a-zA-Z]*$', 'Only alphanumeric characters are allowed.')])
    amount = MoneyField(max_digits=19, decimal_places=4,
                        default_currency='GBP')
    # Notes about the donation, additional to the narration in each TransactionDetail
    memo = models.TextField(blank=True, null=True)
    acknowledged = models.BooleanField(default=False)
    payment_method = models.IntegerField(
        choices=tuple(enumerate(PAYMENT_METHODS)), default=0)
    # Employee who handled the donation. For internal control purposes
    received_by = models.ForeignKey(
        User, related_name='recipient', on_delete=models.SET_NULL, null=True, blank=True)
    appeal = models.OneToOneField(ProjectAppeal, on_delete=models.CASCADE, related_name='appeal', null=True, blank=True)

    def calculate_amount(self):
        donation_transaction = self.transaction.first()
        if donation_transaction:
            credit_entries = donation_transaction.entries.filter(direction__exact=-1)
            amount = sum(entry.amount for entry in credit_entries)
            if (type(amount) == int):
                return Decimal(amount)
            return amount.amount
        return 0
        # credit_entries = self.transaction.first().entries.filter(direction__exact=-1)

    # def clean(self):
    #     # Checks that the appeal recorded is an existing appeal of the charity donated to.
    #     # Prevents inconsistencies between Donation -> ProjectAppeal record and 
    #     # Donation -> Transaction -> Project -> ProjectAppeal record
    #     valid_appeals = ProjectAppeal.objects.filter(project__transactions__source_doc=self)
    #     if self.appeal and not self.appeal in valid_appeals:
    #         raise ValidationError({'appeal': 'Not a valid appeal of the charity selected'})
            
class Counterparty(Organisation):
    """
        Abstract base class used to reduce code duplication between
        Customer and Supplier
    """
    # company_name = models.CharField(max_length=200)
    display_name = models.CharField(max_length=200, null=True, blank=True)
    # Person to whom correspondence should be addressed
    primary_contact = models.OneToOneField(
        Person, null=True, blank=True, on_delete=models.SET_NULL)
    # May contain numbers, letters and non-alphanumeric characters (e.g. dots)
    VAT_number = models.CharField(max_length=15, null=True, blank=True)
    is_VAT_number_validated = models.BooleanField(default=False)

    class Meta:
        abstract = True


class Customer(Counterparty):
    """All fields and methods from Counterparty"""


class Supplier(Counterparty):
    """All fields and methods from Counterparty"""


class Expense(SourceDocument):
    supplier = models.ForeignKey(
        Supplier, related_name='expenses', on_delete=models.SET_NULL, null=True, blank=True)
    payment_type = models.IntegerField(
        tuple(enumerate(PAYMENT_METHODS)), null=True, blank=True)
    # Will be displayed on donation tracker in breakdown of spending
    expense_type = models.CharField(max_length=64)


class InvoiceTerm(SourceDocument):

    days_due = models.IntegerField()
    # Percentage discount for early payment
    trade_discount = models.IntegerField(blank=True, null=True)
    # Number of days within which payment must be made for
    # discount
    trade_discount_days = models.IntegerField(blank=True, null=True)

    # # Default value
    # @classmethod
    # def get_default_pk(cls):
    #     invoice_term, created = cls.objects.get_or_create(
    #         # Default statutory 30-day payment period
    #         days=30
    #     )
    #     return invoice_term.pk


class Invoice(SourceDocument):
    due_date = models.DateField()
    is_cancelled = models.BooleanField(default=False)
    # TODO: how to implement a default value
    terms = models.ForeignKey(
        InvoiceTerm, on_delete=models.PROTECT, related_name='invoices', null=True, blank=True)
    customer = models.ForeignKey(
        Customer, related_name='invoices', on_delete=models.PROTECT)

    # supplier = models.ForeignKey(
    #     Supplier, related_name='invoices', on_delete=models.DO_NOTHING, null=True, blank=True)
    # payment_type = models.IntegerField(
    #     tuple(enumerate(PAYMENT_METHODS)), null=True, blank=True)
    # # Will be displayed on donation tracker in breakdown of spending
    # invoice_type = models.CharField(max_length=64)


class InvoiceTemplate(SourceDocument):
    template_name = models.CharField(max_length=200)
    logo = models.ImageField(blank=True, null=True)
    primary_color = ColorField(default='#FF0000', blank=True, null=True)
    email_response_address = models.EmailField(blank=True, null=True)
    footer_text = models.TextField(blank=True, null=True)
    parent_invoice = models.ForeignKey(
        Invoice, on_delete=models.CASCADE, related_name='templates')


class Bill(SourceDocument):
    supplier = models.ForeignKey(
        Supplier, related_name='bills', on_delete=models.PROTECT)
    # Reference number issued by supplier on their invoices/correspondence
    supplier_reference = models.CharField(
        max_length=200, unique=True, blank=True, null=True)
    is_paid = models.BooleanField(default=False)

# TODO:  MORE LOOKUP TABLES

    # question_text = models.CharField(max_length=200)
    # pub_date = models.DateTimeField("date published")

#     DROP TABLE accounting_city;
#  DROP TABLE accounting_country;
#  DROP TABLE accounting_district;
#  DROP TABLE accounting_region;

# class Choice(models.Model):
#     question = models.ForeignKey(Question, on_delete=models.CASCADE)
#     choice_text = models.CharField(max_length=200)
#     votes = models.IntegerField(default=0)


