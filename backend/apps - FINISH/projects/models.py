from django.db import models
from djmoney.models.fields import MoneyField
import datetime

class Project(models.Model):
    name = models.CharField(max_length=200)
    start_date = models.DateField(null=True, blank=True, default=datetime.date.today)
    end_date = models.DateField(null=True, blank=True)
    # How much the appeal is trying to raise
    target_donations = MoneyField(max_digits=19, decimal_places=4, default_currency='GBP')

# Fields used to populate charity appeals page in donation tracker
# One project may have many appeals
class ProjectAppeal(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='appeals') 
    title = models.CharField(max_length=200, blank=True, null=True, default='Charity Project')
    subtitle = models.CharField(max_length=400, default='Insert text here')
    date_started = models.DateField(null=True, blank=True, default=datetime.date.today)
    date_ended = models.DateField(null=True, blank=True)
    story = models.TextField(blank=True, null=True, default='Insert story of your charity project here')
    is_live = models.BooleanField(default=False) # Activates/deactivates charity appeal page


class ProjectGallery(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='photos') 
    photo = models.ImageField(default='placeholder.png') # TODO: add default placeholder image


# Updates posted to a charity project/appeal page
class ProjectUpdate(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    update_title = models.CharField(max_length=200, blank=True, null=True) # TODO: perhaps omit, if UI doesn't need it
    text = models.TextField()


# Taken from https://docs.djangoproject.com/en/5.0/ref/models/fields/#model-field-types
def user_project_path(instance, filename):
    # TODO: replace with 'media/userName/projectName/year/month/day?

    # file will be uploaded to MEDIA_ROOT / user_<id>/<filename> 
    # return 'user_{0}/{1}'.format(instance.user.id, filename) 
    return 'user_{0}/{1}'.format(0, filename) 

# Images, video or other media attached to a project update
class ProjectUpdatesMedia(models.Model):
    project = models.ForeignKey(ProjectUpdate, on_delete=models.CASCADE, related_name='media')
    media = models.FileField(upload_to=user_project_path)

