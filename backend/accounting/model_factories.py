import factory
import datetime as dt
import random
from factory import fuzzy
from accounting import models
from accounting.constants import PAYMENT_METHODS
from django.db.models import signals, Sum
from django.contrib.auth.models import User as DjangoUser
from PIL import ImageColor
from faker.providers import BaseProvider
from accounting.blockchain import BlockchainProvider


GIVING_STAGES = ('U', 'Q', 'C', 'S', 'SS')
ACCOUNT_TYPES = { 'AST': '100', 'LIA': '200', 'INC': '300', 'EXP': '400', 'EQU': '500'}

# TODO: inherit from base class, BaseModel

# Credit: code from https://github.com/FactoryBoy/factory_boy/pull/820#issuecomment-1004802669


class UniqueFaker(factory.Faker):

    @classmethod
    def _get_faker(cls, locale=None):
        return super()._get_faker(locale=locale).unique


# def faker():
#     return factory.Faker._get_faker()

# Adapted from code here https://github.com/FactoryBoy/factory_boy/issues/260
class ImageProvider(BaseProvider):
    def image_width(self):
        return self.random_int(100, 200)

    def image_height(self):
        return self.random_int(100, 200)
    
    def image_color(self):
        return random.choice(list(ImageColor.colormap.keys()))


class ImageFaker(factory.Faker):
     
    @classmethod
    def _get_faker(cls, locale=None):
        faker = super()._get_faker(locale=locale)
        faker.add_provider(ImageProvider)
        return faker


def to_date(date_string, format="%Y-%m-%d"):
    """Convert date string to a datetime object."""

    return dt.datetime.strptime(date_string, format)


def add_to_time(time_arg, format="%H:%M:%S"):
    """
        Helper function to add a random time interval to a given time string.

        Converts time string to a datetime (with a random date attached to it),
        adds a random timedelta, and strips the date portion to give a 
        final time.

        Args:
            time_arg: must be either string or datetime.time object
    """

    assert type(time_arg) in (str, dt.time), 'time_arg must be a string or a valid datetime.time object'
     
    if type(time_arg) == dt.time:
        time_arg = time_arg.strftime('%H:%M:%S')
    
    to_datetime = dt.datetime.strptime(time_arg, format)

    hours = random.randint(1, 24)
    minutes = random.randint(0, 59)
    seconds = random.randint(0, 59)
    time_delta = dt.timedelta(
        hours=hours, minutes=minutes, seconds=seconds)

    # Cannot add times together with timedelta, so must convert to dates first
    # then remove the date part
    added_datetime = to_datetime + time_delta
    added_time = added_datetime.time()

    return added_time


def random_money():
    """
        Generate a random amount of money by joining a number
        and a currency code.
    """

    currency_code = factory.Faker('currency')


class BaseModelFactory(factory.django.DjangoModelFactory):
    parent_charity = factory.Faker('uuid4')

    class Meta:
        abstract = True


@factory.django.mute_signals(signals.post_save)
# class AccountTypeFactory(factory.django.DjangoModelFactory):
class AccountTypeFactory(BaseModelFactory):
    class Meta:
        model = models.AccountType
    name = factory.Faker('random_element', elements=[
                         'AST', 'LIA', 'INC', 'EXP', 'EQU'])
    # code = factory.Sequence(lambda n: f'{n + 1}00')
    code = factory.LazyAttribute(lambda o: ACCOUNT_TYPES[o.name])
    # code = factory.Iterator(list(range(100)))


