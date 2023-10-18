import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumerService } from './services/consumer.service';
import { KAFKA_TOPICS } from 'src/config/kafka/kafka.config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BridgeConsumer implements OnModuleInit {
  constructor(
    private readonly consumeService: ConsumerService,
    private readonly configService : ConfigService
    ) {}

  async onModuleInit() {
    await this.consumeService.consume({
      topics: { topics: KAFKA_TOPICS },
      config: { groupId: this.configService.get('KAFKA_GROUP_ID') },
      onMessage: async (message) => {
        throw new Error('Bridge Consume error');
      },
    });
  }
}
