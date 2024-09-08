import datetime
import random
import json
import os
import secrets
from copy import deepcopy
from collections import defaultdict

from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect, QueryDict
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.db import transaction
from django.db import models
from django.db.models import Sum, Avg, Count, F, Q, Func, ProtectedError
from django.db.models.query import QuerySet
from django.utils.timezone import make_aware
from django.core.cache import cache
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpRequest
from django.test.client import RequestFactory

from rest_framework import permissions, viewsets, parsers
from rest_framework import generics
from rest_framework import mixins
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.filters import SearchFilter

from django_filters import rest_framework as filters
from dj_rest_auth.views import LoginView, LogoutView
from dj_rest_auth.registration.views import RegisterView

import hashlib
import stripe
from djmoney.money import Money
from ipfsApi.client import Client

# Import each model from accounting.models separately
from accounting import models as acc_models
from accounting import serializers as acc_serializers
from accounting.mixins import *
from accounting.exceptions import Custom400, NoTenantError
from accounting.utils import get_object_with_locks, Round, ChangeDir, update_from_dict

from accounting.models import (Profile, ProfileCharity, Charity,
                               ProjectAppeal, ProjectGallery, ProjectAppealUpdate, ProjectUpdatesMedia)
from accounting.parsers import BodySavingJSONParser
from accounting.blockchain_provider import brownie_blockchains

from dotenv import load_dotenv

load_dotenv()

DONATION_TRACKER_OBJECTS = [
    Profile,
    ProfileCharity,
    Charity,
    ProjectAppeal,
    ProjectGallery,
    ProjectAppealUpdate,
    ProjectUpdatesMedia
]


# TODO: delete this
# from rest_framework.response import StreamingHttpResponse

# Stripe API test private key
# stripe.api_key = 'sk_test_51OVH2cHiZwoknnwFONrXCMNwuWpWgSU9nesIGL1fRh8JaeK3Ur2pAhT3WFBQBynJBlYUQOpagKjRYeU7NrJTGHfg00p7arh7Fv'
# stripe.api_key = 'sk_test_51OVH2cHiZwoknnwFONrXCMNwuWpWgSU9nesIGL1fRh8JaeK3Ur2pAhT3WFBQBynJBlYUQOpagKjRYeU7NrJTGHfg00p7arh7Fv'
stripe.api_key = str(os.getenv('STRIPE_API_KEY'))


# This is your Stripe CLI webhook secret for testing your endpoint locally.
# endpoint_secret = 'whsec_8d5507a791075729859e47a1489cc9c4b52a79d84ec993c0845e4d5979a54018'
# endpoint_secret = 'whsec_8d5507a791075729859e47a1489cc9c4b52a79d84ec993c0845e4d5979a54018'
endpoint_secret=str(os.getenv('STRIPE_WEBHOOK_SECRET'))

# stripe.checkout.Session.create(
#     cancel_url="http://localhost:8001",
#     line_items=[{"price": 'price_1OVIoyHiZwoknnwFGWkymO7p', "quantity": 1}],
#     mode="payment",
#     success_url="http://localhost:8001",
# )

# TODO: optimise performance by 1) using auto-prefetch, 2) using @cached_property or @cached_method
# or @ttl_cache (see https://adamj.eu/tech/2021/01/21/simple-in-memory-caching-of-django-models-with-cachetools/)
# see other performance improvements in 'Speed Handbook' (bookmarked)

# TODO: adjust views to use a UUID field value as route parameters, not the pk value

# TODO: define two serialisers, for list and detail, for each object - see https://stackoverflow.com/a/67287539

# TODO: replace all function defs here/in serialiser with import from here?
def get_current_charity(self):
    try:
        return self.request.user.profile.charities.filter(selected=True).first()
    except:
        raise NoTenantError(
            f'Cannot access projects until you have joined a charity.')



# # @method_decorator(csrf_exempt, name='dispatch')

# TODO: re-enable this
# @method_decorator(cache_page(60*5), name='dispatch')
class BaseViewSet(viewsets.ModelViewSet):
    """Reimplements the mixins from Django Rest Framework, but with support for multitenancy"""
    permission_classes = [permissions.IsAuthenticated]

    # Get the charity the user belongs to and has currently selected
    def get_current_charity(self):
        try:
            return self.request.user.profile.charities.filter(selected=True).first()
        except:
            raise NoTenantError(
                f"Cannot {self.request.method} an object without belonging to a charity")

    # Check that the object belongs to the current tenant (i.e. the user's currently selected charity)
    def is_correct_tenant(self, obj):
        current_charity = self.get_current_charity()
        return obj.parent_charity == current_charity.charity.uuid
    

    # Gets users' currently selected tenant ID, returns model objects
    # belonging to that tenant
    def filter_by_tenant_id(self, queryset):
        return queryset.filter(parent_charity=self.get_current_charity().charity.uuid)

    def update(self, request, *args, **kwargs):
        # current_charity = self.get_current_charity()
        partial = kwargs.pop('partial', False)
        object_primary_key = kwargs['pk'] if 'pk' in kwargs else kwargs['uuid']

        # Check the tenant ID is correct before updating object
        instance = self.get_object()
        if not self.is_correct_tenant(instance):
           return Response(status=status.HTTP_403_FORBIDDEN)

        # Check if request has been made before (by checking hash digest of username + body)
        # - if so, return the user's request, as the resource has already been updated to this
        # value
        # Credit: https://stackoverflow.com/a/69087036
        key = hashlib.blake2b(
            # f"{request.user.username}, {request.body}, {kwargs['pk']}".encode(
            f"{request.user.username}, {request.body}, {object_primary_key}".encode(
                "utf-8")
        ).hexdigest()
        is_cached = cache.get(key)
        if is_cached:
            return Response(request.body)

        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        # Add response to cache
        timeout_value = 60 * 5
        cache.set(key, 'True', timeout_value)

        return Response(serializer.data)

        # # QueryDicts are immutable and will throw error
        # if isinstance(request.data, QueryDict):
        #     request.data._mutable = True

        # request.data.parent_charity = current_charity.charity.uuid
        # super().update(self, request, *args, *kwargs)

    # def partial_update(self, request, *args, **kwargs):
        # current_charity = self.get_current_charity()
        # if isinstance(request.data, QueryDict):
        #     request.data._mutable = True

        # request.data.parent_charity = current_charity.charity.uuid
        # super().partial_update(self, request, *args, *kwargs)

    # # TODO: re-enable this if doing this at the serialiser level doesn't work
    # def create(self, request, *args, **kwargs):
    #     current_charity = self.get_current_charity()
    #     if current_charity:
    #         # added_data = deepcopy(request)
    #         # added_data['data']['parent_charity'] = current_charity.charity.uuid
    #         # return super().create(added_data, *args, **kwargs)
    #         if isinstance(request.data, QueryDict):
    #             request.data._mutable = True
    #         request.data['parent_charity'] = current_charity.charity.uuid
    #         return super().create(request, *args, **kwargs)
    #     else:
    #         raise NoTenantError(
    #             f'Cannot create an object until you have joined a charity')

    # def perform_create(self, serializer):
    #     current_charity = self.get_current_charity()
    #     if current_charity:
    #         return serializer.save(parent_charity=current_charity.charity.uuid)
    #     else:
    #         raise NoTenantError(
    #             f'Cannot create an object until you have joined a charity')

    # # TODO: temporarily disabling to enable filtering at the serializer level
    # # - re-enable if that doesn't work
    # # Make sure we are only selecting resources from the charity the user belongs to
    # # and has currently selected
    # # (this handles multi-tenancy for list())

    def get_queryset(self):
        old_queryset = super().get_queryset()
        current_charity = self.get_current_charity()

        # If current charity is empty, return an empty queryset
        if not current_charity:
            return old_queryset.none()

        # Otherwise, select objects belonging to the current charity
        return self.filter_by_tenant_id(old_queryset)

        # filtered_queryset = old_queryset.filter(
        #     parent_charity=current_charity.charity.uuid)
        # return filtered_queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if self.is_correct_tenant(instance):
            serializer = self.get_serializer(instance)
            return Response(serializer.data)

        return Response(status=status.HTTP_403_FORBIDDEN)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if self.is_correct_tenant(instance):
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response(status=status.HTTP_403_FORBIDDEN)
    
    # def perform_destroy(self, instance):
    #     self.recursive_delete(instance)
    
    # def recursive_delete(self, object, delete_type):
    #     # Get a list of model types that are related to this instance
    #     if isinstance(object, QuerySet):
    #         relation_types = object[0]._meta.related_objects
    #     else:
    #         relation_types = object._meta_.related_objects

    #     # To maintain referential integrity, iterate through graph of objects 
    #     # related to the instance and delete them first before deleting the object 
    #     # Credit: Adapted from https://www.usebutton.com/post/cascading-soft-deletion-in-django
    #     # for relation in instance._meta._relation_tree:
    #     # for relation in instance._meta.related_objects:
    #     for relation in relation_types:
    #         # For each relation, get all the related objects and
    #         # recursively call perform_destroy on them

    #         on_delete = getattr(relation, 'on_delete', models.DO_NOTHING)
    #         # on_delete = getattr(relation.related, 'on_delete', models.DO_NOTHING)

    #         # if on_delete in [None, models.DO_NOTHING]:
    #         # if on_delete in [None, models.CASCADE, models.SET_NULL]:
    #         #    continue
    #         # # How to handle protected models: 
    #         # if on_delete == models.PROTECT:
    #         #     
            
    #         if isinstance(object, QuerySet):
    #             filter = {f'{relation.name}__in': object}
    #         else:
    #             filter = {relation.name: object}
    #         related_queryset = relation.model.objects.filter(**filter)
            
    #         if related_queryset.exists():
    #             self.recursive_delete(related_queryset, on_delete)

    #     # The base case - handle deletions for CASCADE, SET_NULL, and PROTECT
    #     # CORRECTION: handle deletions for PROTECT and DO_NOTHING only
    #     if delete_type == models.CASCADE:
    #         relation.model.objects.filter(**filter).delete()
    #     elif delete_type == models.SET_NULL:
    #         for r in related_queryset.all():
    #             related_queryset.update(**{relation.name: None})
    #     elif delete_type == models.PROTECT:
    #         if related_queryset.count() > 0:
    #             raise ProtectedError('Cannot delete a protected model.', related_queryset)
    #     else:
    #         raise(NotImplementedError())

    #     object.delete() # or object.objects.all().delete if is_queryset

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = acc_models.User.objects.all().order_by('-date_joined')
    serializer_class = acc_serializers.UserSerializer
    # `permission_classes = [permissions.IsAuthenticated]`