class AccountFactory(BaseModelFactory):
    """
        To handle parent_account recursively creating another Account,
        we use the fully qualified path to AccountFactory.
        To deal with the condition 'either parent_account or ultimate_parent are set,
        but not both, we use the Maybe() function to choose one or the other,
        depending on the boolean returned by is_top_level_account()
    """

    class Meta:
        model = models.Account
        django_get_or_create = ('ultimate_parent',)

    account_name = factory.Faker('sentence', nb_words=2)
    normal = factory.Faker('random_element', elements=[1, -1])
    # code = factory.Sequence(lambda n: int(f'{n}00{n}'))
    code = factory.Faker('random_number', digits=8)
    is_active = factory.Faker('boolean')
    balance = factory.Faker(
        'pydecimal', left_digits=random.randint(2, 8), right_digits=2, min_value=0)
    parent_account = None
    ultimate_parent = factory.SubFactory(AccountTypeFactory)

    # # Avoid recursion errors due to circular import with a fully qualified path
    # # https://factoryboy.readthedocs.io/en/stable/reference.html#circular-imports
    # parent_account = factory.Maybe(
    #     'is_top_level_account',
    #     yes_declaration=factory.LazyFunction(lambda: None),
    #     # yes_declaration=None,
    #     no_declaration=factory.SubFactory(
    #         'accounting.model_factories.AccountFactory', parent_account=None)
    # )
    # ultimate_parent = factory.Maybe(
    #     'is_top_level_account',
    #     yes_declaration=factory.SubFactory(AccountTypeFactory),
    #     # no_declaration=None
    #     no_declaration=factory.LazyFunction(lambda: None)
    # )

    # @factory.lazy_attribute
    # def is_top_level_account(self):
    #     # return random.choice([True, False]) or self.parent_account is None
    #     return random.choice([True, False])


@factory.django.mute_signals(signals.post_save)
class UserFactory(factory.django.DjangoModelFactory):
    id = factory.Sequence(lambda n: n + 1)
    username = factory.Faker('user_name')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    email= factory.Faker('email')
    is_staff = False
    is_active = factory.Faker('boolean')

    class Meta:
        model = DjangoUser
    
    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        # Create a user only if a record for them does not already exist
        # Credit: from https://stackoverflow.com/a/49615209
        id = kwargs.pop('id', None)
        password = kwargs.pop('password', None)
        obj, created = model_class.objects.get_or_create(
            id=id, defaults=kwargs)
        if created and password:
            obj.set_password(password)
            obj.save()
        return obj


class DistrictFactory(BaseModelFactory):
    name = factory.Faker('state')

    class Meta:
        model = models.District


class CityFactory(BaseModelFactory):
    name = factory.Faker('city')

    class Meta:
        model = models.City


class RegionFactory(BaseModelFactory):
    name = factory.Faker('state')
    code = factory.Faker('pystr', min_chars=3, max_chars=3)
    state_area_code = factory.Faker('pystr', min_chars=3, max_chars=3)

    class Meta:
        model = models.Region


# class CountryFactory(factory.django.DjangoModelFactory):
    # parent_charity = factory.Faker('uuid4')
class CountryFactory(BaseModelFactory):
    iso_code = UniqueFaker('country_code')
    # iso_code = factory.Sequence(lambda n: UniqueFaker("country_code"))
    name = factory.Faker('country')

    class Meta:
        model = models.Country


# class AddressFactory(factory.django.DjangoModelFactory):
    # parent_charity = factory.Faker('uuid4')
class AddressFactory(BaseModelFactory):

    uuid = factory.Faker('uuid4')
    address1 = factory.Faker('sentence', nb_words=3)
    address2 = factory.Faker('sentence', nb_words=3)
    address3 = factory.Faker('sentence', nb_words=3)
    postal_code = factory.Faker('postcode')
    district = factory.SubFactory(DistrictFactory)
    city = factory.SubFactory(CityFactory)
    region = factory.SubFactory(RegionFactory)
    # country = factory.RelatedFactory(CountryFactory)
    country = factory.Faker('country_code')

    class Meta:
        model = models.Address


class ContactFactory(BaseModelFactory):
    uuid = factory.Faker('uuid4')
    phone_number = factory.Faker('phone_number')
    email = factory.Faker('email')
    address = factory.SubFactory(AddressFactory)
    avatar = factory.django.ImageField()
    blockchain_id = factory.LazyFunction(BlockchainProvider.generate_eth_address)

    class Meta:
        # model = models.Contact
        abstract = True


class PersonFactory(ContactFactory):
    title = factory.Faker('random_element', elements=(0, 1, 2, 3))
    first_name = factory.Faker('first_name')
    middle_names = factory.Faker('last_name')
    last_name = factory.Faker('last_name')
    suffix = factory.Faker('random_element', elements=(
        'Jr.', 'II', 'III', 'Sr.', 'Esq.', 'PhD', 'MD', 'JD'))
    occupation = factory.Faker('word')
    nationality = factory.Faker('country_code')

    class Meta:
        model = models.Person


