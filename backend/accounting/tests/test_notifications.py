# Test Triple Entry Accounting notifications
from django.test import TestCase
from channels.testing import WebsocketCommunicator
# TODO: fix ambiguity b/w 'consumers.py' and 'consumers/' folder
from accounting.consumer import NotificationConsumer

class MyTests(TestCase):
    async def test_notification_consumer(self):
        communicator = WebsocketCommunicator(NotificationConsumer.as_asgi(), "GET", "/notifications/")
        # Test successful connection
        connected, subprotocol = await communicator.connect()
        self.assertTrue(connected)

        # Test data received
        # TODO: send data to channel (not on Websockets) and check a WS message
        # is received here

        # response = await communicator.get_response()
        response = await communicator.receive_from()
        self.assertEqual(response["body"], b"test response")
        self.assertEqual(response["status"], 200)

        # TODO: move this to a tearDown() mmethod
        await communicator.disconnect()

    async def test_authentication(self):
        # Check that conneciton is refused if user doesn't have an associated charity

        # Check no response/connection rejected if user isn't authenticated
        pass