# TODO: this needs to be able to:
    # 1) Set the 'selected' attribute, perhaps in a separate routable @action
    # 2) Hide the 'selected' attribute when sshowing the 'edit/view profile' screen


# class ProfileViewSet(mixins.RetrieveModelMixin,
#                      mixins.UpdateModelMixin,
#                      mixins.DestroyModelMixin,
#                      viewsets.GenericViewSet):
#     """
#     API endpoint that allows profiles to be viewed or edited. Its choice of base classes
#     (credit: perplexity.ai) means it does not include a list() or create() method (as profiles should be 
#     created automatically by Django signals, and searching for other users is not an
#     application requirement)
#     """

#     # TODO: add a route to change the current charity
#     queryset = acc_models.Profile.objects.all()
#     serializer_class = acc_serializers.ProfileSerializer

class ProfileView(APIView):
    def get_object(self):
        return Profile.objects.get(user=self.request.user)
    
    def get(self, request):
        profile = self.get_object()
        serializer = acc_serializers.ProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile = self.get_object()
        serializer = acc_serializers.ProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)

    def patch(self, request):
        profile = self.get_object()
        serializer = acc_serializers.ProfileSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)

    def delete(self, request):
        profile = self.get_object()
        profile.delete()
        return Response({}, status=status.HTTP_202_ACCEPTED)

class AccountingLoginView(LoginView):
    serializer_class = acc_serializers.AccountingLoginSerializer
       
    def selected_charity(self):
        try:
            return self.user.profile.charities.filter(selected=True).first().charity.uuid
        except (AttributeError, ObjectDoesNotExist):
            return None

    def has_charity(self):
        try:
            return self.user.profile.charities.exists()
        except (AttributeError, ObjectDoesNotExist):
            return False

    def post(self, request, *args, **kwargs):
        # Credit: adapted from GitHub Copilot response
        # TODO: delete - no longer necessary (we get selected charity from 
        # profile_charities endpoint)
        # CORRECTION: still need it (front-end checks for selected_charity to redirect)
        response = super().post(request, *args, **kwargs)

        if response.status_code == status.HTTP_200_OK:
            response.data.update({
                'selected_charity': str(self.selected_charity()),
                'has_charity': json.dumps(self.has_charity())
            })
        
        return response

class TrackerLoginView(LoginView):
    serializer_class = acc_serializers.TrackerLoginSerializer

    def post(self, request, *args, **kwargs):
        # Logout any other users from device before logging in
        logout = LogoutView.as_view()(request._request)
        login_response = super().post(request, *args, **kwargs)
        return login_response

class AccountingRegisterView(RegisterView):
    serializer_class = acc_serializers.AccountingRegisterSerializer

    def post(self, request, *args, **kwargs):
        register_response = super().post(request, *args, **kwargs)

        request._request.POST._mutable=True
        request._request.POST['username'] = request.data['username']
        request._request.POST['password'] = request.data['password1']
        login_response = AccountingLoginView.as_view()(request._request)

        return login_response


class TrackerRegisterView(RegisterView):
    serializer_class = acc_serializers.TrackerRegisterSerializer

    def post(self, request, *args, **kwargs):
        register_response = super().post(request, *args, **kwargs)

        # login_request = request.clone()
        # login_request.data = login_request.data.copy()
        # login_request.data['password'] = login_request.data.pop('password1')

        # Login when user account is created
        # login_response = TrackerLoginView().post(request, *args, **kwargs)
        # login_view = TrackerLoginView()
        # login_view.request = request
        # login_response = login_view.post(request)

        # login_response = TrackerLoginView.as_view()(request._request)
        # request.data['password'] = request.data.pop('password1')
        # login_response = TrackerLoginView.as_view()(request)

        # factory = RequestFactory()
        # login_request = factory.post('/api/v1/tracker_login', data={
        #     'username': request.data['username'],
        #     'password': request.data['password1']
        # })
        # login_response = TrackerLoginView.as_view()(login_request)
        # OR, 
        request._request.POST._mutable=True
        request._request.POST['username'] = request.data['username']
        request._request.POST['password'] = request.data['password1']
        login_response = TrackerLoginView.as_view()(request._request)
        request.user = request._request.user
        # or, login_response = TrackerLoginView().dispatch(request._request)
        # final_response = {**register_response, **login_response}
        return login_response
        
        

# TODO: seems to be unnwcessary (dj_rest_auth just calls Django's logout(), without
# using a serializer). Delete
# class AccountingLogoutView(LogoutView):
#     serializer_class = acc_serializers.AccountingLogoutSerializer

# class CountryViewSet(viewsets.ModelViewSet):
class CountryViewSet(BaseViewSet):
    """
    API endpoint that allows addresses to be viewed or edited.
    """
    queryset = acc_models.Country.objects.all()
    serializer_class = acc_serializers.CountrySerializer
    permission_classes = [IsAuthenticated]


# class AddressViewSet(viewsets.ModelViewSet):
class AddressViewSet(BaseViewSet):
    """
    API endpoint that allows addresses to be viewed or edited.
    """
    queryset = acc_models.Address.objects.all()
    serializer_class = acc_serializers.AddressSerializer
    permission_classes = [IsAuthenticated]