class OrganisationFactory(ContactFactory):
    name = factory.Faker('company')
    sector = factory.Faker('sentence', nb_words=2)

    class Meta:
        model = models.Organisation


class CounterpartyFactory(OrganisationFactory):
    display_name = factory.Faker('company')
    primary_contact = factory.SubFactory(PersonFactory)
    VAT_number = factory.Faker('pystr', min_chars=15, max_chars=15)
    is_VAT_number_validated = factory.Faker('boolean')

    class Meta:
        abstract = True

class BlockchainUserFactory():
    blockchain_address = factory.LazyFunction(lambda: BlockchainProvider.generate_eth_address())
    class Meta:
        model = models.BlockchainUser


class SupplierFactory(CounterpartyFactory):
    # blockchain_id = factory.LazyFunction(lambda: BlockchainProvider.generate_eth_address())
    # blockchain_id = factory.LazyAttribute(lambda o: factory.SubFactory(
    #     BlockchainUserFactory, 
    #     name=o.name, 
    #     avatar=o.avatar)

    class Meta:
        model = models.Supplier


class CustomerFactory(CounterpartyFactory):
    class Meta:
        model = models.Customer


class CharityFactory(OrganisationFactory):
    parent_charity = None
    legal_structure = factory.Faker(
        'random_element',
        elements=('CIO', 'COMP', 'UNC', 'TR', 'OTH', None))
    legal_structure_other = factory.Maybe(
        'legal_structure',
        None,
        factory.Faker('word'))
    charity_commission_number = factory.Faker(
        'pystr', min_chars=8, max_chars=8)
    slogan = factory.Faker('sentence', nb_words=8)
    mission = factory.Faker('text')

    class Meta:
        model = models.Charity
        exclude = ('parent_charity',)

    # # TODO: implement this to ensure address/other objects point back to 
    # # correct charity
    # @classmethod
    # def _after_postgeneration(cls, obj, create, results=None):
    #     if not create:
    #         return
    #     obj.address.parent_charity = uuid
    #     obj.save()

    

    # @classmethod
    # def create(cls, *args, **kwargs):
    #     # Remove this field before saving the charity
    #     print('args: ', args)
    #     print('kwargs: ', kwargs)
    #     parent_charity = kwargs.pop('parent_charity', None)
    #     return super().create(*args, **kwargs)
    #     # obj = model_class.objects.create(kwargs)
    #     # return obj


@factory.django.mute_signals(signals.post_save)
class ProfileFactory(ContactFactory):
# class ProfileFactory(factory.django.DjangoModelFactory):
    # uuid = factory.Faker('uuid4')
    # phone_number = factory.Faker('phone_number')

    # email = factory.Faker('email')
    # address = factory.SubFactory(AddressFactory)
    # avatar = factory.django.ImageField()
    notifications_enabled = factory.Faker('boolean')

    user_type = factory.Faker('random_element', elements=(0, 1))
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    user = factory.SubFactory(UserFactory)

    class Meta:
        model = models.Profile
        django_get_or_create = ('user',)
        exclude=('parent_charity',)


class ProfileCharityFactory(factory.django.DjangoModelFactory):

    profile = factory.SubFactory(ProfileFactory)
    charity = factory.SubFactory(CharityFactory)
    selected = factory.Faker('boolean')

    class Meta:
        model = models.ProfileCharity


class DonorFactory(PersonFactory):
    # parent_charity = factory.Faker('uuid4')
    giving_stage = factory.Faker('random_element', elements=GIVING_STAGES)
    description = factory.Faker('text')
    profile = factory.SubFactory(ProfileFactory)

    class Meta:
        model = models.Donor
        django_get_or_create = ('profile',)


# class UserFactory(factory.django.DjangoModelFactory):
#     class Meta:
#         model = DjangoUser


class SourceDocumentFactory(BaseModelFactory):
    # parent_charity = factory.Faker('uuid4')
    uuid = factory.Faker('uuid4')
    date = factory.Faker('date')

    class Meta:
        model = models.SourceDocument


