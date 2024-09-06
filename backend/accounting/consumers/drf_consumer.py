from djangochannelsrestframework.decorators import action
from djangochannelsrestframework.generics import GenericAsyncAPIConsumer
from djangochannelsrestframework.mixins import (
    ListModelMixin,
    RetrieveModelMixin,
    PatchModelMixin,
    UpdateModelMixin,
    CreateModelMixin,
    DeleteModelMixin,
)
from djangochannelsrestframework import permissions
from djangochannelsrestframework.observer import model_observer
from accounting.models import Notification
from django.contrib.auth import get_user_model
from accounting.serializers import NotificationSerializer
from djangochannelsrestframework.decorators import action
from rest_framework import status


# class NotificationConsumer(
#     GenericAsyncAPIConsumer,
#     ListModelMixin,
#     RetrieveModelMixin,
#     PatchModelMixin,
#     UpdateModelMixin,
#     CreateModelMixin,
#     DeleteModelMixin,
# ):
#     queryset = Notification.objects.all()
#     serializer_class = NotificationSerializer

class DRFNotificationConsumer(GenericAsyncAPIConsumer, ListModelMixin):
  # This class MUST subclass `AsyncAPIConsumer` to use `@model_observer`
    # def __init__(self, *args, **kwargs):
    #     print('Is this called?')
    #     return super().__init__(*args, **kwargs)

    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    # permission_classes = (permissions.AllowAny) # Replace with isAuthenticated

    # # Ensure that a user only receives notifications addressed to them, by filtering
    # # out any notifications where the 'receiver' is another user before returning the
    # # response to the client

    # def filter_queryset(self, queryset, **kwargs):
    #     queryset = super().filter_queryset(queryset=queryset, **kwargs)

    #     # Filter by receiver
    #     current_user = self.scope['user']
    #     return queryset.filter(receiver=current_user)

    # To allow users to subscribe to notifications

    # async def connect(self, **kwargs):
    #     await self.notification_handler.subscribe()
    #     print('Model observer subscribed to')
    #     await super().connect()

    @model_observer(Notification, serializer_class=NotificationSerializer)
    async def notification_handler(self, message, action, subscribing_request_ids=[], **kwargs):
        print('does this ever run?')
        for request_id in subscribing_request_ids:
            await self.reply(data=message, action=action, request_id=request_id)

    @action()
    async def subscribe_to_notification_handler(self, request_id, **kwargs):
        print(f'{request_id} has subscribed!!')
        await self.notification_handler.subscribe(request_id=request_id)

    @action()
    async def testing(self, request_id, **kwargs):
        print('Testing echo')
        await self.reply(data='hello_world', action=kwargs['action'], request_id=request_id)

    # @model_observer(Notification)
    # async def notification_handler(
    #     self,
    #     message,
    #     observer=None,
    #     action=None,
    #     subscribing_request_ids=[],
    #     **kwargs
    # ):
    #     # due to not being able to make DB QUERIES when selecting a group
    #     # maybe do an extra check here to be sure the user has permission
    #     # send activity to your frontend
    #     print('Testing if handler is called')
    #     for request_id in subscribing_request_ids:
    #         # we can send a separate message for each subscribing request
    #         # this lets ws clients rout these messages.

    #         # This sends a JSON message to all connected users whenever there is a change
    #         # to the Notification model
    #         await self.send_json(dict(body=message, action=action, request_id=request_id))
    #     # note if we do not pass `request_id` to the `subscribe` method
    #     # then `subscribing_request_ids` will be and empty list.

    # # To send the entire object in JSON, we must first serialise it
    # @notification_handler.serializer
    # def model_serialize(self, instance, action, **kwargs):
    #     return dict(data=NotificationSerializer(instance=instance).data, action=action)

    # @notification_handler.groups_for_signal
    # def notification_handler(self, instance=Notification, **kwargs):
    #     # this block of code is called very often *DO NOT make DB QUERIES HERE*
    #     yield f'-receiver__{instance.receiver.id}'
    # #   yield f'-pk__{instance.pk}'

    # #   def classroom_change_handler(self, user=None, classroom=None, **kwargs):
    # @notification_handler.groups_for_consumer
    # def notification_handler(self, receiver=None, **kwargs):
    #     # This is called when you subscribe/unsubscribe
    #     if receiver is not None:
    #         yield f'-receiver__{user.pk}'
    # #   if classroom is not None:
    # #       yield f'-pk__{classroom.pk}'

    # @action()
    # async def subscribe_to_notifications(self, user_id, request_id, **kwargs):
    #     # check user has permission to do this

    #     # Check user is authenticated
    #     is_authenticated = User.objects.get_object_or_404(
    #         pk=user_id).is_authenticated

    #     if is_authenticated:
    #         await self.classroom_change_handler.subscribe(user=user_id, request_id=request_id)
    #         # if not self.scope['user'].is_authenticated:
    #         #     raise PermissionDenied("User is not authenticated")

    #     # TODO: find out which errors you can raise in this endpoint

#   @action()
#   async def subscribe_to_classroom(self, classroom_pk, request_id, **kwargs):
#       # check user has permission to do this
#       await self.classroom_change_handler.subscribe(classroom=classroom, request_id=request_id)


# Need to send:
# {
#     "action": "subscribe_to_notifications",
#     "request_id": 42, # this is returned to keep track of pending requests
#     "token": "your_token_here"
# }
