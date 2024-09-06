from rest_framework.exceptions import APIException
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_403_FORBIDDEN
from django.core.exceptions import PermissionDenied
from rest_framework.views import exception_handler
import logging

# Adapted from https://www.django-rest-framework.org/api-guide/exceptions/#custom-exception-handling
# and https://www.untangled.dev/2023/07/22/django-drf-exception-logging/
logger = logging.getLogger(__name__)


def exception_logging(exc, context):
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    # Log the exception. For example: 'Bad request to api/v1/countries,
    # NoTenantError: no tenant ID has been set'
    # print('Logged error: ', response)
    logger.error(
        f'Bad request to {context["request"].path}, {exc.__class__.__name__}: {exc}')

    return response

    # # TODO: add to settings.py
    # REST_FRAMEWORK = {
    #     'EXCEPTION_HANDLER': 'final_backend.accounting.exceptions.exception_logging'
    # }

    # # and this (from https://stackoverflow.com/questions/59018824/how-to-log-every-request-and-response-if-500-error-occurs-in-django-rest-framewo)
    # LOGGING = {
    #     'version': 1,
    #     'disable_existing_loggers': False,
    #     'formatters': {
    #         'simple': {
    #             'format': '{asctime} {levelname} {message}'
    #         },
    #     },
    #     'handlers': {
    #         'file': {
    #             'level': 'ERROR',
    #             'class': 'logging.FileHandler',
    #             'filename': os.path.join(BASE_DIR, 'logs', 'error.log'),
    #             'formatter': 'simple'
    #         },
    #     },
    #     'root': {
    #         'django': {
    #             'handlers': ['file'],
    #             'level': 'ERROR',
    #             'propagate': True,
    #         }
    #     },
    # }


# Code from https://stackoverflow.com/a/54651721


class Custom400(APIException):
    """Readers error class"""

    def __init__(self, msg):
        APIException.__init__(self, msg)
        self.status_code = HTTP_400_BAD_REQUEST
        self.message = msg

# Custom error to inform us that a Transaction has less than 2 entries (should be double-entry)
# TODO: raises a 500, instead of 403 (permission denied) - investigate DRF exceptions instead
# TODO: move to exceptions.py


class InvalidDoubleEntry(APIException):
    status_code = HTTP_400_BAD_REQUEST
    default_detail = 'Transaction must have at least two entries: a debit and a credit'
    default_code = 'invalid_double_entry'


class NoTenantError(APIException):
    """Exception raised if object is created or accessed without an accompanying tenant ID"""

    def __init__(self, msg):
        APIException.__init__(self, msg)
        self.status_code = HTTP_403_FORBIDDEN
        self.message = msg
