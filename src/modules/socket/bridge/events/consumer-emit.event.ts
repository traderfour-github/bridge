export class ConsumerEmitEvent {
  constructor(public readonly topic: string, public readonly message: object) {}
}
