# Code adapted from https://medium.com/@mansha99/microservices-using-django-and-kafka-3776e8592ef3 
from django.core.management.base import BaseCommand
from confluent_kafka import Consumer
from accounting.models import Notification

class Command(BaseCommand):
    help = 'Read messages from Kafka topic'

    def handle(self, *args, **options):
        consumer = Consumer({
            'bootstrap.servers': 'localhost:9092',
            'group.id': 'my-group',
            'auto.offset.reset': 'earliest'
        })
        consumer.subscribe(['my-topic'])
        try:
            while True:
                message = consumer.poll(timeout=1.0)
                if message is None:
                    continue
                if message.error():
                    raise Exception(message.error())
                n = Notification(**message.value)
                n.save()
        finally:
            consumer.close()