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

let availableRoles: Map<string, string[]> = new Map<string, string[]>();
let assignedRoles: Map<string, Map<string, string> > = new Map();
let rooms: Map<string, number> = new Map();
let playersByRoom: Map<string, Map<string, string> > = new Map();

const general = io
    .of("/general")
    .on('connection', (socket: Socket) => {
        console.log("An user connected!");

        socket.on('join room', (room, nick) => {
            let users = rooms.get(room) ?? 0;
            rooms.set(room, users++);
            playersByRoom.get(room)?.set(socket.id.toString(), nick);
            socket.join(room);
            if (users == 1) {
                socket.to(room).emit('gamemaster');
                socket.to(room).emit('role assignation', "GAMEMASTER");
            }
        });

        // connection is up, let's add a simple simple event
        socket.on('chat message', (room: string, nick:string, msg: string) => {
            // log the received message and send it back to the client
            console.log("("+room+") " + nick + ": " + msg);
            general.to(room).emit('chat message', nick, msg);
        });


        socket.on('init game', obj => {
            availableRoles.set(obj.room, []);
            for (let i = 0; i < obj.w; i++) availableRoles.get(obj.room)?.push("Werewolf");
            for (let i = 0; i < obj.v; i++) availableRoles.get(obj.room)?.push("Villager");
            for (let i = 1; i < 7; i++)
                if (((obj.r >> i) % 2) === 1)
                    availableRoles.get(obj.room)?.push(roles[i]);
            availableRoles.set(obj.room, _.shuffle(availableRoles.get(obj.room)));

            console.log(availableRoles.get(obj.room));

            socket.to(obj.room).emit('gamemaster');
            socket.to(obj.room).emit('role assignation', "GAMEMASTER");
        });

        socket.on('abort game', (room) => {
            availableRoles.set(room, []);
            console.log("Game aborted");
            general.to(room).emit('game aborted');
            assignedRoles.set(room, new Map());
        });

        socket.on('change nick', (room, oldNick: string, newNick: string) => {
           console.log('%s is now %s', oldNick, newNick);
           playersByRoom.get(room)?.set(socket.id, newNick);
           general.to(room).emit('nick changed', {oldNick, newNick});
        });

        socket.on('request role', (room, nick: string) => {
            console.log('%s requests a role!', nick);
            const r = availableRoles.get(room)?.pop();
            if(r != undefined) {
                console.log("Assigning role %s to %s", r, nick);
                assignedRoles.get(room)?.set(nick, r || 'Viewer');
                socket.to(room).emit('role assignation', r);
            } else socket.to(room).emit('no role available');
        });

        socket.on('get identities', (room) => {
            let str: string = "";
            assignedRoles.get(room)?.forEach((value: string, key: string) => {
                str += key + ": " + value + ", ";
            });
            socket.to(room).emit('get identities', str);
        });

        socket.on('disconnection', (room, nick) => {
            let users = rooms.get(room) ?? 0;
            rooms.set(room, users--);
            socket.to(room).emit('leaving', nick);
        });

        // send immediatly a feedback to the incoming connection
        socket.send('Hi there, I am a WebSocket server');
    });

const wolves = io
    .of("/wolves")
    .on('connection', (socket: Socket) => {
        socket.on('join wolves', room => socket.join(room));
        console.log("WOOF! WOOF!");

        socket.on('wolf message', (room: string, nick:string, msg: string) => {
            // log the received message and send it back to the client
            console.log("("+room+") " + nick + ": " + msg);
            wolves.to(room).emit('wolf message', nick, msg);
        });
    })
;
httpsrv.listen(PORT, () => console.log(`Listening on ${PORT}`));