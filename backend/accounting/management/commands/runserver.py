import atexit
import signal
import sys

from daphne.cli import CommandLineInterface
from django.core.management.commands.runserver import Command

# Override 'runserver' to run cleanup code when server exits
class NewRunserverCommand(Command):
    def __init__(self, *args, **kwargs):
        atexit.register(self._exit)
        signal.signal(signal.SIGINT, self._kill_handler)
        signal.signal(signal.SIGTERM, self._kill_handler)
        # super(Command, self).__init__(*args, **kwargs)
        
        # Start the Daphne server
        CommandLineInterface().run(['-p', '8000', 'backend.asgi:application'])

    def _exit(self):
        from accounting.blockchain_provider import brownie_blockchains
        # Close the IPFS client
        brownie_blockchains.close()

    def _kill_handler(self, sig_no, frame):
        self._exit()
        sys.exit(0)