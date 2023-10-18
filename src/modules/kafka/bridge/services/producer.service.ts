import { BridgeProducerRepository } from '../repositories/bridge.producer.repository';
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { IProducer } from '../interfaces/producer.interface';
import { ConfigService } from '@nestjs/config';
import { Message } from 'kafkajs';

@Injectable()
export class ProducerService implements OnApplicationShutdown {
  private readonly producers = new Map<string, IProducer>();

  constructor(private readonly configService: ConfigService) {}

  async produce(topic: string, message: Message) {
    const producer = await this.getProducer(topic);
    await producer.produce(message);
  }

  private async getProducer(topic: string) {
    let producer = this.producers.get(topic);

    if (!producer) {
      producer = new BridgeProducerRepository(
        topic,
        this.configService.get('KAFKA_BROKER'),
      );
      await producer.connect();
      this.producers.set(topic, producer);
    }

    return producer;
  }

  async onApplicationShutdown(signal?: string) {
    for (const producer of this.producers.values()) {
      await producer.disconnect();
    }
  }
}
