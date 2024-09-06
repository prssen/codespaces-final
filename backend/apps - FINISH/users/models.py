from django.db import models
from django.contrib.auth.models import User

class SystemUser(User):
    class UserType(models.IntegerChoices):
        DONATION_USER = 0,
        ACCOUNTING_USER = 1

    notifications_enabled = models.BooleanField(default=True)
    userType = models.IntegerField(choices=UserType.choices, default=UserType.ACCOUNTING_USER)