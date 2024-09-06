from django.core.exceptions import PermissionDenied
from django.db.models import Q, Min
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver

import hashlib
import imagehash
from PIL import Image

from accounting.models import Transaction, ActivityAttachment, AccountType, User, Profile, Notification, ProfileCharity
from accounting.serializers import NotificationSerializer
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from functools import reduce
import operator
from collections import Counter

# from rest_auth.views import LoginView
# class CustomLoginView(LoginView):
#     # def get_response(self):
#     #     orginal_response = super().get_response()
#     #     mydata = {"message": "some message", "status": "success"}
#     #     orginal_response.data.update(mydata)
#     #     return orginal_response

#     def post(self, request, *args, **kwargs):
#         serializer = LoginUserSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         user = serializer.validated_data['user']
#         login(request, user)
#         return super().post(request, format=None)

# Create and update a User profile when User is registered
# Code from https://simpleisbetterthancomplex.com/tutorial/2016/07/22/how-to-extend-django-user-model.html
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    print('signal still being called')

    user_type = getattr(instance, 'user_type', None)
    
    if created:
        # Set user type to '0' (donation tracker user) or '1' (accounting user)
        # depending on instance.user_type value passed from the RegisterSerializer

        # This is currently not called, as save() is called twice - once in RegisterSerializer
        # (where no user_type is supplied) annd againn inn custom_signup (where the object
        # is already created, so created=False)
        if getattr(instance, 'user_type', None) in [0, 1]: 
            Profile.objects.create(user=instance, user_type=instance.user_type)
        # elif ... 'tracker',, else: [the below]

        # If no valid user type passed in, create a Profile without this field set
        Profile.objects.create(user=instance)
    else:
        if user_type in [0,1]:
            Profile.objects.filter(user=instance).update(user_type=user_type)
            instance.profile


# # TODO: delete - this is unnecessary (duplicates logic in 1st post_save handler)
# @receiver(post_save, sender=User)
# def save_user_profile(sender, instance, **kwargs):
#     try:
#         if getattr(instance, 'user_type', None):
#             instance.profile(user_type=instance.user_type)
#         instance.profile.save()
#     except:
#         return None

# Ensure that each Transaction has at least two 'legs' (TransactionDetail children entries)
# Adapted from https://www.kidstrythisathome.com/2016/05/limiting-objects-in-django.html


# @receiver(pre_save, sender=Transaction)
# def check_children(sender, instance, **kwargs):
#     if instance.entries.count() < 2:
#         raise InvalidDoubleEntry

# If this is the first ProfileCharity the user has created (i.e. the first charity
# user account is associated with), automatically set it to be the selected charity


def hash_file(file_path, algorithm='sha256'):
    """Compute the hash of a file. Credit: perplexity.ai"""
    hash_object = hashlib.new(algorithm)
    with open(file_path, 'rb') as file:
        for chunk in iter(lambda: file.read(4096), b''):
            hash_object.update(chunk)
    return hash_object.hexdigest()

    # OR JUST (again, from perplexity.ai)
    image = Image.open(file_path)
    return str(imagehash.average_hash(image)) # or dhash; or phash (perceptual hash - imagehash.phash(image)

# @receiver(pre_save, sender=ActivityAttachment)
# def compute_image_hash(sender, instance, created, **kwargs):
#     """
#         Add hash of file after saving attachment, so we can retrieve
#         it by its hash.
#     """
#     if instance.file:
#         instance.hash = hash_file(instance.file.path)

@receiver(post_save, sender=ProfileCharity)
def select_first(sender, instance, created, **kwargs):
    # TODO: check if risk of recursion - https://stackoverflow.com/questions/39481625/how-can-i-prevent-post-save-recursion-in-django
    if created:
        if instance.profile.charities.count() == 1:
            instance.selected = True
            instance.save()

# If there is only one ProfileCharity remaining after deletion, set it to be the
# selected charity


@receiver(post_delete, sender=ProfileCharity)
def select_last_remaining(sender, instance, **kwargs):
    if instance.profile.charities.count() == 1:
        remaining_charity = instance.profile.charities.first()
        remaining_charity.selected = True
        remaining_charity.save()


# If selected is set to True, set selected to False for all other ProfileCharity
# objects attached to the same profile (user can only select one charity
# at a time)
@receiver(post_save, sender=ProfileCharity)
def select_one(sender, instance, **kwargs):
    if instance.selected:
        # Get other ProfileCharty instancesa belonging to the profile
        other_charities = instance.profile.charities.exclude(id=instance.id)
        other_charities.update(selected=False)


@receiver(post_save, sender=Notification)
def forward_notification(sender, instance, created, **kwargs):
    """Propagate created Notification to WebSocket listeners"""
    print('Notification created - signal passing it to Django channel')
    if created:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            # f'notifications_user_{str(sender.user.id)}',
            f'notifications_charity_{str(instance.receiver.id)}',
            {
                "type": "send.notification",
                # "message": instance.__dict__
                "message": NotificationSerializer(instance).data
            }
        )


