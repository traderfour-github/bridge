import { ConsumerConfig, ConsumerSubscribeTopics, KafkaMessage } from 'kafkajs';

export interface IConsumerOptions {
  topics: ConsumerSubscribeTopics;
  config: ConsumerConfig;
  onMessage: (message: KafkaMessage) => Promise<void>;
}
