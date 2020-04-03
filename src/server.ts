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
let assignedRoles: Map<string, string> = new Map<string, string>();
let progress = false;

const general = io
    .of("/general")
    .on('connection', (socket: Socket) => {
        console.log("An user connected!");
        socket.emit('progress', progress);
        // connection is up, let's add a simple simple event
        socket.on('chat message', (msg: string) => {
            // log the received message and send it back to the client
            console.log(msg);
            general.emit('chat message', msg);
        });

        socket.on('init game', obj => {
            progress = true;
            for (let i = 0; i < obj.w; i++) availableRoles.push("Werewolf");
            for (let i = 0; i < obj.v; i++) availableRoles.push("Villager");
            for (let i = 1; i < 7; i++)
                if (((obj.r >> i) % 2) === 1)
                    availableRoles.push(roles[i]);
            availableRoles = _.shuffle(availableRoles);

            console.log(availableRoles);

            socket.emit('gamemaster');
            socket.emit('role assignation', "GAMEMASTER");
        });

        socket.on('abort game', () => {
            progress = false;
            availableRoles = [];
            console.log("Game aborted");
            general.emit('game aborted');
            assignedRoles = new Map<string, string>();
        });

        socket.on('change nick', (oldNick: string, newNick: string) => {
           console.log('%s is now %s', oldNick, newNick);
           general.emit('nick changed', {oldNick, newNick});
        });

        socket.on('request role', (nick: string) => {
            console.log('%s requests a role!', nick);
            if (availableRoles.length > 0) {
                const r = availableRoles.pop();
                console.log("Assigning role %s to %s", r, nick);
                assignedRoles.set(nick, r || 'Viewer');
                socket.emit('role assignation', r);
            }
            else socket.emit('no role available');
        });

        socket.on('get identities', () => {
            let str: string = "";
            assignedRoles.forEach((value: string, key: string) => {
                str += key + ": " + value + ", ";
            });
            socket.emit('get identities', str);
        });

        // send immediatly a feedback to the incoming connection
        socket.send('Hi there, I am a WebSocket server');
    });

const wolves = io
    .of("/wolves")
    .on('connection', (socket: Socket) => {
        console.log("WOOF! WOOF!");
        socket.on('wolf message', (msg: string) => {
            // log the received message and send it back to the client
            console.log(msg);
            wolves.emit('wolf message', msg);
        });
    })
;
httpsrv.listen(PORT, () => console.log(`Listening on ${PORT}`));