from django.db import models

# TODO: Finish and Pre-populate with this info https://www.tide.co/blog/business-tips/vat-codes/ (see also QB VAT rates table)
# if time, create tables for users to set their own rates
class VATRates(models.Model):
    name = models.CharField(max_length=200)
    # VAT Rates can be 2 decimal place percentage values (e.g. 7.25% in some US states)
    amount = models.DecimalField(max_digits=5, decimal_places=2, validators=PERCENTAGE_VALIDATOR)
    description = models.TextField()

# # TODO: for testing, remove
# VATRates(name='standard', amount=20, description="Standard rate - 20\%\ for most goods and services")    

# def default_vat_rate():
#     return VATRates.objects.get(name='standard')