# class CharityViewSet(viewsets.ModelViewSet):
class CharityViewSet(MultiSerializerViewSetMixin, BaseViewSet):
    """
    API endpoint that allows charities to be viewed or edited.
    """
    queryset = acc_models.Charity.objects.all()
    serializer_class = acc_serializers.CharitySerializer
    serializer_action_classes = {
        'list': acc_serializers.CharityListSerializer,
        'retrieve': acc_serializers.CharitySerializer
    }

    # Unlike the other models, Charity objects don't use the 'parent_charity' field
    # as a tenant ID - we override BaseViewSet's methods to use the 'uuid' field as the tenant ID
    # instead
    def is_correct_tenant(self, obj):
        current_charity = self.get_current_charity()
        if current_charity:
            return obj.uuid == current_charity.charity.uuid
        return False
    
    # Get UUIDs of all charities user belongs to
    def get_all_charities(self):
        return [i.charity.uuid for i in self.request.user.profile.charities.all()]

    def filter_by_tenant_id(self, queryset):
        # return queryset.filter(uuid=self.get_current_charity().charity.uuid)
        return queryset.filter(uuid__in=self.get_all_charities())

    def create(self, request, *args, **kwargs):
        """Create blockchain account and store its address in Charity model object"""
        if isinstance(request.data, QueryDict):
            request.data._mutable = True
            request.data['blockchain_id'] = brownie_blockchains.create_account()
        else:
            request.data.update({'blockchain_id': brownie_blockchains.create_account()})
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        response = super().perform_create(serializer)
        created_charity = serializer.instance

        # If it doesn't already exist, we need to explicitly create a 
        # ProfileCharity object linking the new Charity to the user Profile 
        # that created it
        try:
            profile_charity_exists = self.request.user.profile.charities.filter(charity=created_charity).exists()
        except (AttributeError, ObjectDoesNotExist):
            profile_charity_exists = False

        if not profile_charity_exists:
            pc = acc_models.ProfileCharity(
                profile=self.request.user.profile,
                charity=created_charity,
                selected=True
            )
            pc.save()

        # Deploy a Charity smart contract to the blockchain
        brownie_blockchains.create_charity(created_charity)

        return response

class ProfileCharityViewSet(viewsets.ModelViewSet):
    queryset = acc_models.ProfileCharity.objects.all()
    serializer_class = acc_serializers.ProfileCharitySerializer
    lookup_field='uuid'

    def get_queryset(self):
        current_user = self.request.user
        return self.queryset.filter(profile__user=current_user)

    def get_object(self):
        return get_object_or_404(
            acc_models.ProfileCharity, charity__uuid=self.kwargs.get('uuid')
        )
        # try:
        #     acc_models.ProfileCharity.objects.get(charity__uuid=self.kwargs['uuid'])
        # except acc_models.ProfileCharity.DoesNotExist:
        #     raise 

class ProjectAppealUpdateViewSet(viewsets.ModelViewSet):
    """
    API endpoint for project updates.
    """
    queryset = acc_models.ProjectAppealUpdate.objects.all()
    serializer_class = acc_serializers.ProjectAppealUpdatesSerializer


class ActivityAttachmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for attachments to project activity records.
    """
    queryset = acc_models.ActivityAttachment.objects.all()
    serializer_class = acc_serializers.ActivityAttachmentSerializer


# class ActivityViewSet(MultiSerializerViewSetMixin, viewsets.ModelViewSet):
class ActivityViewSet(MultiSerializerViewSetMixin, BaseViewSet):
    """
    API endpoint for project activities.
    """
    queryset = acc_models.Activity.objects.all()
    serializer_class = acc_serializers.ActivitySerializer
    serializer_action_classes = {
        'create': acc_serializers.CreateActivitySerializer,
    }
    parser_classes = [parsers.MultiPartParser]

    def create(self, request, *args, **kwargs):
        """Use different serializers for reads and writes"""
        write_serializer = acc_serializers.CreateActivitySerializer(
            data=request.data, context={'request': request})
        read_serializer = acc_serializers.ActivitySerializer(data=request.data)

        write_serializer.is_valid(raise_exception=True)
        self.perform_create(write_serializer)
        read_serializer.is_valid(raise_exception=True)
        headers = self.get_success_headers(read_serializer.data)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        response = super().perform_create(serializer)
        activity = serializer.instance
        # ipfs = Client('127.0.0.1', 5001)
        ipfs = brownie_blockchains.ipfs_client
        # attachment_hashes = {}
        attachments = activity.attachments.all()
        for attachment in attachments:
            # Changing the current working directory to prevent IPFS client from
            # saving each directory in file path separately
            with ChangeDir(os.path.dirname(attachment.file.path)) as cwd:
                file_path = os.path.basename(attachment.file.path)
                # TODO: move loop into context manager, bulk add all file paths with 1 add()
                res = ipfs.add(file_path)
                # attachment_hashes[attachment.id] = res['Hash']
            # # Upload each attachment to IPFS
            # res = ipfs.add(attachment.file.path)

            # Store Content ID (IPFS hash address) in ActivityAttachment
            # database model
            attachment.ipfs_hash = res['Hash']
        acc_models.ActivityAttachment.objects.bulk_update(attachments, ['ipfs_hash'])
        # Upload the activity data to the blockchain
        charity = self.get_current_charity().charity
        blockchain_response = brownie_blockchains.create_activity(charity, activity)
        print(blockchain_response)

        return response
    


class IndicatorViewSet(viewsets.ModelViewSet):
    """
    API endpoint for indicators of a project.
    """
    queryset = acc_models.Indicator.objects.all()
    serializer_class = acc_serializers.IndicatorSerializer
    lookup_field = 'uuid'

    def perform_create(self, serializer):
        response = super().perform_create(serializer)
        indicator = serializer.instance

        blockchain_response = brownie_blockchains.create_indicator(indicator)
        print(blockchain_response)

        return response

    # def create(self, request, *args, **kwargs):
    #     response = super().create(request, *args, **kwargs)
    #     brownie_blockchains.create_indicator()


class ServiceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for indicators of a project.
    """
    queryset = acc_models.Service.objects.all()
    serializer_class = acc_serializers.ServiceSerializer
    lookup_field = 'uuid'


@method_decorator(cache_page(60*15), name='dispatch')
class ProjectViewSet(MultiSerializerViewSetMixin, BaseViewSet):
    """
    API endpoint for indicators of a project.
    """
    queryset = acc_models.Project.objects.all()
    serializer_class = acc_serializers.ProjectSerializer
    serializer_action_classes = {
        'list': acc_serializers.ProjectListSerializer,
        'retrieve': acc_serializers.ProjectSerializer
    }
    lookup_field = 'uuid' 

    def perform_create(self, serializer):
        super().perform_create(serializer)
        project = serializer.instance

        blockchain_response = brownie_blockchains.create_project(project)
        print(blockchain_response)

        # return response


# class ProjectUpdateMediaViewSet(viewsets.ModelViewSet):
#     """
#     API endpoint for project updates.
#     """
#     queryset = ProjectUpdatesMedia.objects.all()
#     serializer_class = ProjectUpdatesMediaSerializer


# TODO: finish ProjectSummaryViewSet. 'get' method requires:
    # - Proportion of expenses spent + total activites by indicator for impact
    # TODO FIXME: add expenseType to models, once you've researched a standard expense
    #       classification scheme
    # - Transactions filtered by query params for summary
@method_decorator(csrf_exempt, name='dispatch')
class ProjectSummaryView(APIView):
    """
        Endpoint for displaying a summary of project impact and transactions
        in the dashboard tab of the Project page.
    """

    def get(self, request, *args, **kwargs):
        uuid = kwargs.pop('uuid')
        project = acc_models.Project.objects.get(uuid=uuid)
        serializer = acc_serializers.ProjectSummarySerializer(project)
        return Response(serializer.data)
        # if (serializer.is_valid()):
        #     return Response(serializer.data)
        # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# TODO: finish ProjectImpactViewSet. For 'get' method:
    # - all services, indicators
    # - calculate total activities by indicator
    # - perform comparison logic (for cumulative, sum / target; for non-cumulative,
    #       most recent value
    # minus oldest value, all divided by target)


class ProjectImpactViewSet(viewsets.ModelViewSet):
    """
    API endpoint for data for project impact sub-page.
    """
    pass

# TODO: finish ProjectTransactionViewSet: transactions by project, in date range filtered (default all)


