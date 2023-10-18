import { ProducerService } from 'src/modules/kafka/bridge/services/producer.service';
import { ConsumerService } from 'src/modules/kafka/bridge/services/consumer.service';
import { ClientGateway } from './client.gateway';
import { HttpModule } from '@nestjs/axios';
import { MetaTraderGateway } from './metatrader.gateway';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { redisModule } from 'src/config/redis/redis.config';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'bridge-queue' }),
    CacheModule.register({ isGlobal: true }),
    HttpModule,
    redisModule,
    AuthModule,
  ],
  providers: [
    ClientGateway,
    ProducerService,
    ConsumerService,
    MetaTraderGateway,
  ],
  exports: [ClientGateway, MetaTraderGateway],
})
export class WebsocketModule {}
