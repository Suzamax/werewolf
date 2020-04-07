import * as _ from 'lodash';

interface user {
    nick: string;
    role: string;
}

export class Room {
    private roles = [
        'Witch', // 1
        'Thief', // 2
        'Cupid', // 4
        'Clairvoyant', // 8
        'Hunter', // 16
        'Fox', // 32
        'Dumb', // 64
        'Knight', // 128
        'Bear Tamer', // 256
        'Protector', // 512
        // Werewolves-ish
        'Father of all Werewolves', // 1024
        'Wild Child', // 2048
        'Albino Werewolf', // 4096 
        'Wolf Dog', // 8192
    ];
    
    private users: Map<string, user>; // string is Socket ID
    private rolesAvailable: string[];
    private progress: boolean;

    constructor() {
        this.users = new Map<string, user>();
        this.rolesAvailable = [];
        this.progress = false;
    }

    public howManyMembers = () => this.users.size;

    public initRoom(w: number, v: number, r: number) {
        for (let i = 0; i < w; i++) this.rolesAvailable.push("Werewolf");
        for (let i = 0; i < v; i++) this.rolesAvailable.push("Villager");
        for (let i = 1; i < 7; i++) if (((r >> i) % 2) === 1)
            this.rolesAvailable.push(this.roles[i]);

        this.rolesAvailable = _.shuffle(this.rolesAvailable);
        this.progress = true;
    }

    public abortGame() {
        this.rolesAvailable = [];
        this.users = new Map<string, user>();
        this.progress = false;
    }

    private getMemberByNick = (nick: string) => {
        this.users.forEach(key => {
            if (key.nick === nick) return key;
        });
        return undefined;
    }

    public setMemberNick = (id: string, nick: string) => this.users.set(id, {
        nick: nick, 
        role: this.users.get(id)?.role ?? 'Viewer' 
    });

    public getMemberRole = (id: string) => this.users.get(id)?.role;

    public setMemberRole = (id: string) => this.users.set(id, {
        nick: this.users.get(id)?.nick ?? 'villager' + new Date().getTime().toString(),
        role: this.rolesAvailable.pop() ?? 'Viewer'
    });

    public setGameMaster = (id: string) => this.users.set(id, {
        nick: this.users.get(id)?.nick ?? 'villager' + new Date().getTime().toString(),
        role: 'Game Master' 
    });

    public getMembers = (): object => {
        let json: {[index: string]: string} = {};
        this.users.forEach((key) => {  
            json[key.nick] = key.role
        });
        return json;
    }

    public changeGameMaster = (id: string, nick: string) => {
        let newgm: string | undefined = this.getMemberByNick(nick);
        if (!this.progress && newgm != undefined) {
            this.setMemberRole(id);
            this.setGameMaster(newgm);
        }
    }

    public isGameMaster = (id: string): boolean =>
        this.users.get(id)?.role == 'Game Master';

    public getProgress = (): boolean => this.progress;
}