class ProjectTransactionView(APIView):
    """
    API endpoint for data for the project transaction sub-page.

    TODO:
        - Add lookup_field for UUID
        - ProjectTransactionSerializer?
    """

    def get(self, request, *args, **kwargs):
        try:
            uuid = kwargs.pop('uuid')
        except:
            Response({'message': 'Please provide a project ID'},
                     status=status.HTTP_400_BAD_REQUEST)
        project = acc_models.Project.objects.get(uuid=uuid)
        serializer = acc_serializers.ProjectTransactionSerializer(project)
        return Response(serializer.data)

        # def get(self, request, *args, **kwargs):
        #     uuid = kwargs.pop('uuid')
        #     project = acc_models.Project.objects.get(uuid=uuid)
        #     transactions = project.transaction_set.all()
        #     serializer = acc_serializers.TransactionSerializer(transactions, many=True)
        #     return Response(serializer.data)

# TODO: finish ProjectBudgetViewSet, IF you implement budgets


class ProjectBudgetViewSet(viewsets.ModelViewSet):
    """
    API endpoint for data for the project transaction sub-page.
    """
    pass


class CharityHomePageView(APIView):
    """
    Endpoint that redirects to the first project created by the charity.
    TODO: temporary - replace with an actual home page summarising all project/outcomes
    so far
    """
    serializer_class = acc_serializers.ProjectSerializer

    def get_current_charity(self):
        try:
            return self.request.user.profile.charities.filter(selected=True).first()
        except:
            raise NoTenantError(
                f'Cannot access projects until you have joined a charity.')


    def get(self, request, *args, **kwargs):
        # Get user's current charity
        profile_charity = self.get_current_charity()

        # Find first project belonging to that charity
        projects = acc_models.Project.objects.filter(parent_charity=profile_charity.charity.uuid)
        if projects.exists():
            project = projects[0]
        else:
            project = None
        # project = acc_models.Project.objects.none()
        print('current project', project)
        serializer = acc_serializers.ProjectSummarySerializer(project)
        # serializer = acc_serializers.ProjectSummarySerializer()
        return Response(serializer.data)
        # if serializer.is_valid():
        #     return Response(serializer.data)
        # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectAppealFilterSet(filters.FilterSet):
    """
        Filter enabling 'greater than' and 'less than' lookups in URL search params.
    """
    target_donations = filters.NumberFilter(field_name='project__target_donations', lookup_expr='exact')
    target_donations__gt = filters.NumberFilter(field_name='project__target_donations', lookup_expr='gt')
    target_donations__lt = filters.NumberFilter(field_name='project__target_donations', lookup_expr='lt')
    # project_uuid = filters.UUIDFilter(field_name='project__uuid', lookup_expr='exact')

    class Meta:
        model = acc_models.ProjectAppeal
        fields = {
            # Credit: from GitHub copilot
                **{field.name: ['lt', 'gt', 'exact'] for field in acc_models.ProjectAppeal._meta.fields},
            #    'project__target_donations': ['lt', 'gt', 'exact']
            }

class ProjectAppealViewSet(MultiSerializerViewSetMixin, viewsets.ModelViewSet):
    """
    API endpoint for projects, including updates and photo gallery, to be
    retrieved and edited for the charity's appeal page on the donation tracker.
    """
    queryset = acc_models.ProjectAppeal.objects.all()
    serializer_class = acc_serializers.ProjectAppealSerializer
    # filter_backends = (filters.DjangoFilterBackend, SearchFilter)
    # filterset_class = ProjectAppealFilterSet
    filter_backends = (SearchFilter,)
    # TODO: add filtering by charity_name when charity_uuid is repalced by FKs to charities
    search_fields = ['title', 'subtitle']
    serializer_action_classes = {
        'list': acc_serializers.ProjectAppealListSerializer,
        'retrieve': acc_serializers.ProjectAppealSerializer
    }
    lookup_field = 'uuid'

    # def get_object(self):
    #     # print('Query params:', self.request.query_params)
    #     print('Kwargs:', self.kwargs)
    #     # if 'uuid' in self.request.query_params:
    #     if 'uuid' in self.kwargs:
    #         # print('uuid value passed in: ', )
    #         try:
    #             return acc_models.ProjectAppeal.objects.get(
    #                 # uuid=self.request.query_params.get('uuid')
    #                 uuid=self.kwargs.get('uuid')
    #             )
    #         except ProjectAppeal.DoesNotExist:
    #             return acc_models.ProjectAppeal.objects.none()
    #     return super().get_object()

    # def handle_query_params(self, query_params):
    #     """Remove any lists from query param dict values"""
    #     query_params_copy = query_params.copy()
    #     query_params_copy._mutable = True
    #     for param in query_params:
    #         print('Query param value:', query_params[param])
    #         if isinstance(query_params[param], list):
    #             query_params_copy['in__' + param] = query_params_copy.pop(param)
    #             print('updated query params copy:', query_params_copy)
    #             # query_params[param] = query_params[param][0]
    #         else:
    #             query_params_copy[param] = query_params[param]
    #     return query_params_copy


    # def get_queryset(self):
    #     """v2: Delegating query params to django_filter backend"""
    #     max_param = self.request.query_params.get('max', None)
    #     if max_param is not None:
    #         return acc_models.ProjectAppeal.objects.filter(is_live=True)[:int(max_param)]

    """Below is get_queryset v1"""
    def get_queryset(self):
        # Get the first N results, where N = value of the 'max_param' query parameter
        query_params = self.request.query_params.copy()
        # max_param = self.request.query_params.get('max', None)
        # search_params = self.request.query_params.pop('search', None)
        # print('queryset called: max is', max_param)
        # print('query params are: ', self.request.query_params)

        print('The current request is: ', self.request)
        max_param = query_params.get('max', None)
        search_params = query_params.pop('search', None)
        print('queryset called: max is', max_param)
        print('query params are: ', query_params)

        # Cast query parameter to integer if it is present
        if max_param is not None:
            max_param = int(max_param)
        # param_dict = self.handle_query_params(self.request.query_params)
        # print('modified param dict: ', param_dict)
        
        # return acc_models.ProjectAppeal.objects.filter(is_live=True, **self.request.query_params.dict())[:max_param]
        return acc_models.ProjectAppeal.objects.filter(is_live=True, **query_params.dict())[:max_param]



# TODO: delete this
# @method_decorator(csrf_exempt, name='dispatch')
class ProjectAppealListView(ListAPIView):
    """
    Endpoint for retrieving a list of active project appeals, containing summary
    information on each appeal for the home/search page of the donation tracker.
    """
    serializer_class = acc_serializers.ProjectAppealListSerializer
    filter_backends = (filters.DjangoFilterBackend, SearchFilter)
    # search_fields = ['title','project__parent_charity','subtitle']
    search_fields = ['title']

    def get_queryset(self):
        # Get the first N results, where N = value of the 'max_param' query parameter
        if (max_param := self.request.query_params.get('max', None)):
            return acc_models.ProjectAppeal.objects.filter(is_live=True)[:max_param]


# @method_decorator(csrf_exempt, name='dispatch')
class FundViewSet(MultiSerializerViewSetMixin, viewsets.ModelViewSet):
    """
    API endpoint that allows addresses to be viewed or edited.
    """
    queryset = acc_models.Fund.objects.all()

    serializer_class = acc_serializers.FundSerializer
    serializer_action_classes = {
        'list': acc_serializers.FundSerializer,
        'retrieve': acc_serializers.ChartOfAccountsSerializer
    }

# TODO: testing - remove


# @method_decorator(csrf_exempt, name='dispatch')
class AccountTypeViewSet(viewsets.ModelViewSet):
    queryset = acc_models.AccountType.objects.all()
    serializer_class = acc_serializers.AccountTypeSerializer


# @method_decorator(csrf_exempt, name='dispatch')
class AccountViewSet(MultiSerializerViewSetMixin, viewsets.ModelViewSet):
    """
    API endpoint that allows ACTIVE accounts to be viewed or edited.
    """
    queryset = acc_models.Account.objects.filter(is_active=True)
    serializer_class = acc_serializers.AccountSerializer

    def destroy(self, request, *args, **kwargs):
        instance = get_object_with_locks(self)
        # If no transactions are associated with this account, 'soft delete' it
        # (i.e. mark account as inactive)
        if instance.transactiondetail_set.count() == 0:
            instance.is_active = False
            # try:
            with transaction.atomic():
                instance.save()
                return Response(status=status.HTTP_204_NO_CONTENT)
            # # If transaction fails and is rolled back, revert to previous
            # # state if logic follows the transaction
            # except DatabaseError:
            #     instance.is_active = True

        else:
            # Otherwise raise error
            return Response(
                {'message': 'deletion not allowed - transactions associated with account'},
                status=status.HTTP_400_BAD_REQUEST
            )

