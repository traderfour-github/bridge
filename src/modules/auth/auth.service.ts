import { Inject, Injectable, Logger } from '@nestjs/common';
import { IORedisKey } from 'src/config/redis/redis.module';
import { JoinFields } from './types/join.type';
import { HttpService } from '@nestjs/axios';
import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { map, catchError} from 'rxjs';
import {AxiosRequestConfig} from 'axios'
import { Redis } from 'ioredis';
import { nanoid } from "nanoid";


@Injectable()
export class AuthService {

  private readonly logger = new Logger(AuthService.name);

  constructor(
    private http: HttpService,
    @Inject(IORedisKey) private readonly redisClient: Redis,
    private readonly configService: ConfigService
  ) {}


  async join(fields: JoinFields) {

    const requestConfig: AxiosRequestConfig = {
      headers: {
        "Accept" : "application/json",
        "Authorization" : fields.token
      },
    };

    const data = {
      "identity" : fields.identity
    }

    const secretKey = nanoid(36);

    return this.http
      .post(this.configService.get('CHECK_AUTH_WERIFY') ,data , requestConfig)
      .pipe(
        map(async (resp) =>{
          const access = {
            "succeed": true,
            "message": "successful message",
            "results": {
              "has_access": resp.data?.results?.has_access,
              "identity" : fields.identity,
              "key":secretKey
            },
            "metas": []
          }
          await this.redisClient.set(secretKey, JSON.stringify({'identity':access.results.identity, 'access':access.results.has_access}));
          this.logger.debug(`A request was received from client side : ${access.results.identity}`);
          return access;
        }),
      ).pipe(
        catchError(() => {
          throw new ForbiddenException('API not available');
        }),
      );
  }
}
