import { Socket } from 'socket.io';

export type AuthPayload = {
  key: string ;
  identity: string;
  token : string
};

export type SocketWithAuth = Socket & AuthPayload;