# TODO: implement this


class ChartOfAccountViewSet(viewsets.ModelViewSet):
    # Get funds with accounts nested within them - perhaps a new serialiser?
    pass


# @method_decorator(csrf_exempt, name='dispatch')
class BankAccountViewSet(MultiSerializerViewSetMixin, viewsets.ModelViewSet):
    """
    API endpoint that allows addresses to be viewed or edited.
    """
    queryset = acc_models.BankAccount.objects.all()
    serializer_class = acc_serializers.BankAccountSerializer


# @method_decorator(csrf_exempt, name='dispatch')
class TransactionViewSet(MultiSerializerViewSetMixin, viewsets.ModelViewSet):
    """
    API endpoint that allows addresses to be viewed or edited.
    """
    queryset = acc_models.Transaction.objects.all()
    serializer_class = acc_serializers.TransactionSerializer

    # # Queryset: get project for given charity, nest updates + media within updates, and gallery
    # def get_queryset(self):
    #     user = self.request.user
    #     # Get current project for user

class DonationHistoryViewSet(MultiSerializerViewSetMixin, viewsets.ModelViewSet):
    """
        Donation tracker endpoint for users to see a list
        of their previous donations
    """
    queryset = acc_models.Donation.objects.all()
    serializer_class = acc_serializers.DonationHistorySerializer
    serializer_action_classes = {
        'list': acc_serializers.DonationHistoryListSerializer,
        'retrieve': acc_serializers.DonationHistorySerializer
    }
    lookup_field = 'uuid'

    def get_queryset(self):
        old_queryset = super().get_queryset()
        try:
            user_profile = self.request.user.profile
            # queryset = acc_models.Donation.objects.filter(
            queryset = old_queryset.filter(donor__profile=user_profile)
        except AttributeError:
            queryset = old_queryset.none()
        return queryset
    

# @method_decorator(csrf_exempt, name='dispatch')
class DonationViewSet(MultiSerializerViewSetMixin, BaseViewSet):
    """
    API endpoint that allows addresses to be viewed or edited.
    """
    queryset = acc_models.Donation.objects.all()

    serializer_class = acc_serializers.DonationSerializer
    serializer_action_classes = {
        'list': acc_serializers.DonationListSerializer,
        'retrieve': acc_serializers.DonationSerializer
    }
    lookup_field = 'uuid'

    def perform_create(self, serializer):
        response = serializer.save(received_by=self.request.user)

        # Save data to blockchain
        donation = serializer.instance
        blockchain_response = brownie_blockchains.create_donation(donation)
        print(blockchain_response)
        
        return response



# TODO: this

# @method_decorator(csrf_exempt, name='dispatch')
class DonorAnalyticsView(APIView):
    """
    API endpoint for data for visualisations in the Donor page dashboard.
    """
    # permission_classes = [permissions.IsAuthenticated
    #   ]
    # Get the charity the user belongs to and has currently selected

    def get_current_charity(self):
        try:
            return self.request.user.profile.charities.filter(selected=True).first()
        except:
            raise NoTenantError(
                f'Cannot see donor statistics until you have joined a charity.')

    def get_donors(self):
        return acc_models.Donor.objects.filter(parent_charity=self.get_current_charity().charity.uuid)

    # def get_number_of_donors_in_year(self, year):
    #     donors = acc_models.Donor.objects.filter(
    #         donations__transaction__timestamp__year=year)
    #     return donors.filter(parent_charity=self.get_current_charity().charity.uuid).distinct().count()

    def get(self, request, *args, **kwargs):
        """
            Calculate and return aggregate statistics on donors.

            Returns: 
                total donations, donations this month, number of donors this year,
                number of donors last year, average donation, change in average donation,
                donors by location, donations by month this year.
        """
        # donations = acc_models.Donation.objects.filter(
        #     parent_charity=self.get_current_charity().charity.uuid)

        response_data = {}

        # total_donations = donations.aggregate(
        #     amount=Sum('amount', default=0))['amount']

        # start_of_month = datetime.date.today().replace(day=1)
        # now = datetime.datetime.now()
        # donations_this_month = donations.filter(
        #     transaction__timestamp__range=(start_of_month, now))

        this_year, previous_year = datetime.date.today().year, datetime.date.today().year - 1
        # number_of_donors_this_year = self.get_number_of_donors_in_year(
        #     this_year)
        # number_of_donors_this_year = self.get_donors()\
        #                                  .filter(donations__transaction__timestamp__year=this_year)\
        #                                  .distinct().count()
        
        # Number of donors per year in last 5 years
        # Group by year, and count
        donor_number_by_year = self.get_donors()\
                                    .annotate(year=F('donations__transaction__timestamp__year'))\
                                    .filter(year__gt=datetime.date.today().year - 5)\
                                    .values('year').distinct()\
                                    .annotate(total=Count('uuid'))

                                    # .filter(donations__transaction__timestamp__year__gt=2019)\
        # change_from_last_year = number_of_donors_this_year - self.get_number_of_donors_in_year(
        #     previous_year)



        # average_donation = round(donations.aggregate(
        # amount=Avg('amount'))['amount'], 4)
        # average_donation_by_month = donations.filter(transaction__timestamp__year=datetime.datetime.now().year)\
        #                                      .values(month=F('transaction__timestamp__month'))\
        #                                      .distinct()\
        #                                      .annotate(total=Round(Avg('amount'), 2, output_field=models.DecimalField()))

        # print('Average donation by month this year: ', average_donation_by_month)
        # change_in_average = round(average_donation - donations.filter(
        #     transaction__timestamp__year=previous_year).aggregate(amount=Avg('amount', default=0))['amount'], 4)

        # donors_by_location = acc_models.Donor.objects\
        #     .filter(parent_charity=self.get_current_charity().charity.uuid)\
        #     .values(city=F('address__city__name'))\
        #     .distinct()\
        #     .annotate(count=Count('id'))

        # Total number of donors from each country
        donors_by_location = acc_models.Donor.objects\
            .filter(parent_charity=self.get_current_charity().charity.uuid)\
            .values(city=F('address__country'))\
            .distinct()\
            .annotate(count=Count('id'))

        # Calculate recurring donation ratio - donations from repeat donors (donors
        # who have made >1 donation) divided by donations from all donors

        year_filter = Q(transaction__timestamp__year=this_year)
        charity_filter = Q(
            parent_charity=self.get_current_charity().charity.uuid)
        donations_this_year = acc_models.Donation.objects\
            .filter(year_filter & charity_filter)

        repeat_donors = acc_models.Donor.objects.filter(charity_filter)\
                                .annotate(donation_count=Count('donations'))\
                                .filter(donation_count__gt=1)
        repeat_donor_donations = acc_models.Donation.objects.filter(donor__in=repeat_donors)
        repeat_donor_donations_by_month = repeat_donor_donations.filter(year_filter)\
                                                                .values(month=F('transaction__timestamp__month'))\
                                                                .distinct()\
                                                                .annotate(total=Count('uuid'))\
                                                                .order_by('month')
        
        all_donations_number_by_month = donations_this_year\
            .values(month=F('transaction__timestamp__month'))\
            .distinct()\
            .annotate(total=Count('uuid'))\
            .order_by('month')
        
        # Insert missing months into both querysets
        repeat_donations, all_donations = list(repeat_donor_donations_by_month), list(all_donations_number_by_month)
        for i in range(0, 12):
            if len(repeat_donations) <= i or repeat_donations[i]['month'] != i + 1:
                repeat_donations.insert(i, { 'month': i + 1, 'total': 0 })
            if len(all_donations) <= i or all_donations[i]['month'] != i + 1:
                all_donations.insert(i, { 'month': i + 1, 'total': 0 })

        # Calculate ratio - repeat donations / total donations in each month
        recurring_donation_ratio = [
            r['total'] / a['total'] if a['total'] != 0 else 0 
            for r, a in zip(repeat_donations, all_donations)
        ]
        # Convert to a dict that can be serialised
        ratio_dict = [{ 'month': index, 'total': amount} for index, amount in enumerate(recurring_donation_ratio)]
        
        # donations_by_month_this_year = donations_this_year\
        #     .values(month=F('transaction__timestamp__month'))\
        #     .distinct()\
        #     .annotate(total=Sum('amount', default=0))

        # donors_by_month_this_year = self.get_donors().filter(year_filter)\
        #                                              .values(month=F('transaction__timestamp__month'))\
        #                                              .distinct()\
        #                                              .annotate(total=Count('uuid'))
        
        # Average number of donations per month a donor makes


            # .aggregate(total=Sum('amount'))['total']
        # print('Donations by location: ', list(donors_by_location))

        response_data = {
            # 'total_donations': total_donations,
            # 'change_this_month': donations_this_month.count(),
            # 'number_of_donors_this_year': number_of_donors_this_year,
            # 'change_from_last_year': change_from_last_year,
            'donor_numbers_by_year': list(donor_number_by_year),
            'donors_by_country': list(donors_by_location),
            # 'average_donation': average_donation,
            # 'average_donation_by_month_this_year': list(average_donation_by_month),
            # 'change_in_average': change_in_average,
            'recurring_donation_ratio': ratio_dict
            # 'donors_by_location': list(donors_by_location),
            # 'donations_by_month_this_year': list(donations_by_month_this_year)
        }
        serializer = acc_serializers.DonorAnalyticsSerializer(
            data=response_data)
        if serializer.is_valid():
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DonationAnalyticsView(APIView):
    def get_current_charity(self):
        try:
            return self.request.user.profile.charities.filter(selected=True).first()
        except:
            raise NoTenantError(
                f'Cannot see donation statistics until you have joined a charity.')
        
    def get(self, request, *args, **kwargs):
        """
            Calculate and return aggregate statistics on donations.

            Returns:
        """
        
        this_year = datetime.date.today().year
        
        # Q expression to filter donations by current year and current charity
        year_filter = Q(transaction__timestamp__year=this_year)
        charity_filter = Q(parent_charity=self.get_current_charity().charity.uuid)
        
        donations = acc_models.Donation.objects.filter(charity_filter)
        donations_this_year = donations.filter(year_filter)

        response_data = {}

        start_of_month = datetime.date.today().replace(day=1)
        now = datetime.datetime.now()
        donations_this_month = donations.filter(
            transaction__timestamp__range=(start_of_month, now))

        # Calculate average size of a single donation, over the entire year
        # and over each month of the year
        average_donation = round(donations_this_year.aggregate(
            amount=Avg('amount'))['amount'], 2)
        average_donation_by_month = donations_this_year\
                                             .values(month=F('transaction__timestamp__month'))\
                                             .distinct()\
                                             .annotate(total=Round(Avg('amount'), 2, output_field=models.DecimalField()))

        # Group donations by month and calculate total donations each month
        donations_by_month_this_year = donations_this_year\
            .values(month=F('transaction__timestamp__month'))\
            .distinct()\
            .annotate(total=Sum('amount', default=0))
        
        response_data = {
            'average_donation': average_donation,
            'average_donation_by_month_this_year': list(average_donation_by_month),
            'donations_by_month_this_year': list(donations_by_month_this_year)
        }

        serializer = acc_serializers.DonationAnalyticsSerializer(
            data=response_data)
        
        if serializer.is_valid():
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# @method_decorator(csrf_exempt, name='dispatch')
class DonorViewSet(MultiSerializerViewSetMixin, viewsets.ModelViewSet):
    """
    API endpoint that allows addresses to be viewed or edited.

    TODO: 
        - Implement filters to filter by giving_status as query strings
    """
    queryset = acc_models.Donor.objects.all()
    serializer_class = acc_serializers.DonorSerializer
    serializer_action_classes = {
        'list': acc_serializers.DonorListSerializer,
        'retrieve': acc_serializers.DonorSerializer
    }


