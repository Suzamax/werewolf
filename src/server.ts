import "reflect-metadata"; // this shim is required
import {createExpressServer} from "routing-controllers";
import { VillageController } from "./controllers/VillageController";

import * as express from 'express';
import * as path from 'path';
import * as http from 'http';
import * as mustacheExpress from 'mustache-express';
import * as socketio from 'socket.io';
import {Socket} from "socket.io";

const PORT = process.env.PORT || 3000;
const app = createExpressServer({
    controllers: [
        VillageController
    ]
});

app
    .engine('mustache', mustacheExpress())
    .use(express.static(path.join(__dirname,'/public')))
    .set('views', __dirname + '/views')
    .set('view engine', 'mustache')

// initialize a simple http server
const httpsrv = http.createServer(app);
const io = socketio(httpsrv);

io.on('connection', (socket: Socket) => {
    console.log("An user connected!")
    // connection is up, let's add a simple simple event
    socket.on('message', (message: string) => {

        // log the received message and send it back to the client
        console.log('received: %s', message);
        socket.send(`Hello, you sent -> ${message}`);
    });

    // send immediatly a feedback to the incoming connection
    socket.send('Hi there, I am a WebSocket server');
});

const server = httpsrv.listen(PORT, () => console.log(`Listening on ${PORT}`));