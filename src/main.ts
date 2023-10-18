import { SocketIOAdapter } from './modules/socket/bridge/adapters/socket.adapter';
import { IORedisKey } from './config/redis/redis.module';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


async function bootstrap() {
  try{
    const app = await NestFactory.create(AppModule);
    const configService =  app.get(ConfigService)
    const cacheService = await app.get(IORedisKey)

    app.useWebSocketAdapter(new SocketIOAdapter(app , configService ,cacheService))

    await app.listen(configService.get('APP_PORT'));
  }catch(error){
    new Error(`There is a problem in starting the system : ${error}`)
  }
}
bootstrap();