class ProjectFactory(BaseModelFactory):
    """
        Factory class to generate Project model instances.
    """
    class Meta:
        model = models.Project

    name = factory.Faker('sentence', nb_words=5)
    start_date = factory.Faker('date')
    end_date = factory.LazyAttribute(lambda o:
                                     (to_date(
                                         o.start_date) + dt.timedelta(days=random.randint(1, 364))
                                      ).strftime("%Y-%m-%d"))
    target_donations = factory.Faker(
        'pydecimal', min_value=0, left_digits=8, right_digits=2)
    services = factory.RelatedFactoryList(
        'accounting.model_factories.ServiceFactory',
        factory_related_name='project',
        size=lambda: random.randint(2, 5),
    )

    # target_amount = factory.Faker('pydecimal', min_value=0, left_digits=8, right_digits=2)

    # project = factory.SubFactory(ProjectFactory)

    # donations = factory.List([
    #     factory.SubFactory(
    #         DonationFactory,
    #         transactions__project=self
    #     ) for _ in range(random.randint(2, 5))
    # ])

    # factory_related_name='project',
    # size=lambda: random.randint(2, 5),
    # project=self

    # donations = factory.RelatedFactoryList(
    #     'accounting.model_factories.DonationFactory',
    #     # factory_related_name='project',
    #     size=lambda: random.randint(2, 5),
    #     # project=self
    # )

    # To avoid a circular dependency, where Project tries to create a Donation
    # and the Donation subsequently tries to create a related Project, we create
    # related donations using the post_generation hook after the main Project object
    # is created
    # @factory.post_generation
    # def create_donations(self, create, extracted, **kwargs):
    #     self.donations = factory.RelatedFactoryList(
    #         DonationFactory,
    #         factory_related_name='project',
    #         size=lambda: random.randint(2, 5),
    #         project=self
    #     )

    @factory.post_generation
    def create_transactions(self, create, extracted, **kwargs):
        """
            Create donations and expenses related to project and store total
            amount of donations in the actual_donations field, as performed in
            the Project model
        """
        # self.donations = factory.List([
        #     factory.SubFactory(
        #         DonationFactory,
        #         transactions__project=self
        #     ) for _ in range(random.randint(2, 5))
        # ])
        # for _ in range(random.randint(2, 5)):

        # for i in range(random.randint(2,5)):
        #     DonationFactory.create(transaction__project=self)
        #     ExpenseFactory.create(transaction__project=self)


        # # TODO: temporarily abandon creating related transactions
        # # try to resolve if time:
        # # >>>>>>>>>>>>>>>>>>>>>>>>>>> #
        # DonationFactory.create_batch(
        #     random.randint(2, 5), transaction__project=self)
        # # self.donations = models.Donation.objects.filter(
        # #     transaction__project=self)
        # ExpenseFactory.create_batch(
        #     5, transaction__project=self
        # )
        # # >>>>>>>>>>>>>>>>>>>>>>>>>>>> #



        # self.actual_donations = self.donations.aggregate(
        #     actual_donations=Sum('amount'))['actual_donations'] or 0

    # @classmethod
    # def _after_postgeneration(cls, obj, create, results=None):
        # if not create:
        #     return
        # if extracted:
        #     for donation in extracted:
        # obj.actual_donations = obj.donations.aggregate(
        #     actual_donations=Sum('amount'))['actual_donations'] or 0
        # donations = Donation.objects.filter(transaction__project=self)
        # if donations.exists():
        #     return donations.aggregate(actual_donations=Sum('amount'))['actual_donations']
        # return Decimal(0)


class ProjectAppealFactory(factory.django.DjangoModelFactory):
    """
        Factory class to generate ProjectAppeal instances.
    """
    class Meta:
        model = models.ProjectAppeal

    uuid = factory.Faker('uuid4')
    project = factory.SubFactory(ProjectFactory)
    title = factory.Faker('sentence', nb_words=3)
    subtitle = factory.Faker('sentence', nb_words=10)
    date_started = factory.Faker('date')
    date_ended = factory.LazyAttribute(lambda o:
                                     (to_date(
                                         o.date_started) + dt.timedelta(days=random.randint(365, 730))
                                      ).strftime("%Y-%m-%d"))
    story = factory.Faker('text')
    is_live = factory.Faker('boolean')


class ProjectAppealUpdateFactory(BaseModelFactory):

    uuid = factory.Faker('uuid4')
    project = factory.SubFactory(ProjectFactory)
    update_title = factory.Faker('sentence', nb_words=3)
    text = factory.Faker('text')

    class Meta:
        model = models.ProjectAppealUpdate


