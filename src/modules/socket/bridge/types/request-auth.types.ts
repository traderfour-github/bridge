import { Request } from 'express';

export type AuthPayload = {
  key: string ;
  identity: string;
  token : string
};

export type RequestWithAuth = Request & AuthPayload;
