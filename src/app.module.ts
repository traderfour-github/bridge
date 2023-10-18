import { WebsocketModule } from './modules/socket/bridge/socket.module';
import { KafkaModule } from './modules/kafka/bridge/kafka.module';
import { BullConfigService } from './config/queue/bull.config';
import { AuthModule } from './modules/auth/auth.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({ useClass: BullConfigService }),
    EventEmitterModule.forRoot(),
    WebsocketModule,
    KafkaModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