class ProjectUpdatesMediaFactory(BaseModelFactory):
    uuid = factory.Faker('uuid4')
    project = factory.SubFactory(ProjectAppealUpdateFactory)
    media = factory.django.FileField(
        filename=lambda: f'user_{random.randint(1, 100)}/{random.randint(1, 100)}')

    class Meta:
        model = models.ProjectUpdatesMedia


class FundFactory(BaseModelFactory):
    uuid = factory.Faker('uuid4')
    fund_name = factory.Faker('sentence', nb_words=3)

    class Meta:
        model = models.Fund


class SourceDocumentAttachmentsFactory(BaseModelFactory):
    uuid = factory.Faker('uuid4')
    source_document = factory.SubFactory(SourceDocumentFactory)
    file = factory.django.FileField()
    is_public = factory.Faker('boolean')

    class Meta:
        model = models.SourceDocumentAttachments


class SourceDocumentCommentsFactory(BaseModelFactory):
    uuid = factory.Faker('uuid4')
    source_document = factory.SubFactory(SourceDocumentFactory)
    date = factory.Faker('date')
    text = factory.Faker('text')
    user = factory.SubFactory(UserFactory)

    class Meta:
        model = models.SourceDocumentComments


class VATRatesFactory(BaseModelFactory):
    name = factory.Faker('word')
    amount = factory.Faker('pydecimal', right_digits=2,
                           left_digits=3, min_value=0)
    description = factory.Faker('sentence')

    class Meta:
        model = models.VATRates


@factory.django.mute_signals(signals.post_save)
class TransactionDetailFactory(BaseModelFactory):
    uuid = factory.Faker('uuid4')
    transaction = factory.SubFactory(
        'accounting.model_factories.TransactionFactory')
    account = factory.SubFactory(AccountFactory)
    amount = factory.Faker('pydecimal', min_value=0,
                           right_digits=2, left_digits=8)
    narration = factory.Faker('text')
    direction = factory.Faker('random_element', elements=(-1, 1))

    class Meta:
        model = models.TransactionDetail
        django_get_or_create = ('account',)


@factory.django.mute_signals(signals.post_save)
# class TransactionFactory(factory.django.DjangoModelFactory):
class TransactionFactory(BaseModelFactory):
    # id = factory.Sequence(lambda n: n)
    # uuid = factory.Faker('uuid')
    project = factory.SubFactory(ProjectFactory)
    timestamp = factory.Faker('date_time')
    source_doc = factory.SubFactory(SourceDocumentFactory)
    # source_doc = None
    VAT_rate = factory.SubFactory(VATRatesFactory)
    # entries = factory.RelatedFactory(TransactionDetailFactory, factory_related_name='transaction')

    class Meta:
        model = models.Transaction
        django_get_or_create = ('project',)

    @factory.post_generation
    def add_entries(self, create, extracted, **kwargs):
        # self.entries = factory.RelatedFactory(
        #     TransactionDetailFactory,
        #     transaction=self
        # )
        
        # Credit a credit and debit entry for each transaction
        transaction_amount = kwargs.get('amount', None) or round(random.uniform(100, 1000), 2)
        TransactionDetailFactory(transaction=self, amount=transaction_amount, direction=1)
        TransactionDetailFactory(transaction=self, amount=transaction_amount, direction=-1)


