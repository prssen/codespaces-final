from rest_framework import serializers
import collections

# From https://www.django-rest-framework.org/api-guide/serializers/#dynamically-modifying-fields


class DynamicFieldsMixin(serializers.ModelSerializer):
    """
    A Mixin that takes an additional `fields` argument that
    controls which fields should be displayed.
    """

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop('fields', None)

        # Instantiate the superclass normally
        super().__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


# As above, but defining fields to exclude, rather than include, in
# the serializer output. Code from my previous Advanced Web Development project
class ExcludeFieldsMixin(serializers.ModelSerializer):
    """
    A Mixin that takes an additional `exclude` argument that
    controls which fields should be omitted.
    """

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        exclude = kwargs.pop('exclude', None)

        # Instantiate the superclass normally
        super().__init__(*args, **kwargs)

        if exclude is not None:
            # Drop any fields that are not specified in the `fields` argument.
            excluded = set(exclude) if (isinstance(
                exclude, collections.abc.Iterable) and not isinstance(exclude, str)) else set([exclude])
            existing = set(self.fields)
            for field_name in existing & excluded:
                self.fields.pop(field_name)

# From https://stackoverflow.com/a/22922156


class MultiSerializerViewSetMixin(object):
    def get_serializer_class(self):
        """
        Look for serializer class in self.serializer_action_classes, which
        should be a dict mapping action name (key) to serializer class (value),
        i.e.:

        class MyViewSet(MultiSerializerViewSetMixin, ViewSet):
            serializer_class = MyDefaultSerializer
            serializer_action_classes = {
               'list': MyListSerializer,
               'my_action': MyActionSerializer,
            }

            @action
            def my_action:
                ...

        If there's no entry for that action then just fallback to the regular
        get_serializer_class lookup: self.serializer_class, DefaultSerializer.

        """
        try:
            return self.serializer_action_classes[self.action]
        except (KeyError, AttributeError):
            return super(MultiSerializerViewSetMixin, self).get_serializer_class()


# TODO: implement this
class ClearingTransctionMixin(object):
    """Mixin to override the update() methods on viewsets which affect transactions so that, rather than
     updating the transaction itself, another transaction to cancel the previous one and create a new one is 
     created """

    pass
