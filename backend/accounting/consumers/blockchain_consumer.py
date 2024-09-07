import collections.abc
import time
from accounting.blockchain_provider import brownie_blockchains as chain
import collections
import sys

from confluent_kafka import Consumer
from confluent_kafka.error import KafkaError, KafkaException

conf = {'bootstrap.servers': 'localhost:9092',
        'group.id': 'foo',
        'auto.offset.reset': 'smallest'}

consumer = Consumer(conf)


def is_event_empty(event):
    # Credit: adapted from GitHub Copilot suggestion
    # TODO: move to helpers
    if not event:
        return True
    for i in event:
        if isinstance(event[i], collections.abc.Mapping):
            if not is_event_empty(event[i]):
                return False
        elif event[i]:
            return False

        # if isinstance(event[i], collections.abc.Mapping) and is_event_empty(event[i]):
        #     continue
        # if event[i]:
        #     return False

            # and is_event_empty(event[i]):
            # continue

            # return is_event_empty(event[i])
        # if event[i]:
            # return False
    return True

try:
    # Topics to subscribe to
    consumer.subscribe(['NewExpense'])


    # event_filter = chain.get_new_events()
    # TODO: run this as a management command in Django on
    # app start up
    while True:
        # TODO: replace with asyncio.run() loop, as shown here: https://ethereum.stackexchange.com/a/144339
        # time.sleep(1)

        # events = event_filter.get_new_entries()

        events = consumer.poll(timeout=1.0)
        if events is None: 
            continue

        if events.error():
            if events.error().code() == KafkaError._PARTITION_EOF:
                # End of partition event
                sys.stderr.write('%% %s [%d] reached end at offset %d\n' %
                                (events.topic(), events.partition(), events.offset()))
            elif events.error():
                raise KafkaException(events.error())
        else:
            # events_process(events)
            print(events)
            print(events.key(), events.topic(), events.value())
            # Transform event data into a Notification model instance
            chain.process_event(events)

        # # TODO: working code (18/7/24) - re-neable if event filters don't work
        # events = chain.get_new_events()
        # if events is None:
        #     continue

        # # if type(events) in (str, int):
        # #     print(events)
        # #     continue

        # # if type(events) is not int:
        # # if len(events) == 0:
        # if not is_event_empty(events):
        #     for event_name in events:
        #         if is_event_empty(events[event_name]):
        #         # if len(events[event_name]) == 0:
        #             continue
        #         print(event_name)
        #         chain.process_event(event_name, events[event_name])


finally:
    consumer.close()