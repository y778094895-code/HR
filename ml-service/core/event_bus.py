import aio_pika
import json
import asyncio
import os
import uuid
from datetime import datetime

class EventBus:
    def __init__(self):
        self.connection = None
        self.channel = None
        self.exchanges = {
            'employee': 'employee.events',
            'fairness': 'fairness.events',
            'intervention': 'intervention.events',
            'turnover': 'turnover.events'
        }
        self.exchange_objs = {}

    async def connect(self):
        rabbitmq_url = os.getenv('RABBITMQ_URL', 'amqp://guest:guest@rabbitmq:5672/')
        try:
            self.connection = await aio_pika.connect_robust(rabbitmq_url)
            self.channel = await self.connection.channel()
            
            # Declare exchanges
            for name, exchange_name in self.exchanges.items():
                self.exchange_objs[name] = await self.channel.declare_exchange(
                    exchange_name, aio_pika.ExchangeType.TOPIC, durable=True
                )
                
            print("EventBus connected to RabbitMQ (Python)")
        except Exception as e:
            print(f"EventBus connection failed: {e}")
            # Retry handled by connect_robust usually, but we can add loop if needed

    async def publish(self, service: str, event_type: str, data: dict, routing_key: str = None):
        if not self.channel:
            await self.connect()
            
        exchange = self.exchange_objs.get(service)
        if not exchange:
            print(f"Unknown service exchange: {service}")
            return

        message = {
            "eventType": event_type,
            "data": data,
            "timestamp": datetime.utcnow().isoformat(),
            "traceId": data.get("traceId", str(uuid.uuid4()))
        }

        await exchange.publish(
            aio_pika.Message(
                body=json.dumps(message).encode(),
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT
            ),
            routing_key=routing_key or event_type
        )
        print(f"Published {event_type} to {self.exchanges[service]}")

    async def subscribe(self, service: str, event_types: list, handler, queue_name: str = ''):
        if not self.channel:
            await self.connect()

        exchange_name = self.exchanges.get(service)
        if not exchange_name:
            return

        # Declare exchange again to be sure (or just use name if we trust it exists)
        exchange = await self.channel.declare_exchange(
            exchange_name, aio_pika.ExchangeType.TOPIC, durable=True
        )

        queue = await self.channel.declare_queue(queue_name, exclusive=(queue_name == ''))

        for event_type in event_types:
            await queue.bind(exchange, routing_key=event_type)

        async def callback(message: aio_pika.IncomingMessage):
            async with message.process():
                content = json.loads(message.body.decode())
                await handler(content)

        await queue.consume(callback)
        print(f"Subscribed to {event_types} from {exchange_name}")

event_bus = EventBus()
