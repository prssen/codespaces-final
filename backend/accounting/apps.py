from django.apps import AppConfig
import os
# from accounting.consumers import blockchain_consumer
from accounting.tasks import listen_for_events


class AccountingConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "accounting"

    def ready(self):
        # Import signal handlers - this implicitly connecs any
        # signal handlers to their signals
        from accounting import signals

        # TODO: this code should be executed once, when app starts up (double check)
        # Enroll admin user in blockchain
        print('Is this run?')
        # listen_for_events.delay()

        # # This only runs when manage.py runserver is called
        # if os.environ.get('RUN_MAIN'):
        #     print("STARTUP AND EXECUTE HERE ONCE.")
        #     # call here your code
