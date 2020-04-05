import * as _ from 'lodash';

type userid = string;
type userrole = string;
type usermap = Map<userrole, userid>;

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
    private users: usermap;
    private rolesAvailable: string[];

    constructor(roles: number) {
        this.users = new Map<userrole, userid>();
        this.rolesAvailable = [];
    }

    public howManyUsers = () => this.users.size;

    public initRoom(w: number, v: number, r: number) {
        for (let i = 0; i < w; i++) this.rolesAvailable.push("Werewolf");
        for (let i = 0; i < v; i++) this.rolesAvailable.push("Villager");
        for (let i = 1; i < 7; i++) if (((r >> i) % 2) === 1)
            this.rolesAvailable.push(this.roles[i]);

        this.rolesAvailable = _.shuffle(this.rolesAvailable);
    }

    public abortGame() {
        this.rolesAvailable = [];
        this.users = new Map<userrole, userid>();
    }

    public getMemberId = (role: string) => this.users.get(role);

    public setMember = ()
}