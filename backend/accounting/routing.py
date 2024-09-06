from django.urls import re_path, path
# from django.conf.urls import url

# from accounting.consumers.drf_consumer import NotificationConsumer
from accounting.consumer import NotificationConsumer
from channels.routing import ProtocolTypeRouter, URLRouter

# NOTE USE OF ws/ to separate out our ws URIs, like rest use of api/
websocket_urlpatterns = [
    #    re_path(r'ws/(?P<user_id>\w+)/$', NotificationConsumer.as_asgi()),
    path("ws/notifications/", NotificationConsumer.as_asgi()),
    # re_path(r"^ws/$", NotificationConsumer.as_asgi()),
    # url(r"^ws/?$", NotificationConsumer.as_asgi()),
]

# application = ProtocolTypeRouter({
#     # "http": application,
#     "websocket": URLRouter(websocket_urlpatterns),
# })
