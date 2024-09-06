"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""
# isort: skip_file
import os

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

django_asgi_app = get_asgi_application()

import ptvsd
# print('RUN MAIN: ', os.getenv('RUN_MAIN'))
# print('WERKZEUG MAIN: ', os.getenv('WERKZEUG_RUN_MAIN'))
# if os.getenv('RUN_MAIN') or os.getenv('WERKZEUG_RUN_MAIN'):
# ptvsd.enable_attach(address=('0.0.0.0', 5678), redirect_output=True)

# Ignore import order for this line
from accounting.routing import websocket_urlpatterns
from accounting.middleware import TokenAuthMiddlewareStack

# "http": application,
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    # "websocket": AuthMiddlewareStack(
    "websocket": TokenAuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
