from celery import Celery, shared_task
# import ipfshttpclient
from ipfsApi.client import Client

# import os
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
# app = Celery('tasks', broker='redis://localhost:6379/0')

# # CREDIT: code from GitHub copilot
# # Using a string here means the worker doesn't have to serialize
# # the configuration object to child processes.
# app.config_from_object('django.conf:settings', namespace='CELERY')

# # Load task modules from all registered Django app configs.
# app.autodiscover_tasks()

# @app.task

@shared_task
def save_activity_to_blockchain(charity, activity):
    """
        Save activity data to blockchain and IPFS.

        Arguments:
        charity (models.Model): Charity Django model object
        activity (models.Model): Activity Django model object
    """
    from accounting.blockchain_provider import brownie_blockchains

    # Save each attachment to IPFS
    ipfs = Client('127.0.0.1', 5001)
    # TODO: delete this
    # ipfs = ipfshttpclient.connect()
    for attachment in activity.attachments:
        res = ipfs.add(attachment.file)
        # Store CID (IPFS hash address) in model
        attachment.ipfs_hash = res['Hash']

    # Save to blockchain
    brownie_blockchains.create_activity(charity, activity)
    

@shared_task
def listen_for_events():
    from accounting.consumers import blockchain_consumer
