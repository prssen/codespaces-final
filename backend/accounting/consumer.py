from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
# chat/consumers.py
from accounting.api import get_current_charity
import json
# from channels.generic.websocket import WebsocketConsumer


# https://github.com/addu390/django-kafka

# Adapted from https://medium.com/@adabur/introduction-to-django-channels-and-websockets-cb38cd015e29
class NotificationConsumer(AsyncWebsocketConsumer):

    @database_sync_to_async
    def get_charity_id(self, user):
        try:
            charity_profile = user.profile.charities.filter(selected=True).first()
            return charity_profile.charity.id
        except Exception as e:
            print('Connection error:', e)
            return None

    # Groups allow us to send messages to multiple tabs/devices
    # opened by a single user at the same time
    async def connect(self):
        print('Consuming channel name: ', self.channel_name)
        self.charity_id = await self.get_charity_id(self.scope['user'])
        if not self.charity_id:
            # If user accounst isn't associated with a registered charity,
            # reject the connection
            print('no charity id:', self.charity_id)
            await self.close()
            return
        else:
            print('found charity id: ', self.charity_id)
            await self.accept()
        self.user = self.scope['user']
        self.user_room_name = f"notifications_charity_{self.charity_id}"
        print('User: ', self.user)
        print('User room name:', self.user_room_name)
            # str(self.user.id)  # Notification room name
        await self.channel_layer.group_add(
            self.user_room_name,
            self.channel_name
        )

    async def disconnect(self, close_code):
        if hasattr(self, 'user_room_name') and hasattr(self, 'channel_name'):
            await self.channel_layer.group_discard(
                self.user_room_name,
                self.channel_name
            )

    async def send_notification(self, event):
        """
            Coroutine handling messages received from channel layer (i.e. from
            other processes within the application)
        """
        print('Event received: ', event)
        await self.send(
            text_data=json.dumps({'message': event['message']})
        )
        # await self.send_json({
        # #    "type": "send.notification",
        # "msg_type": settings.MSG_TYPE_MESSAGE,
        # "room": event["room_id"],
        # "username": event["username"],
        #     "message": event["message"],
        # })
