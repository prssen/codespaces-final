from django.shortcuts import get_object_or_404
from django.db.models import Func
from rest_framework import serializers
from django.utils import timezone
from web3 import Web3
from accounting import exceptions
import os

class ChangeDir:
    """
        Temporarily change the current working directory. Use as a context
        manager to monkey-patch functions that use the current working
        directory to evaluate paths.
    """
    def __init__(self, new_dir):
        self.old_cwd = os.getcwd()
        self.cwd = os.chdir(new_dir)

    def __enter__(self):
        return self.cwd
    
    def __exit__(self, type, value, traceback):
        os.chdir(self.old_cwd)



class ReadWriteSerializerMethodField(serializers.SerializerMethodField):
    # Simpler solution from https://stackoverflow.com/a/62579804

    def __init__(self, method_name=None, **kwargs):
        self.method_name = method_name
        kwargs['source'] = '*'
        super(serializers.SerializerMethodField, self).__init__(**kwargs)

    def to_internal_value(self, data):
        return {self.field_name: data}


# From https://stackoverflow.com/a/64274128
class WritableSerializerMethodField(serializers.SerializerMethodField):
    def __init__(self, **kwargs):
        self.setter_method_name = kwargs.pop('setter_method_name', None)
        self.deserializer_field = kwargs.pop('deserializer_field')

        super().__init__(**kwargs)

        self.read_only = False

    def bind(self, field_name, parent):
        retval = super().bind(field_name, parent)
        if not self.setter_method_name:
            self.setter_method_name = f'set_{field_name}'

        return retval

    def get_default(self):
        default = super().get_default()

        return {
            self.field_name: default
        }

    def to_internal_value(self, data):
        value = self.deserializer_field.to_internal_value(data)
        method = getattr(self.parent, self.setter_method_name)
        return {self.field_name: self.deserializer_field.to_internal_value(method(value))}


# Copied from the Django Rest Framework APIView method get_object(), but
# also pessimistically locks the object being returned by calling
# select_for_update()
def get_object_with_locks(self):
    """
    Returns the object the view is displaying.

    You may want to override this if you need to provide non-standard
    queryset lookups.  Eg if objects are referenced using multiple
    keyword arguments in the url conf.
    """
    queryset = self.filter_queryset(self.get_queryset()).select_for_update()

    # Perform the lookup filtering.
    lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field

    # assert lookup_url_kwarg in self.kwargs, (
    #     'Expected view %s to be called with a URL keyword argument '
    #     'named "%s". Fix your URL conf, or set the `.lookup_field` '
    #     'attribute on the view correctly.' %
    #     (self.__class__.__name__, lookup_url_kwarg)
    # )
    if not lookup_url_kwarg in self.kwargs:
        raise AssertionError(
            'Expected view %s to be called with a URL keyword argument '
            'named "%s". Fix your URL conf, or set the `.lookup_field` '
            'attribute on the view correctly.' %
            (self.__class__.__name__, lookup_url_kwarg)
        )

    filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}
    obj = get_object_or_404(queryset, **filter_kwargs)

    # May raise a permission denied
    self.check_object_permissions(self.request, obj)

    return obj


def validate_ethereum_address(address):
    if not Web3.is_address(address):
        raise serializers.ValidationError("Invalid Ethereum address")


# From https://stackoverflow.com/a/34622417: rounds a Django aggregation to a given
# number of decimal places
class Round(Func):
    function = 'ROUND'
    arity = 2


def current_date():
    return timezone.now().date()


def leaves(struct, type='values'):
    """
        Return a set of leaf values found in nested dicts and lists excluding None values.
        Returns either leaf values, or leaf keys, depending on value of 'type' parameter.
    
    """
    # Adapted from: https://stackoverflow.com/a/59832594/
    values = set()

    def add_leaves(struct_):
        if isinstance(struct_, dict):
            struct_data = struct_.values() if type == 'values' else struct_.keys()
            for sub_struct in struct_data:
                sub_data = sub_struct if type == 'value' else struct_[sub_struct]
                # add_leaves(sub_struct)
                add_leaves(sub_data)
        elif isinstance(struct_, list):
            for sub_struct in struct_:
                add_leaves(sub_struct)
        elif struct_ is not None:
            values.add(struct_)

    add_leaves(struct)
    return values

def all_keys(nested_dict, base_objects=[]):
    """Get all keys in a nested dictionary. Includes optional list of base objects
        which shouldn't be iterated over.
    """
    keys = []
    if any(isinstance(nested_dict, obj) for obj in base_objects):
        # keys.append(nested_dict)
        # return keys
        return []
    for key in nested_dict:
        if isinstance(nested_dict[key], dict):
            keys.extend(all_keys(nested_dict[key], base_objects=base_objects))
        if isinstance(nested_dict[key], list):
            for item in nested_dict[key]:
                keys.extend(all_keys(item, base_objects=base_objects))
        keys.append(key)

    return keys

# Allows us to update a model instance in a put() function from a dictionary 
# of attributes
def is_simple_editable_field(field):
    return (
            field.editable
            and not field.primary_key
            and not isinstance(field, (ForeignObjectRel, RelatedField))
    )

def update_from_dict(instance, attrs, commit):
    allowed_field_names = {
        f.name for f in instance._meta.get_fields()
        if is_simple_editable_field(f)
    }

    for attr, val in attrs.items():
        if attr in allowed_field_names:
            setattr(instance, attr, val)

    if commit:
        instance.save()