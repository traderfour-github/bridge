import { BridegConsumerRepository } from '../repositories/bridge.consumer.repository';
import { IConsumerOptions } from '../interfaces/consumer-options.interface';
import { Inject,Injectable,OnApplicationShutdown} from '@nestjs/common';
import { IConsumer } from '../interfaces/consumer.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private readonly consumers: IConsumer[] = [];

  async consume({ topics, config, onMessage }: IConsumerOptions) {
    const consumer = new BridegConsumerRepository(
      topics,
      config,
      this.configService.get('KAFKA_BROKER'),
      this.eventEmitter,
      this.cacheManager,
    );
    await consumer.connect();
    await consumer.consume(onMessage);
    this.consumers.push(consumer);
  }

  async onApplicationShutdown(signal?: string) {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}
