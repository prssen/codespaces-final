from celery import Celery, shared_task
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery(
    'accounting',
    namespace='CELERY',
    broker='redis://localhost:6379/0')
# include=['accounting.tasks'])

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
