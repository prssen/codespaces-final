# COPIED FROM https://github.com/bs1278/django_microservices/blob/main/django_microservices/orders/consumers/order_consumer.py
# TODO: look at https://medium.com/@mansha99/microservices-using-django-and-kafka-3776e8592ef3 
# and add to settings.py

from confluent_kafka import Consumer, KafkaError
import json

# Configure Kafka consumer settings
consumer = Consumer({
    'bootstrap.servers': 'your-kafka-broker',
    'group.id': 'order-events-consumer',
    'auto.offset.reset': 'earliest'
})

# Subscribe to the EVENTS_TOPIC
consumer.subscribe(['EVENTS_TOPIC'])

def save_notification(data):
    # Create Notification instance and save to database
    notification = Notification(**data)

    # TODO: will have to take blockchain user ID from the event,
    # identify Django user, and save data with the user identifier

    print(f'Order notification sent for Order ID={order_id} to {user_email}')

while True:
    msg = consumer.poll(1.0)

    if msg is None:
        continue
    if msg.error():
        if msg.error().code() == KafkaError._PARTITION_EOF:
            print('Reached the end of the partition')
        else:
            print('Error while receiving message: {}'.format(msg.error()))
    else:
        # Process the message based on its key and value
        key = msg.key()
        value = json.loads(msg.value())

        if key == "order_created":
            # Handle order creation event
            order_id = value.get('order_id')
            print('Order created: Order ID={}'.format(order_id))            
            # Process the order
            process_order(value)
            # Send order notifications
            send_order_notification(value)