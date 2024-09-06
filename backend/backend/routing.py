# From https://medium.com/@adabur/introduction-to-django-channels-and-websockets-cb38cd015e29

# mysite/routing.py

# from channels.routing import ProtocolTypeRouter, URLRouter
# from django.urls import path
# from chat.consumers import ChatConsumer
# application = ProtocolTypeRouter({
#     'websocket': URLRouter([
#         path('ws/notifications/', NotificationConsumer.as_asgi()),
#     ])
# })
