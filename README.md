<p align="center">
<a href="http://nestjs.com/" target="blank"><img src="https://camo.githubusercontent.com/5f54c0817521724a2deae8dedf0c280a589fd0aa9bffd7f19fa6254bb52e996a/68747470733a2f2f6e6573746a732e636f6d2f696d672f6c6f676f2d736d616c6c2e737667" width="200" alt="Nest Logo" /></a>
</p>
<p align="center"><b>Bridge Microservice </b> is a service provider and communication receiver with web and mobile clients as well as trading platforms.</p>

## Description

<p style="text-align: left">This microservice is developed with <a href="https://github.com/nestjs/nest" target="__blanck">Nestjs</a> framework. It can be connected with front-end services and back-end services as well as trading platforms. Libraries such as Kafka, WebSocket, Redis, and JWT are used on this microservice. Its architecture is designed based on the repository design pattern and has sufficient flexibility for external communication
</p>

## Installation

```bash
$ npm install
```

```bash
$ pnpm install
```

```bash
$ yarn install
```

## Before running the app

1. Ensure that the application is connected to the Kafka cluster. For this, specify the KAFKA_BROKER value in the .env file

2.  Ensure that the application is connected to the Redis server .  For this, specify the REDIS_HOST , REDIS_PORT values in the .env file

3. In general, it should be known that a message can be sent on any topic in Kafka. It will be shared with trading platforms and will wait for their response and then share the received message to clients and also to Kafka itself.


## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Routes 

1. To communicate with sockets, WS protocol is used with two separate ports that can be implemented on the same domain or different subdomains.

2. Routes are authenticated with JWT and in order to connect to a certain room the user must be logged in to be able to join a room.

| namespace      | protocol | port | listeners                   | events          |
|:-------------- |:-------- | ---- | --------------------------- | --------------- |
| /metatrader/v1 | ws       | 3002 | exception , EventToMtClient | EventToMtServer |
| /client/v1     | ws       | 3001 | exception , EventToClient   | -               |


#### Use general auth system

1. With this endpoint, we receive the value of the token and identity of the user account and send it to the backend for checking, and if there is a user and the user account is active, it returns two values ​​of has_access and identity

| endpoint     | protocol | port | method | body                                | response              |
|:------------ |:-------- | ---- | ------ | ----------------------------------  | --------------------- |
| /join        | http     | 3000 | post   | token : string , identity : string  | has_access , identity | 


#### General schematic of how to run microservice

<p align="left">
<a href="https://my.visme.co/view/x47og6oy-microservice" target="blank"> Visit This Site</a>
</p>