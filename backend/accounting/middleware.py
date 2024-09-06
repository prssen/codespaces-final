from urllib.parse import parse_qs

from channels.auth import AuthMiddleware
from channels.db import database_sync_to_async
from channels.sessions import CookieMiddleware, SessionMiddleware

# from rest_framework.authtoken.models import Token
from dj_rest_auth.models import TokenModel as Token
from django.contrib.auth.models import AnonymousUser

# Middleware to authenticate WebSocket requests
# Adapted from: https://stackoverflow.com/a/72421180 
@database_sync_to_async
def get_user(scope):
    query_string = parse_qs(scope['query_string'].decode())
    token = query_string.get('token')
    if not token:
        return AnonymousUser()
    try:
        user = Token.objects.get(key=token[0]).user

    except Exception as exception:
        return AnonymousUser()
    if not user.is_active:
        return AnonymousUser()
    return user


class TokenAuthMiddleware(AuthMiddleware):
    async def resolve_scope(self, scope):
        scope['user']._wrapped = await get_user(scope)


def TokenAuthMiddlewareStack(inner):
    return CookieMiddleware(SessionMiddleware(TokenAuthMiddleware(inner)))
