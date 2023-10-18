import {OnGatewayConnection,OnGatewayDisconnect,OnGatewayInit,SubscribeMessage,WebSocketGateway,WebSocketServer,} from '@nestjs/websockets';
import { WsCatchAllFilter } from 'src/common/exceptions/websocket/ws-catch.filter';
import { ProducerService } from 'src/modules/kafka/bridge/services/producer.service';
import {Inject,Logger,UseFilters,UsePipes,ValidationPipe,} from '@nestjs/common';
import { configrationMt } from 'src/config/websocket/websocket.config';
import { ConsumerEmitEvent } from './events/consumer-emit.event';
import { ListenerMtEvent } from './events/listener-mt.event';
import { SocketWithAuth } from './types/socket-auth.type';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Namespace } from 'socket.io';
import { InjectQueue } from '@nestjs/bull';
import { Cache } from 'cache-manager';
import { Queue } from 'bull';


@UsePipes(new ValidationPipe())
@UseFilters(new WsCatchAllFilter())
@WebSocketGateway(3001, configrationMt)
export class MetaTraderGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private topicDefult = this.configService.get('KAFKA_DEFAULT_TOPIC');

  constructor(
    private readonly producerService: ProducerService,
    private readonly eventEmitter: EventEmitter2,
    @InjectQueue('bridge-queue') private readonly bridgeQueue: Queue,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService : ConfigService 
  ) {
  }

  @WebSocketServer() wss: Server;
  @WebSocketServer() io: Namespace;

  private logger: Logger = new Logger(MetaTraderGateway.name);

  afterInit(): void {
    this.logger.debug(`Websocket Gateway Initialized`);
  }

  async handleConnection(client: SocketWithAuth, ...args: any[]) {
    this.topicDefult = await this.cacheManager.get('topic');
    client.join(this.topicDefult ?? 'info');
    const sockets = this.io.sockets;

    this.logger.debug(`Meta Trader Connected : ${client.id}`);
    this.logger.verbose(`Number of connected sockets : ${sockets.size}`);

    const roomName = client.id;
    await client.join(roomName);

    const connectedClients = this.io.adapter.rooms?.get(roomName)?.size ?? 0;
    this.logger.debug(
      `user key: ${client.key} joined room with name: ${roomName}`,
    );
    this.logger.verbose(
      `Total clients connected to room '${roomName}': ${connectedClients}`,
    );
  }

  handleDisconnect(client: SocketWithAuth) {
    const sockets = this.io.sockets;

    const roomName = client.key;
    const clientCount = this.io.adapter.rooms?.get(roomName)?.size ?? 0;

    this.logger.debug(`Disconnected socket id: ${client.id}`);
    this.logger.verbose(`Number of connected sockets: ${sockets.size}`);
    this.logger.debug(
      `Total clients connected to room '${roomName}': ${clientCount}`,
    );
  }

  @OnEvent('consumer.emit', { async: true })
  @SubscribeMessage('EventToMtServer')
  async handleMessage(payload: ConsumerEmitEvent, body) {
    this.topicDefult = await this.cacheManager.get('topic');

    if (payload.message)
      await this.wss.to(this.topicDefult ?? 'info').emit('EventToMtClient', {
        payload: payload.message,
        time: new Date().toDateString,
      });

    // Shares data received from trading platforms with frontend platforms and Kafka
    if (body) {
      await this.producerService.produce(this.topicDefult ?? 'info', {
        value: JSON.stringify(body),
      });
      this.eventEmitter.emit('listener.mt', new ListenerMtEvent(body));
    }
  }
}
