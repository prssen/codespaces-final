from django.db import models

# TODO: add to AccountingUser model the field 'notificationsEnabled = models.BooleanField(default=True)'
# Notifications 
class Notification(models.Model):
    # TODO: finish this
    NOTIFICATION_TYPES = (
        (1, 'Donation'),
        (2, 'Approval'), # TEA and internal control transaction approvals
        (3, 'Comment'), # On a source document which user has already commented on
        # (4, 'Email/message') # If this is implemented?
    )
    sender = models.ForeignKey(User, related_name='notifications_sent', on_delete=models.DO_NOTHING)
    receiver = models.ForeignKey(User, related_name='notifications_received', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    notification_type = models.PositiveSmallIntegerField(choices=NOTIFICATION_TYPES, default=1) #TODO: select correct default
    message = models.CharField(max_length=200)
    is_seen = models.BooleanField(default=False)
