export const configrationClient: any = {
  serverClient: true,
  namespace: '/client/v1',
  cors: {
    origin: ['https://admin.socket.io'],
    credentials: true,
    transports: ['websocket', 'xhr-polling'],
  },
};

export const configrationMt: any = {
  serverClient: true,
  namespace: '/metatrader/v1',
  cors: {
    origin: ['https://admin.socket.io'],
    credentials: true,
    transports: ['websocket', 'xhr-polling'],
  },
};
