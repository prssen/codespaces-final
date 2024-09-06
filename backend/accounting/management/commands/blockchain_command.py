from django.core.management.base import BaseCommand

# TODO: package this with runserver into a startup script when you finish the app
# for now, blockchain listener init will happen in apps.py ready() method


class BlockchainListener(BaseCommand):
    help = 'Start a script that polls for events on the blockchain'

    def handle(self, *args, **options):
        # Insert code here
        print('Does this code work?')