# TODO: bug - DonationFactory creates two related Transactions, each with one TransactionDetail
# instead of the other way round - resolve this
class DonationFactory(SourceDocumentFactory):
    # parent_charity = factory.Faker('uuid4')

    donor = factory.SubFactory(DonorFactory)
    reference = factory.Faker('pystr', min_chars=10, max_chars=20)
    amount = factory.Faker('pydecimal', right_digits=2,
                           left_digits=8, min_value=0)
    memo = factory.Faker('text')
    acknowledged = factory.Faker('boolean')
    payment_method = factory.Faker('random_element', elements=list(range(7)))
    received_by = factory.SubFactory(UserFactory)
    # Create transaction, where the debit and credit entries record the total amount
    # in the 'amount' field above
    # DOESN'T WORK - 'o.amount' is still __pending in Resolver when we call the 'transaction' RelatedFactory,,
    # so throws a 'CyclicDependency' error - perform this later, in post_generation
    # transaction = factory.RelatedFactory(
    #     TransactionFactory, 
    #     factory_related_name='source_doc', 
    #     amount=factory.LazyAttribute(lambda o: o.amount))

    # TODO: convert back to SubFactory if not working
    # transaction = factory.RelatedFactory(
        # 'accounting.model_factories.TransactionFactory')

    # appeal = factory.SubFactory('accounting.model_factories.ProjectAppealFactory')
    # transaction = factory.RelatedFactory(TransactionFactory)

    # transactions = factory.List(
    #     [factory.SubFactory(TransactionFactory, source_document=None) for _ in range(random.randint(2, 5))]
    # )

    class Meta:
        model = models.Donation
        django_get_or_create = ('received_by',)

    # # TODO: working vesrsion (14/7/24) - uncomment + use if List(RelatedFactory) doesn't work
    # # >>>>>>>>>>>>>>>>> #
    # # Set up related objects
    # @factory.post_generation
    # def create_related_objects(self, create, extracted, **kwargs):
    #     if create:
    #         for _ in range(random.randint(2,5)):
    #             if (project := kwargs.get('project', None)):
    #                 TransactionFactory(source_doc=self, project=project)
    #             else:
    #                 TransactionFactory(source_doc=self)
    # # >>>>>>>>>>>>>>>>> #

    @factory.post_generation
    def create_transaction(self, create, extracted, **kwargs):
        if create:
            TransactionFactory(
                source_doc=self, 
                add_entries__amount=self.amount, 
                # add_entries={
                #     'amount': self.amount,
                #     'transaction': self
                # },
                **kwargs)

                
        # self.transactions = factory.List(
        #     [factory.SubFactory(TransactionFactory, source_doc=self)
        #         for _ in range(random.randint(2, 5))]
        # )

        # for transaction in self.transactions.objects.all():
        #     transaction.source_document = self
        #     transaction.save()

    # # Replicating the logic in the Donation model property
    # @factory.post_generation
    # def calculate_amount(self):
    #     credit_entries = self.transaction.first().entries.filter(direction__exact=-1)
    #     amount = sum(entry.amount for entry in credit_entries)
    #     return amount.amount




class ExpenseFactory(SourceDocumentFactory):
    supplier = factory.SubFactory(SupplierFactory)
    payment_type = factory.Faker('pyint', min_value=0, max_value=5)
    expense_type = factory.Faker('word')
    transaction = factory.RelatedFactory(
        'accounting.model_factories.TransactionFactory', factory_related_name='source_doc')

    class Meta:
        model = models.Expense


class ServiceFactory(BaseModelFactory):
    class Meta:
        model = models.Service

    name = factory.Faker('sentence', nb_words=3)
    description = factory.Faker('text')
    project = factory.SubFactory(ProjectFactory)
    indicators = factory.RelatedFactoryList(
        'accounting.model_factories.IndicatorFactory',
        factory_related_name='service',
        size=lambda: random.randint(2, 5),
        # project=self
    )


class IndicatorUnitFactory(BaseModelFactory):
    class Meta:
        model = models.IndicatorUnit

    name = factory.Faker('sentence', nb_words=3)


class IndicatorFactory(BaseModelFactory):
    uuid = factory.Faker('uuid4')
    name = factory.Faker('sentence', nb_words=4)
    target_quantity = factory.LazyAttribute(lambda o: random.randint(1, 1000))
    unit = factory.SubFactory(IndicatorUnitFactory)
    # baseline = factory.LazyAttribute(lambda o: round(o.target_quantity / 2))
    baseline = factory.Maybe(
        'is_cumulative',
        yes_declaration=factory.LazyAttribute(
            lambda o: round(o.target_quantity / 2)),
        no_declaration=None
    )
    service = factory.SubFactory(ServiceFactory)
    # activity = factory.RelatedFactory(
    #     factory_related_name=''
    # )
    activities = factory.RelatedFactoryList(
        'accounting.model_factories.ActivityFactory',
        factory_related_name='indicator',
        size=lambda: random.randint(2, 5),
        # project=self
    )

    description = factory.Faker('text')
    is_cumulative = factory.Faker('boolean')

    class Meta:
        model = models.Indicator

    # TODO: the model properties

    # service = factory.SubFactory(Service)

#     class Meta:
#         model = models.Indicator

