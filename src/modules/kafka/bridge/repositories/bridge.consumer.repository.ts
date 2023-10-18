import {Consumer,ConsumerConfig,ConsumerSubscribeTopics,Kafka,KafkaMessage,} from 'kafkajs';
import { ConsumerEmitEvent } from 'src/modules/socket/bridge/events/consumer-emit.event';
import { IConsumer } from '../interfaces/consumer.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { sleep } from 'src/common/utils/sleep.config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Inject, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';

export class BridegConsumerRepository implements IConsumer {
  private readonly kafka: Kafka;
  private readonly consumer: Consumer;
  private readonly logger: Logger;

  constructor(
    private readonly topics: ConsumerSubscribeTopics,
    config: ConsumerConfig,
    broker: string,
    private readonly eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.kafka = new Kafka({ brokers: [broker] });
    this.consumer = this.kafka.consumer(config);
    this.logger = new Logger(`${topics.topics}`);
  }

  async consume(onMessage: (message: KafkaMessage) => Promise<void>) {
    await this.consumer.subscribe(this.topics);
    await this.consumer.run({
      autoCommitThreshold: 1,
      eachMessage: async ({ topic, message, partition }) => {
        try {
          this.logger.debug(
            `Processing message topic: ${topic}-${partition}`,
            message.value.toString('utf-8'),
          );
          await this.cacheManager.set('topic', topic, 0);

          await this.eventEmitter.emit(
            'consumer.emit',
            new ConsumerEmitEvent(topic, JSON.parse(message.value.toString())),
          );
        } catch (err) {
          this.logger.error(
            'Error consuming message. Adding to dead letter queue...',
            err,
          );
        }
      },
    });
  }

  async connect() {
    try {
      await this.consumer.connect();
    } catch (err) {
      this.logger.error('Failed to connect to Kafka.', err);
      await sleep(5000);
      await this.connect();
    }
  }

  async disconnect() {
    await this.consumer.disconnect();
  }
}
