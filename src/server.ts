import "reflect-metadata"; // this shim is required
import {createExpressServer} from "routing-controllers";
import {VillageController} from "./controllers/VillageController";
import * as express from 'express';
import * as path from 'path';

import * as http from 'http';
import * as WebSocket from 'ws';

const PORT = process.env.PORT || 3000;

const app = createExpressServer({
    controllers: [
        VillageController
    ]
});

app
    .use(express.static(path.join(__dirname,'/public')))
    .set('views', __dirname + '/views')
    .set('view engine', 'pug')
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {

    //connection is up, let's add a simple simple event
    ws.on('message', (message: string) => {

        //log the received message and send it back to the client
        console.log('received: %s', message);
        ws.send(`Hello, you sent -> ${message}`);
    });

    //send immediatly a feedback to the incoming connection
    ws.send('Hi there, I am a WebSocket server');
});