#     name = factory.Faker('sentence')
#     description = factory.Faker('paragraph')
#     unit = factory.SubFactory('IndicatorUnitFactory')
#     target = factory.LazyAttribute(lambda: random.randint(0, 100))
#     actual = factory.LazyAttriute(lambda: random.randint(0, 100))
#     start_date = factory.Faker('date')
#     end_date = factory.LazyAttribute(lambda o: o.start_date + dt.timedelta(days=365))
#     status = fuzzy.FuzzyChoice(['completed', 'in progress'])


class LocationFactory(BaseModelFactory):
    class Meta:
        model = models.Location

    name = factory.Faker('sentence', nb_words=2)
    address = factory.SubFactory(AddressFactory)
    latitude = factory.Faker(
        'pydecimal', 
        left_digits=2, 
        right_digits=6, 
        min_value=-90,
        max_value=90)
    longitude = factory.Faker(
        'pydecimal',
        left_digits=3, right_digits=6,
        min_value=-180, max_value=180
    )


class ActivityFactory(BaseModelFactory):
    class Meta:
        model = models.Activity

    uuid = factory.Faker('uuid4')
    # TODO: delete one of these (unless there is a reason for having both)
    status = factory.Faker('random_element', elements=[
                           x[0] for x in models.Activity.STATUS])
    status = fuzzy.FuzzyChoice(['completed', 'in progress'])
    start_time = factory.Faker('time_object')
    end_time = factory.LazyAttribute(
        lambda o: add_to_time(o.start_time)
    )
    title = factory.Faker('sentence')
    notes = factory.Faker('paragraph')
    indicator = factory.SubFactory(IndicatorFactory)
    indicator_amount = factory.Faker('pyint')
    location = factory.SubFactory(LocationFactory)
    attachments = factory.RelatedFactory('accounting.model_factories.ActivityAttachmentFactory', factory_related_name='activity')


class RandomImageField(factory.django.ImageField):
    def generate(self, step, params):
        for n in ['width', 'height']:
            # Add width and height to params, if not already present,
            # before creating the image?
            if not n in params:
                continue
            v = params[n]
            if callable(v):
                v = v()
            params[n] = v
        return super(RandomImageField, self).generate(step, params)

# class PhotoFactory(factory.django.DjangoModelFactory):
#     class Meta:
#         model = Photo
#     file = RandomImageField(
#         width=faker().image_width,
#         height=faker().image_height)


class ActivityAttachmentFactory(BaseModelFactory):
    """
        TODO URGENT: this causes an infinite loop of Project/Activity/Indicator
        creation. Resolve
    """
    class Meta:
        model = models.ActivityAttachment
    
    uuid = factory.Faker('uuid4')
    ipfs_hash = factory.Faker('sha256')
    # activity = factory.RelatedFactory('accounting.model_factories.ActivityFactory')
    activity = factory.SubFactory(ActivityFactory)
    file =  factory.django.ImageField(
        width=ImageFaker('image_width'),
        height=ImageFaker('image_height'),
        color=ImageFaker('image_color')
    )
    is_public = factory.Faker('boolean')


# # TODO: Can generate a randomm image using one of these - from perplexity.ai
# def random_image():
#     original_image = Image.open("original.jpg")
#     noise = np.random.randint(-5, 5, image.size)
#     noisy_image_array = np.array(original_image) + noise
#     noisy_image = Image.fromarray(np.uint8(np.clip(noisy_image_array, 0, 255)))
#     # noisy_image.save("noisy.jpg")
#     return noisy_image





@factory.django.mute_signals(signals.post_save)
class TransactionFactory(BaseModelFactory):
    project = factory.SubFactory(ProjectFactory)
    timestamp = factory.Faker('date_time')
    source_doc = factory.SubFactory(SourceDocumentFactory)
    VAT_rate = factory.SubFactory(VATRatesFactory)

    class Meta:
        model = models.Transaction
        django_get_or_create = ('project',)

    @factory.post_generation
    def add_entries(self, create, extracted, **kwargs):
        
        # Credit a credit and debit entry for each transaction
        transaction_amount = kwargs.get(
            'amount', 
            None) or round(random.uniform(100, 1000), 2)
        TransactionDetailFactory(
            transaction=self, 
            amount=transaction_amount, 
            direction=1
        )
        TransactionDetailFactory(
            transaction=self, 
            amount=transaction_amount, 
            direction=-1
        )