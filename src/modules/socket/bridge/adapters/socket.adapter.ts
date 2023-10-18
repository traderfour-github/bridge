import {configrationClient,configrationMt,} from 'src/config/websocket/websocket.config';
import { INestApplicationContext, Inject, Logger } from '@nestjs/common';
import { SocketWithAuth } from '../types/socket-auth.type';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { IORedisKey } from 'src/config/redis/redis.module';
import { Redis } from 'ioredis';

export class SocketIOAdapter extends IoAdapter {
  private readonly logger = new Logger(SocketIOAdapter.name);

  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService,
    @Inject(IORedisKey) private readonly redisClient: Redis,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const clientPort = parseInt(this.configService.get('CLIENT_PORT'));

    const getPromiseInstance = () =>
      new Promise((resolve, reject) => {
        resolve('');
      });

    const cors = {
      origin: [
        `http://localhost:${clientPort}`,
        new RegExp(`/^http:\/\/192\.168\.1\.([1-9]|[1-9]\d):${clientPort}$/`),
      ],
    };

    const optionsWithCORS: ServerOptions = {
      ...options,
      cors,
    };

    const server: Server = super.createIOServer(port, optionsWithCORS);

    const clientMiddleware = async(socket : SocketWithAuth , next) => {
        if (socket.handshake && socket.handshake.query && socket.handshake.query.key) {
          const key = socket.handshake.query.key;
          getPromiseInstance().then(() => {
            const clearIntel = setInterval(() => {
              this.redisClient.get(key).then((keyVal) => {
                const obj = JSON.parse(keyVal);
                if (obj && obj.access !== undefined && obj.access) {
                  socket.key = key.toString();
                  next();
                } else {
                  this.logger.debug('Authentication error');
                  next(new Error('Authentication error'));
                }
              });
              clearInterval(clearIntel)
            }, 100);
          });
        } else {
          this.logger.debug('The key parameter is not set');
          next(new Error('The key parameter is not set'));
        }
    };


    const metatraderMiddleware = async(socket : SocketWithAuth , next) => {

      if (socket.handshake && socket.handshake.headers && 
        socket.handshake.headers['checkAccess'] === "true"
      ) {
        console.log('yes access')
        next()
      } else {
        this.logger.debug('The header is not set');
        next(new Error('The header is not set'));
      }
  };

    server.of(configrationClient.namespace).use(clientMiddleware);
    server.of(configrationMt.namespace).use(metatraderMiddleware);

    return server;
  }
}
