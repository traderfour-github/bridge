import { ProducerService } from './services/producer.service';
import { ConsumerService } from './services/consumer.service';
import { BridgeConsumer } from './bridge.consumer';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [ProducerService, ConsumerService, BridgeConsumer],
  exports: [ProducerService, ConsumerService],
})
export class KafkaModule {}
