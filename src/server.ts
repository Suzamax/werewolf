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

const general = io
    .of("/general")
    .on('connection', (socket: Socket) => {
        console.log("An user connected!");

        socket.on('join room', room => {
            socket.join(room);
        });

        // connection is up, let's add a simple simple event
        socket.on('chat message', (room: string, nick:string, msg: string) => {
            // log the received message and send it back to the client
            console.log(nick + ": " + msg);
            general.to(room).emit('chat message', nick, msg);
        });

        socket.on('init game', obj => {
            for (let i = 0; i < obj.w; i++) availableRoles.push("Werewolf");
            for (let i = 0; i < obj.v; i++) availableRoles.push("Villager");
            for (let i = 1; i < 7; i++)
                if (((obj.r >> i) % 2) === 1)
                    availableRoles.push(roles[i]);
            availableRoles = _.shuffle(availableRoles);

            console.log(availableRoles);

            socket.to(obj.room).emit('gamemaster');
            socket.to(obj.room).emit('role assignation', "GAMEMASTER");
        });

        socket.on('abort game', (room) => {
            availableRoles = [];
            console.log("Game aborted");
            general.to(room).emit('game aborted');
            assignedRoles = new Map<string, string>();
        });

        socket.on('change nick', (room, oldNick: string, newNick: string) => {
           console.log('%s is now %s', oldNick, newNick);
           general.to(room).emit('nick changed', {oldNick, newNick});
        });

        socket.on('request role', (room, nick: string) => {
            console.log('%s requests a role!', nick);
            if (availableRoles.length > 0) {
                const r = availableRoles.pop();
                console.log("Assigning role %s to %s", r, nick);
                assignedRoles.set(nick, r || 'Viewer');
                socket.to(room).emit('role assignation', r);
            }
            else socket.to(room).emit('no role available');
        });

        socket.on('get identities', (room) => {
            let str: string = "";
            assignedRoles.forEach((value: string, key: string) => {
                str += key + ": " + value + ", ";
            });
            socket.to(room).emit('get identities', str);
        });

        // send immediatly a feedback to the incoming connection
        socket.send('Hi there, I am a WebSocket server');
    });

const wolves = io
    .of("/wolves")
    .on('connection', (socket: Socket) => {
        console.log("WOOF! WOOF!");
        socket.on('wolf message', (room, msg: string) => {
            // log the received message and send it back to the client
            console.log(msg);
            wolves.to(room).emit('wolf message', msg);
        });
    })
;
httpsrv.listen(PORT, () => console.log(`Listening on ${PORT}`));