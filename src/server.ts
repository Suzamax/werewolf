import "reflect-metadata"; // this shim is required
import {createExpressServer} from "routing-controllers";
import { VillageController } from "./controllers/VillageController";

import * as _ from 'lodash';
import * as express from 'express';
import * as path from 'path';
import * as http from 'http';
import * as mustacheExpress from 'mustache-express';
import * as socketio from 'socket.io';
import {Socket} from "socket.io";
import {message} from "gulp-typescript/release/utils";

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
;

// initialize a simple http server
const httpsrv = http.createServer(app);
const io = socketio(httpsrv);

const roles = [
    'Witch',
    'Thief',
    'Cupid',
    'Clairvoyant',
    'Hunter',
    'Father of all Werewolves',
    'Dumb'
];

let availableRoles: string[] = [];
let progress = false;

io.on('connection', (socket: Socket) => {
    console.log("An user connected!");
    socket.emit('progress', progress);
    // connection is up, let's add a simple simple event
    socket.on('chat message', (msg: string) => {
        // log the received message and send it back to the client
        console.log('received: %s', msg);
        io.emit('chat message', msg);
    });

    socket.on('init game', (w: number, v: number, role: number) => {
        progress = true;
        for (let i = 0; i < w; i++) availableRoles.push("Werewolf");
        for (let i = 0; i < w; i++) availableRoles.push("Villager");
        for (let i = 1; i < 7; i++)
            if (((role >> i) % 2) === 1)
                availableRoles.push(roles[i]);

        availableRoles = _.shuffle(availableRoles);
    });

    socket.on('change nick', (oldNick: string, newNick: string) => {
       console.log('%s is now %s', oldNick, newNick);
    });

    socket.on('wolf message', (msg: string) => {
        console.log('wolf says: %s', msg);
    });

    // send immediatly a feedback to the incoming connection
    socket.send('Hi there, I am a WebSocket server');
});

httpsrv.listen(PORT, () => console.log(`Listening on ${PORT}`));