# @method_decorator(csrf_exempt, name='dispatch')
# class SupplierViewSet(MultiSerializerViewSetMixin, viewsets.ModelViewSet):
class SupplierViewSet(MultiSerializerViewSetMixin, BaseViewSet):
    """
    API endpoint that allows suppliers to be viewed or edited.
    """
    queryset = acc_models.Supplier.objects.all()
    serializer_class = acc_serializers.SupplierSerializer
    serializer_action_classes = {
        'list': acc_serializers.SupplierListSerializer,
        'retrieve': acc_serializers.SupplierSerializer
    }


    def create(self, request, *args, **kwargs):
        # TODO: replace this with code that links the Supplier to a given BlockchainUser instance
        if isinstance(request.data, QueryDict):
            request.data._mutable = True
            request.data['blockchain_id'] = brownie_blockchains.create_account()
        else:
            request.data.update({'blockchain_id': brownie_blockchains.create_account()})
        
        return super().create(request, *args, **kwargs)

# @method_decorator(csrf_exempt, name='dispatch')
class InvoiceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for invoices of a charity.
    """
    queryset = acc_models.Invoice.objects.all()
    serializer_class = acc_serializers.InvoiceSerializer


# @method_decorator(csrf_exempt, name='dispatch')
class BillViewSet(viewsets.ModelViewSet):
    """
    API endpoint for bills of a charity.
    """
    queryset = acc_models.Bill.objects.all()
    serializer_class = acc_serializers.BillSerializer


# TODO: this
# @method_decorator(csrf_exempt, name='dispatch')
class ExpenseAnalyticsView(APIView):
    """
    API endpoint for data for visualisations in the Expense page dashboard.
    """

    def get_current_charity(self):
        try:
            return self.request.user.profile.charities.filter(selected=True).first()
        except:
            raise NoTenantError(
                f'Cannot see expense statistics until you have joined a charity.')

    # Placing the initial part of each query below in a function
    # to reduce code duplication
    def expense_amounts(self):
        return acc_models.Expense.objects\
                                 .filter(parent_charity=self.get_current_charity().charity.uuid)\
                                 .filter(transaction__entries__direction=1)\
                                 
    def donation_amounts_by_month(self):
        return acc_models.Donation.objects\
                                 .filter(parent_charity=self.get_current_charity().charity.uuid)\
                                 .filter(transaction__entries__direction=1)\
                                 .filter(transaction__timestamp__year=datetime.datetime.now().year)\
                                 .distinct()\
                                 .values(month=F('transaction__timestamp__month')).distinct()\
                                 .annotate(donations=Round(Sum('transaction__entries__amount', default=0), 4, output_field=models.DecimalField()))

    def get(self, request, *args, **kwargs):
        total_expenses = self.expense_amounts().aggregate(
            amount=Sum('transaction__entries__amount', default=0))['amount']
        print('total expenses: ', total_expenses)
        expenses_this_month = self.expense_amounts()\
            .filter(transaction__timestamp__month=datetime.datetime.now().month)\
            .filter(transaction__entries__direction=1)\
            .aggregate(amount=Sum('transaction__entries__amount', default=0))['amount']
        print('expenses this month: ', expenses_this_month)

        # Total expenses incurred this month: list of dicts of the form:
        # [{ 'month': <integer - '2' for February etc>, 'total': <Decimal>}]
        expenses_by_month = self.expense_amounts()\
            .filter(transaction__timestamp__year=datetime.datetime.now().year)\
            .filter(transaction__entries__direction=1)\
            .values(month=F('transaction__timestamp__month'))\
            .distinct()\
            .annotate(expenses=Round(Sum('transaction__entries__amount', default=0), 4, output_field=models.DecimalField()))
        # TODO: if the above gives unexpected behaviour, change Sum('amount') to Sum('transaction__entries__amount')
        print('Expenses by month: ', list(expenses_by_month))

        # Merge donations and expenses by month into single dict
        # Credit: https://stackoverflow.com/a/5501893 
        d = defaultdict(dict)
        for pair in (expenses_by_month, self.donation_amounts_by_month()):
            for elem in pair:
                d[elem['month']].update(elem) 

        # For each month, divide by donations for that month to get 
        # expense / donation ratio 
        ratio_by_month = []
        for month in range(1, 13):
            month_data = d.get(month, None)
            if month_data:
                if month_donation := month_data.get('donations', None):
                    ratio = round(month_data.get('expenses', 0) / month_donation, 6)
            else:
                ratio = None
            ratio_by_month.append({ 'month': month, 'ratio': ratio })
        print('Ratio by month: ', ratio_by_month)

        # Total expenses by supplier
        # TODO: replace with .values(vendor=..., month=...).distinct(by vendor AND month) to get by vendor and month
        # THEN, order by, and anything other than top 3 is put into another category
        expenses_by_vendor = self.expense_amounts().values(vendor=F('supplier__name'))\
            .distinct()\
            .annotate(
                total=Round(Sum('transaction__entries__amount',
                            default=0), 4, output_field=models.DecimalField()),
                supplier_id=F('supplier__id'))\
            .order_by('-total')
        print('Expenses by vendor: ', list(expenses_by_vendor))

        response_data = {
            'total_expenses': round(total_expenses, 4),
            'expenses_this_month': round(expenses_this_month, 4),
            'expenses_by_month': list(expenses_by_month),
            'expenses_by_supplier': list(expenses_by_vendor),
            'expenses_over_donations':  ratio_by_month
        }

        serializer = acc_serializers.ExpenseAnalyticsSerializer(
            data=response_data)
        if serializer.is_valid():
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class ExpenseViewSet(MultiSerializerViewSetMixin, viewsets.ModelViewSet):
class ExpenseViewSet(MultiSerializerViewSetMixin, BaseViewSet):
    """
    API endpoint that allows expenses to be viewed or edited.
    """
    queryset = acc_models.Expense.objects.all()
    serializer_class = acc_serializers.ExpenseSerializer

    # def create(self, request, *args, **kwargs):
    #     # Add blockchain id here, before data is validated and saved
    #     # TODO: 
    #     request.data['blockchain_id'] = 
    #     return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        # We add code to save to blockchain here, before response is returned but
        # after serialised data is validated 
        response = super().perform_create(serializer)
        expense = serializer.instance
        charity = acc_models.Charity.objects.get(uuid=serializer.instance.parent_charity)
        blockchain_response = brownie_blockchains.create_expense(charity, expense)
        print(blockchain_response)

        return response

    # TODO: override perform_create, before calling serializer.save(), call
    # method to store 'expense_type', 'source_doc.date', total of
    # 'transaction.entries[0 to n].amount' where direction = 1,
    # in createExpense() smart contract

    # Contract should emit event, containing new expense; and listener
    # should call 'get all expenses to update the data (in react)
    # # myContract.events.MyEvent([filter options])
    #   .on("connected", function(subscriptionId){ console.log(subscriptionId);})
    #   .on('data', function(event){ console.log(event);})


class HttpResponseTemporaryRedirect(HttpResponseRedirect):
    """Server-side redirection to the Stripe checkout page in donation tracker."""
    status_code = 303


@api_view(['POST'])
def stripe_checkout(request):
    """
        Endpoint to redirect users to the Stripe checkout to complete 
        their donation payment. Code adapted from 
        https://docs.stripe.com/checkout/quickstart.
    """
    # print('Data from front end: ', request.data['profile_id'])   print('Data from front end: ', request.data)
    print('Current user: ', request.user)
    # print(request.user.profile)
    try:
        checkout_session = stripe.checkout.Session.create(
            # client_reference_id=request.user.profile.uuid,
            payment_intent_data={
                # Submit metadata about the donation to the Stripe API. This will be 
                # returned to the back-end when payment is completed, enabling us to 
                # create a Donation and Donor record

                # TODO: replace profile and charity IDs with the values below
                # when client-side auth is working
                'description': json.dumps({
                    # 'profile_id': request.data['profile_id'],
                    # 'charity_id': request.data['charity_id'],
                    'profile_id': str(request.user.profile.uuid),
                    # 'charity_id': str(request.user.profile.charities.filter(selected=True).first().charity.uuid),
                    'charity_id': request.data['charity_id'],
                    'appeal_id': request.data['appeal_id']
                })
            },
            client_reference_id='testing123',
            line_items=[
                {
                    # ID for the type of payment to be made (donation in this case)
                    'price': 'price_1OVIoyHiZwoknnwFGWkymO7p',
                    'quantity': 1,
                },
            ],
            mode='payment',

            # Endpoints to redirect users to on completion of payment
            # success_url='http://localhost:8000/api/v1/stripe/success/',
            # cancel_url='http://localhost:8000/api/v1/stripe/cancel/'
            
            
            success_url='http://localhost:3000/tracker/donations/list?status=success',
            cancel_url=f'http://localhost:3000/tracker/appeal/{request.data["appeal_id"]}?status=cancelled'
            # cancel_url='http://localhost:8001/'
            # success_url='http://localhost:8000/api/v1/stripe/success.html',
            # cancel_url='http://localhost:8000/api/v1/stripe/cancel.html',
        )
    except Exception as e:
        return Response(e, status=status.HTTP_400_BAD_REQUEST)

    return Response({'redirect_url': checkout_session.url}, status=status.HTTP_303_SEE_OTHER)


class NotificationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for notifications to be viewed or edited.
    """
    # queryset = acc_models.Notification.objects.filter()
    serializer_class = acc_serializers.NotificationSerializer
    lookup_field = 'uuid'

    def get_queryset(self):
        # Get all notifications to the current user's charity
        receiver = getattr(get_current_charity(self), 'charity', None)
        # return acc_models.Notification.objects.filter(receiver=get_current_charity(self).charity)
        return acc_models.Notification.objects.filter(receiver=receiver)
        # return acc_models.Notification.objects.all()


