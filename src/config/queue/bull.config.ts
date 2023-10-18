import {
  BullRootModuleOptions,
  SharedBullConfigurationFactory,
} from '@nestjs/bull';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BullConfigService implements SharedBullConfigurationFactory {
  createSharedConfiguration():
    | BullRootModuleOptions
    | Promise<BullRootModuleOptions> {
    return {
      redis: {
        host: process.env.QUEUE_HOST,
        port: parseInt(process.env.QUEUE_PORT),
      },
    };
  }
}