# TODO FIXME: this is unnecessary overhead - make the model read-only using one of these ideas
# https://stackoverflow.com/questions/12158463/how-can-i-make-a-django-model-read-only
# and create the 5 required fields directly on MySQL

# TODO: check this works

# TODO: replace with this:
 # account_types = {'AST': '100', 'LIA': '200', 'INC': '300', 'EXP': '400', 'EQU': '500'}
        # absent_types = account_types - dict(AccountType.values('name', 'code'))
        # if absent_types:
            # absent_instances = [AccountType.objects(name=k, code=v) for k,v in absent_types.items()]
            # AccountType,objects.bulk_create(absent_instances)
@receiver(post_save, sender=AccountType)
def all_account_types_present(sender, instance, **kwargs):
    """Check all account types are present, and recreate any missing account types, or remove any 
    duplicated account types."""
    # account_types = [('AST', '100'), ('LIA', '200'),
    #                  ('INC', '300'), ('EXP', '400'), ('EQU', '500')]
    # types_present = AccountType.objects.filter(
    #     name__in=[i[0] for i in account_types])

    # def construct_query(acc, curr):
    #     # & the item to the acc. object
    #     return acc & Q(name=curr[0]) | Q(code=curr[1])
    # qs = itertools.accumulate(account_types, construct_query)
    # types_present = AccountType.objects.filter(qs[-1])

    # Skip when we are deleting and resaving the deleted model (see below)
    if getattr(instance, 'resaving', None):
        print('Resaving')
        return
    print('Continuing')
    account_types = [
        {'name': 'AST', 'code': '100'},
        {'name': 'LIA', 'code': '200'},
        {'name': 'INC', 'code': '300'},
        {'name': 'EXP', 'code': '400'},
        {'name': 'EQU', 'code': '500'}
    ]
    minus_type_created = [i for i in account_types if i != {'name': str(instance.name), 'code': str(instance.code)}]
    
    # # Delete duplicate model objects (Credit: AI response)
    # unique_types = AccountType.objects.values('name', 'code').annotate(min_id=Min('id')).values('min_id')
    # AccountType.objects.exclude(pk__in=unique_types).delete()

    # # Delete model objects not in the account_types list
    # type_values = AccountType.objects.values('name', 'code', 'id')
    # in_list = [{'name': i['name'], 'code': i['code'], 'id': i['id']} for i in type_values]
    # # AccountType.objects.exclude(id__in=[i['id'] for i in in_list if i not in account_types]).delete()

    # # Create the missing account types
    # for data in minus_type_created:
    #     AccountType.objects.update_or_create(**data, parent_charity=instance.parent_charity)
    # # AccountType.objects.update_or_create(**data for data in minus_type_created)

    # # Check if there are any excess account types
    # account_types = AccountType.objects.all().values_list('name', 'code')
    # excess_types = Counter(account_types) - Counter(list(minus_type_created.items()))
    # if excess_types:
    #     # Get the excess AcountType models and delete them
    #     for acct_type in excess_types:
    #         AccountType.objects.filter(name=acct_type[0], code=acct_type[1]).delete()
    #     # pass

    # Check all account types are present
    qs = [Q(name=curr['name']) | Q(code=curr['code']) for curr in minus_type_created]
    types_present = AccountType.objects.filter(reduce(operator.or_, qs))

    # If not, create them
    if types_present.count() != 4 or len(AccountType.objects.all()) != 5:
        AccountType.objects.all().delete()
        instance.resaving = True
        instance.save()
        AccountType.objects.bulk_create([AccountType(parent_charity=instance.parent_charity, **data) for data in minus_type_created])
        # for name, code in account_types:
        #     if not types_present.filter(name=name).exists():
        #         # TODO: set the other attributes as well
        #         AccountType.objects.create(name=name, code=code, parent_charity=instance.parent_charity)
    # TODO: debug - this causes AccountType.get_or_create() to fail, as:
    # 1) the asset/expense account is created; it is then deleted by this code
    # 2) the Account is created with the non-existent asset/expennse instance (use )
    # TODO: 
    #   1) reinstate, but delete duplicates by NAME field, not CODE (there are two 'LIA' types with 
    # different codes - that is what is causing the problem), and then 
    #   2) in any AccountType.objects.get_or_create()
    #, create the subsequent account by AccountType.objects.get(name='AST') NOT by simply re-using the asset object created

    # if types_present.count() > 5:
    #     rows = AccountType.objects.all().order_by('code')
    #     for row in rows:
    #         # Delete duplicates - from https://stackoverflow.com/a/78277090
    #         # [r.delete() for r in AccountType.objects.filter(code=row.code)[1:]]
    #         [r.delete() for r in AccountType.objects.filter(name=row.name)[1:]]

        # absent_types = set(account_types) - set(types_present.values_list('name', flat=True))
        # for name in absent_types:
        #     AccountType.objects.create(name=name)

        # absent_types = set(zip(*account_types)[0]) - set(types_present.values_list('name', flat=True))
        # AccountType.objects.bulk_create(absent_types)