# @csrf_exempt
# @api_view(['POST'])
# @parser_classes([BodySavingJSONParser])
# def stripe_webhook_view(request):
#     from pprint import pprint
#     event = None
#     payload = request.body
#     print(payload)
#     sig_header = request.headers['STRIPE_SIGNATURE']
#     print('Signature: ', sig_header)

#     try:
#         event = stripe.Webhook.construct_event(
#             payload, sig_header, endpoint_secret
#         )
#     except ValueError as exc:
#         # Invalid payload
#         raise exc
#     except stripe.error.SignatureVerificationError as exc:
#         # Invalid signature
#         raise exc

#     # if payload['data']['object']['type'] == 'checkout.session.completed': # ???
#     if event['type'] == 'checkout.session.completed':
#         # # TODO: re-enable if you get SignatureVerification working
#         # # Retrieve the session. If you require line items in the response, you may include them by expanding line_items.
#         # session = stripe.checkout.Session.retrieve(
#         #     event['data']['object']['id'],
#         #     expand=['line_items'],
#         #     # TODO: check if you need to expand metadata here?
#         # )
#         # line_items = session.line_items

#         # Fulfill the purchase...
#         create_donation(payload)
#         return HttpResponse(status=200)

#     return HttpResponse(status=200)


# def create_donation(payload):
#     # Address (city, country [2-lette code], line1, 2, postal_code, state),
#     # email, name, phone
#     customer_details = payload['data']['object']['customer_details']
#     customer_email = payload['data']['object']['customer_email']

#     # profile id and charity id
#     metadata = payload['data']['object']['metadata']

#     # Total amount of donation
#     amount_total = payload['data']['object']['amount_total']
#     currency = payload['data']['object']['currency']
#     description = payload['data']['object']['description']
#     payment_method = payload['data']['object']['payment_method']

#     pass


@api_view(['GET'])
def stripe_success(request):
    return HttpResponse('<html><body>Success!</body></html>')


@api_view(['GET'])
def stripe_cancel(request):
    return HttpResponse('<html><body>Donation cancelled.</body></html>')


# TODO: if necessary, see here for implementing a base model which can serialise different
# subclasses separately: https://stackoverflow.com/questions/24048595/django-rest-framework-multitable-model-inheritance-modelserializers-and-nested

# From https://stackoverflow.com/a/74220297, for list-only (no detail) viewsets


class MyListOnlyModelViewset(viewsets.GenericViewSet, mixins.ListModelMixin):
    '''your attributes'''


# TODO: endpont for charity appeal needs:
    # - calculation of total donated to Project vs donation target: use Django 'sum'
    # -

# TODO: use websockets-django-restframework to make a serialised WebSocket endpoint

# class NotificationView(APIView):
#     permission_classes = (IsAuthenticated,)

