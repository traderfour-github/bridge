import {OnGatewayConnection,OnGatewayDisconnect,OnGatewayInit,SubscribeMessage, WebSocketGateway,WebSocketServer,} from '@nestjs/websockets';
import { WsCatchAllFilter } from 'src/common/exceptions/websocket/ws-catch.filter';
import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { configrationClient } from 'src/config/websocket/websocket.config';
import { ListenerMtEvent } from './events/listener-mt.event';
import { Namespace, Server } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { SocketWithAuth } from './types/socket-auth.type';
import { AuthService } from 'src/modules/auth/auth.service';
import * as events from "events";

@UsePipes(new ValidationPipe())
@UseFilters(new WsCatchAllFilter())
@WebSocketGateway(3001, configrationClient)
export class ClientGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;
  @WebSocketServer() io: Namespace;

  private logger: Logger = new Logger(ClientGateway.name);

  constructor(private authService: AuthService) {}

  afterInit() {
    this.logger.debug(`Websocket Gateway Initialized`);
  }

  async handleConnection(client: SocketWithAuth, ...args: any[]) {
    const sockets = this.io.sockets;

    this.logger.debug(`Socket connected with identity key: ${client.key}`);

    this.logger.verbose(`WS Client with id: ${client.id} connected!`);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);

    const roomName = client.id;
    events.EventEmitter.defaultMaxListeners = 100;
    await client.join(roomName);

    const connectedClients = this.io.adapter.rooms?.get(roomName)?.size ?? 0;
    this.logger.debug(
      `user key: ${client.key} joined room with name: ${roomName}`,
    );
    this.logger.verbose(
      `Total clients connected to room '${roomName}': ${connectedClients}`,
    );
  }

  async handleDisconnect(client: SocketWithAuth, ...args: any[]) {
    const sockets = this.io.sockets;
    const { key, identity } = client;

    const roomName = key;
    const clientCount = this.io.adapter.rooms?.get(roomName)?.size ?? 0;

    this.logger.log(`Disconnected socket id: ${client.id}`);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);
    this.logger.debug(
      `Total clients connected to room '${roomName}': ${clientCount}`,
    );
  }

  @OnEvent('listener.mt', { async: true })
  @SubscribeMessage('EventToClientServer')
  async handleMessage(payload: ListenerMtEvent): Promise<void> {
    if (payload.message)
      await this.wss.emit('EventToClient', {
        payload: payload.message,
        time: new Date().toDateString,
      });
  }
}
