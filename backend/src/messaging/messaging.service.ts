import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Channel, Connection, connect } from 'amqplib';

const DEFAULT_EXCHANGE = 'ucp.domain.events';

@Injectable()
export class MessagingService implements OnModuleInit, OnModuleDestroy {
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  async onModuleInit() {
    const url =
      process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';
    this.connection = await connect(url);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(DEFAULT_EXCHANGE, 'topic', {
      durable: true,
    });
  }

  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }

  async publish<T>(routingKey: string, payload: T) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    const message = Buffer.from(JSON.stringify(payload));
    this.channel.publish(DEFAULT_EXCHANGE, routingKey, message, {
      contentType: 'application/json',
      persistent: true,
    });
  }

  async registerConsumer(
    queue: string,
    bindings: string[],
    handler: (data: any) => Promise<void> | void,
  ) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    await this.channel.assertQueue(queue, { durable: true });
    for (const binding of bindings) {
      await this.channel.bindQueue(queue, DEFAULT_EXCHANGE, binding);
    }
    await this.channel.consume(queue, async (msg) => {
      if (!msg) return;
      const content = msg.content.toString();
      await handler(JSON.parse(content));
      this.channel?.ack(msg);
    });
  }
}