#     def stream_messages(self, request):
#         channel_layer = get_channel_layer()

#         # Method for sending messages to the client
#         def push_message(message):
#             yield f"data: {message}\n\n"

#         # Establish connection with the channel group
#         async_to_sync(channel_layer.group_add)(
#             f'user_notification_{request.user.id}', str(channel_layer))

#         # Continuously listen for new messages and send them to the client
#         while True:
#             async_to_sync(channel_layer.send)('mygroup', {
#                 'type': 'send_notification',
#                 'message': 'New message'
#             })
#             yield from push_message('New message')

#     def get(self, request):
#         channel_layer = get_channel_layer()
#         async_to_sync(channel_layer.group_send)(
#             "general", {"type": "send_notification",
#                         "text": {"status": "done"}}
#         )

#         return StreamingHttpResponse(
#                   self.stream_messages(request),
#                   content_type='text/event-stream')


@csrf_exempt
@api_view(['POST'])
@parser_classes([BodySavingJSONParser])
def stripe_webhook_view(request):
    """
        Endpoint to receive and handle events from Stripe servers.
        Code adapted from https://docs.stripe.com/payments/checkout/fulfill-orders
    """
    # Need to call request.data to trigger the BodySavingJSONParser above, which in turn
    # is needed to save the raw body of the request to request.raw_body for verification
    # against the webhook event signature. If we just call request.body instead, we get
    # 'RawPostDataException' errors, as described here: https://stackoverflow.com/q/47662496)    
    request.data
    event = None
    # payload = request.body
    payload = request.raw_body
    # print(payload)
    sig_header = request.headers['STRIPE_SIGNATURE']
    print('Signature: ', sig_header)

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as exc:
        # Invalid payload
        raise exc
    except stripe.error.SignatureVerificationError as exc:
        # Invalid signature
        raise exc

    # If event['type'] is 'charge.succeeded' (Which it seems to be now),
    # then find the checkout.Session with the matching event['data']['object']['payment_intent']
    # (stripe.checkout.Session.list(payment_intent=event['data']['object']['payment_intent'])[0] ?)
    # if event['type'] == 'charge.succeeded':
    #     session = stripe.checkout.Session.list(
    #         payment_intent=event['data']['object']['payment_intent'],
    #         expand=['data.line_items', 'data.payment_intent'],
    #     )['data'][0]
    # elif event['type'] == 'payment_intent.succeeded':
    #     session = stripe.checkout.Session.list(
    #         payment_intent=event['data']['object']['id'],
    #         expand=['data.line_items', 'data.payment_intent'],
    #     )['dsata'][0]
    if event['type'] == 'checkout.session.completed':
        # Retrieve the session. If you require line items in the response, you may
        # include them by expanding line_items.
        session = stripe.checkout.Session.retrieve(
            event['data']['object']['id'],
            expand=['line_items', 'payment_intent'],
        )

        # This method creates Donor and Donation model instances from
        # the data returned by the Stripe API in 'session' and the logged-in
        # user data from 'request'
        create_donation(session, request)
        return HttpResponse(status=200)

    return HttpResponse(status=200)


def create_donation(payload, request):
    metadata = json.loads(payload.payment_intent.description)
    profile = Profile.objects.get(uuid=metadata['profile_id'])
    # If the donor doesn't have a Donor record, create one
    if (not hasattr(profile, 'donor_account')):
        first_name = profile.first_name
        last_name = profile.last_name

        if (first_name is None and last_name is None):
            try:
                first_name = payload.customer_details.name.split(' ')[0]
                last_name = " ".join(
                    payload.customer_details.name.split(' ')[1:])
            except:
                first_name = None
                last_name = None

        phone_number = payload.customer_details.phone
        email = payload.customer_details.email
        # country, _ = acc_models.Country.objects.get_or_create(
        #     parent_charity=metadata['charity_id'],
        #     iso_code=payload.customer_details.address.country,
        #     defaults={'name': 'UK'}
        # )
        address = acc_models.Address.objects.create(
            parent_charity=metadata['charity_id'],
            address1=payload.customer_details.address.line1 or '',
            address2=payload.customer_details.address.line2,
            postal_code=payload.customer_details.address.postal_code,
            city=payload.customer_details.address.city,
            region=payload.customer_details.address.state,
            # TODO: change to this after model change -> country=payload.customer_details.address.country
            # country=country
            country=payload.customer_details.address.country
        )
        donor = acc_models.Donor.objects.create(
            parent_charity=metadata['charity_id'],
            profile=profile,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone_number,
            email=email,
            address=address,
            giving_stage='S',
        )
        print('Donor created:', donor)
    else:
        donor = profile.donor_account

    # Create Donation
    donation = acc_models.Donation.objects.create(
        parent_charity=metadata['charity_id'],
        donor=donor,
        # reference=payload.id[:64],
        reference=payload.id[:16],
        # TODO: divide by 100
        amount=Money(payload.amount_total / 100, payload.currency),
        payment_method=1,
    )

    # Create linked Transaction
    transaction = acc_models.Transaction.objects.create(
        # TODO: re-enable when BaseModels are inherited
        parent_charity=metadata['charity_id'],
        project=acc_models.Project.objects.get(
            appeals__uuid=metadata['appeal_id']),
        timestamp=make_aware(datetime.datetime.fromtimestamp(payload.created)),
        source_doc=donation
    )

    # Create the two double entries
    asset, _ = acc_models.AccountType.objects.get_or_create(
        name='AST', 
        defaults={
            'code': 100,
            'parent_charity': metadata['appeal_id']
        })
    income, _ = acc_models.AccountType.objects.get_or_create(
        name='INC', 
        defaults={
            'code': 300,
            'parent_charity': metadata['appeal_id']
        })
    asset = acc_models.AccountType.objects.get(name='AST')
    income = acc_models.AccountType.objects.get(name='INC')
    
    credit_entry = acc_models.TransactionDetail.objects.create(
        # TODO: re-enable
        parent_charity=metadata['charity_id'],
        transaction=transaction,
        account=acc_models.Account.objects.get_or_create(
            account_name='Donation Income', 
            defaults={
                'ultimate_parent': income,
                # TODO: re-enable when Account inherits from Basemodel
                'parent_charity': metadata['charity_id'],
                'normal': -1,
                # 'code': random.randint(300, 399),
                'code': secrets.choice(range(300, 399)),
            })[0],
        amount=Money(payload.amount_total / 100, payload.currency),
        narration='Stripe donation',
        direction=-1
    )
    debit_entry = acc_models.TransactionDetail.objects.create(
        # TODO: re-enable (DONE)
        parent_charity=metadata['charity_id'],
        transaction=transaction,
        account=acc_models.Account.objects.get_or_create(
            account_name='Cash', defaults={
                'ultimate_parent': income,
                'parent_charity': metadata['charity_id'],
                'normal': 1,
                # 'code': random.randint(300, 399),
                'code': secrets.choice(range(300, 399)),
            })[0],
        amount=Money(payload.amount_total / 100, payload.currency),
        narration='Stripe donation',
        direction=1
    )
    print('Transaction completed!')

    # TODO: convert to Charity smart contract function
    charity=acc_models.Charity.objects.get(uuid=metadata['charity_id'])
    blockchain_response = brownie_blockchains.create_donation(charity, donation)
    print(blockchain_response)
    

    # transaction = transaction,
    # account = acc_models.Account.objects.get(uuid=payload.metadata.account_id),
    # amount = donation.amount,
    # direction = 1

    #     reference=payload.id,
    #     amount = Money(payload.amount_total, payload.currency),
    #     transaction_type='Donation',
    #     status='Completed',
    #     timestamp=payload.created,
    # )

    # # Address (city, country [2-lette code], line1, 2, postal_code, state),
    # # email, name, phone
    # customer_details = payload.customer_details
    # customer_details = payload['data']['object']['customer_details']
    # customer_email = payload['data']['object']['customer_email']

    # # profile id and charity id
    # metadata = payload['data']['object']['metadata']

    # # Total amount of donation
    # amount_total = payload['data']['object']['amount_total']
    # currency = payload['data']['object']['currency']
    # description = payload['data']['object']['description']
    # payment_method = payload['data']['object']['payment_method']

    pass