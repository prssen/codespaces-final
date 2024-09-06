from django.db import models
from django.core.validators import (MinLengthValidator, 
                                    int_list_validator)
from phonenumber_field.modelfields import PhoneNumberField

class Country(models.Model):
    iso_code = models.CharField(max_length=3, primary_key=True) # Primary key - for ISO 3166-1 code
    name = models.CharField(max_length=200)

 # county, province, state or other administrative sub-division of a country
class Region(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=3, null=True, blank=True) # for 3-digit ISO 3166-2 code (https://en.wikipedia.org/wiki/ISO_3166-2)
    state_area_code = models.CharField(max_length=50, null=True, blank=True) # for other types of code (from https://vertabelo.com/blog/address-in-database-model/)

class City(models.Model):
    name = models.CharField(max_length=200) # Not primary key, as multiple cities can have the same name

 # represents borough or other administrative sub-division of a city
class District(models.Model):
    name = models.CharField(max_length=200)

# TODO: compare with django-address: https://pypi.org/project/django-address/ 
class Address(models.Model):
    # 3 lines of text avoids need to manage street numbers, names, suffixes and other edge cases
    address1 = models.CharField(max_length=200) 
    address2 = models.CharField(max_length=200, null=True, blank=True)
    address3 = models.CharField(max_length=200, null=True, blank=True)
    postal_code = models.CharField(max_length=32) # 32 characters enough to cover almost all postcodes (https://stackoverflow.com/q/325041)
    district = models.ForeignKey(District, on_delete=models.SET_NULL, null=True, blank=True)
    city = models.ForeignKey(City,
                              on_delete=models.SET_NULL, null=True, blank=True)
    region = models.ForeignKey(Region, on_delete=models.SET_NULL, null=True, blank=True)
    country = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True, blank=True) # TODO: correct foreign keys


# Superclass for all contact records (Donor, Customer, Supplier etc)
class Contact(models.Model):
    phone_number = PhoneNumberField(null=True, blank=True)
    email = models.EmailField(max_length=254)
    # TODO: change to one to many, if need to store history of changes in address
    address = models.OneToOneField(
            Address, 
            # related_name='persons',
            related_name="%(app_label)s_%(class)s_related",
            related_query_name="%(app_label)s_%(class)ss", 
            on_delete=models.DO_NOTHING, 
            blank=True, 
            null=True)
    avatar = models.ImageField(blank=True, null=True)

    class Meta:
        abstract = True

# # Record of other names, such as trading names and colloquial names, for a contact
# class ContactNames(models.Model):
    

# Contact records relating to an organisation or other corporate entity
class Organisation(Contact):
    name = models.CharField(max_length=160) # Companies House permits UK company names to be up to 160 characters
    # TODO: change this into a 
    sector = models.CharField(max_length=64, blank=True, null=True)


# Contact records relating to a physical person
class Person(Contact):
    class Titles(models.IntegerChoices):
        MR = 0, 'Mr'
        MS = 1, 'Ms'
        MRS = 2, 'Mrs'
        MISS = 3, 'Miss'
    title = models.IntegerField(choices=Titles.choices, blank=True, null=True)
    first_name = models.CharField(max_length=64, blank=True, null=True)
    middle_names = models.CharField(max_length=400, blank=True, null=True)
    last_name = models.CharField(max_length=64, blank=True, null=True)
    birthdate = models.DateField(blank=True, null=True)
    suffix = models.CharField(max_length=100, blank=True, null=True)
    occupation = models.CharField(max_length=200, blank=True, null=True)
    # TODO: change to a list of choices
    nationality = models.CharField(max_length=64, blank=True, null=True)


class Charity(Organisation):
    # TODO: find exhaustive list + avoid hardcoding the keys (CIO = 'CIO', then { myModel.CIO} instead of {'CIO'})
    CHARITY_TYPES = (
        ('CIO', 'CIO: Charitable Incorporated Organisation'),
        ('COMP', 'Charity company (limited by guarantee)'),
        ('UNC', 'Unincorporated association'),
        ('TR', 'Trust'),
        ('OTH', 'Other')
    )

    legal_structure = models.CharField(max_length=64, choices=CHARITY_TYPES, blank=True, null=True)
    legal_structure_other = models.CharField(max_length=64, blank=True, null=True) # TODO: only display if 'OTH' choice above is selected

    # Registration numbers for UK charities (https://foodstandardsagency.github.io/enterprise-data-models/patterns/charity_commission_number.html)
    charity_commission_number = models.CharField(
                                    max_length=8, validators=[int_list_validator(sep=''), MinLengthValidator(8),], blank=True, null=True) # Fixed length (8 characters)
    # TODO: HMRC charity number etc 

    # Subtitle on charity page
    slogan = models.CharField(max_length=150, blank=True, null=True)
    # Brief 'About Us' description on charity page
    mission = models.TextField(blank=True, null=True)

class Donor(Person):
    GIVING_STAGES = (
        ('U', 'Unqualified'),
        ('Q', 'Qualified'),
        ('C', 'Cultivated'),
        ('S', 'Solicited'),
        ('SS', 'Stewarded')
    )

    # For donor management (i.e. marketing) purposes - see, for example, https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-prospect-status.html 
    giving_stage = models.CharField(max_length=2, choices=GIVING_STAGES, default='U')
    description = models.TextField(blank=True, null=True)
    # is_person = models.BooleanField(default=True)
    # TODO: interests, donorType, communicationPreferences 

    # TODO: DELETE THIS (can't choose parent model dynamically in Django)
    # class Meta:
    #     bases = decide_parent(is_person=self.is_person)

# TODO: add a ManytoMany field to Donor instead, for DonorInterests
# # Charity projects that donor has expressed an interest in, and may
# # support in future/be supporting
# class DonorInterests(models.Model):
#     donor = models.ForeignKey(Donor, on_delete=models.CASCADE, related_nme='interests')
#     projects = models.ForeignKey(Project, on_delete=models.CASCADE, related_nme='interests')


