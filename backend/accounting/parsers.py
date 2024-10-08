import codecs

from django.conf import settings

from rest_framework.exceptions import ParseError
from rest_framework import renderers
from rest_framework.parsers import BaseParser
from rest_framework.settings import api_settings
from rest_framework.utils import json

# CREDIT: code from https://stackoverflow.com/a/73471607


class BodySavingJSONParser(BaseParser):
    """
    Parses JSON-serialized data.
    """
    # media_type = 'application/json'
    # renderer_class = renderers.JSONRenderer
    # strict = api_settings.STRICT_JSON

    # def parse(self, stream, media_type=None, parser_context=None):
    #     """
    #     Parses the incoming bytestream as JSON and returns the resulting data.
    #     """
    #     parser_context = parser_context or {}
    #     encoding = parser_context.get('encoding', settings.DEFAULT_CHARSET)
    #     request = parser_context.get('request')

    #     try:
    #         decoded_stream = codecs.getreader(encoding)(stream)
    #         decoded_content = decoded_stream.read()
    #         # Saving decoded request original body to original_body
    #         setattr(request, 'original_body', decoded_content)
    #         parse_constant = json.strict_constant if self.strict else None
    #         return json.loads(decoded_content, parse_constant=parse_constant)
    #     except ValueError as exc:
    #         raise ParseError('JSON parse error - %s' % str(exc))

    media_type = 'application/json'
    renderer_class = renderers.JSONRenderer

    def parse(self, stream, media_type=None, parser_context=None):
        print('check parser is called')
        parser_context = parser_context or {}
        encoding = parser_context.get('encoding', settings.DEFAULT_CHARSET)
        request = parser_context.get('request')
        try:
            data = stream.read().decode(encoding)
            print('parsed data is: ', data)
            # setting a 'body' alike custom attr with raw POST content
            setattr(request, 'raw_body', data)
            return json.loads(data)
        except ValueError as exc:
            # raise ParseError('JSON parse error - %s' % six.text_type(exc)
            raise ParseError('JSON parse error - %s' % str(exc))
