import { v4 as uuid } from 'uuid';
import Room from '../management/Room.js';
import charData from '../gameData/characters/charData.js';
import Player from './Player.js';
import allMovesDict from '../gameData/moves/allMovesDict.js';
import CastLogic from './CastLogic.js';
import Update from './Update.js';
import mechanics from '../gameData/mechanics.js';
import { recordWin, recordLoss, recordTie } from '../models/user.js';
import Bots from './Bots.js';

const serverName = '(server)';

class Game {
    constructor({ rooms, io, games, ranked = false, friendly = null }) {
        this.p1 = null;
        this.p2 = null;
        this.gameTimer = null;
        this.curTs = null;
        this.startTs = null;
        this.id = uuid();
        this.metadata = {
            ranked, // true/false for live player, 0-2 for bot difficulty
            friendly, // username of friendly opponent
        }
        this.updateNum = 0;
        this.updates = [];
        this.room = new Room(this.id, io, this);
        this.rooms = rooms;
        rooms[this.id] = this.room;
        this.lobbies = {};
        this.games = games;
        this.playersConnected = {};

        this.io = io;

        //countdown
        this.countdown = 3;
        this.steps = 0;
        this.forfeit = null;
        this.declined = null;
        this.gameIsOver = false;

        //bots
        this.p1bot = null;
        this.p2bot = null;
        this.botProgress = {};

        //userdata
        this.p1UserData = null;
        this.p2UserData = null;
    }
    removeFromLobbies = () => {
        Object.values(this.lobbies).forEach(lobby => {
            lobby.removeGameRoom(this);
        });
        if (this.p1UserData)
            this.p1UserData.gameRooms = this.p1UserData.gameRooms.filter(room => room.id !== this.id);
        if (this.p2UserData)
            this.p2UserData.gameRooms = this.p2UserData.gameRooms.filter(room => room.id !== this.id);
        if (this.games[this.id]) {
            delete this.games[this.id];
        }
    }
    addToLobbies = (userData) => {
        // when a user in the lobby joins a game, add the game to any lobby that they are in for viewing
        userData.rooms.forEach(roomName => {
            const room = this.rooms[roomName];
            if (room && room.game === null && !room.gameRooms.find(game => game.id === this.id)) {
                console.log('adding to lobby', roomName, userData.username);
                room.addGameRoom(this);
            }
        })
        // todo: broadcast game to lobby
    }
    isOpen = () => {
        return (this.p1 === null || this.p2 === null) && !this.isBroken();
    }
    isRanked = () => {
        return this.metadata.ranked;
    }
    isPlayer = (username) => {
        if (this.gameIsOver)
            return false;
        return this.p1?.username === username || this.p2?.username === username;
    }
    getOpponent = (username) => {
        if (this.p1?.username === username) {
            return this.p2;
        } else if (this.p2?.username === username) {
            return this.p1;
        }
        return null;
    }
    setForfeit = (username) => {
        if (this.gameIsOver || this.forfeit)
            return;
        this.forfeit = username;
        this.checkGameOver();
    }
    setDecline = (username) => {
        this.declined = username;
        this.checkGameOver();
    }
    playersReady = () => {
        return this.p1?.ready && this.p2?.ready;
    }
    readyUp = (username) => {
        if (this.p1?.username === username) {
            this.p1.ready = true;
            this.p1.disconnectTime = null;
        } else if (this.p2?.username === username) {
            this.p2.ready = true;
            this.p2.disconnectTime = null;
        } else {
            return;
        }
        if (this.playersReady()) {
            if (this.started()) {
                this.reconnected(username);
            } else {
                this.start();
            }
        }
        return this.playersReady();
    }
    reconnected = (username) => {
        this.room.sendMessage({ username: serverName, msg: `${username} reconnected` });
    }
    addPlayer = (userData, playerData) => {
        const { char } = playerData;
        const charInfo = charData.data.find(c => c.name === char);
        if (!charInfo) {
            console.log('character not found', playerData);
            return;
        }
        const gameData = new Player({ username: userData.username, ...charInfo });
        if (this.p1 === null) {
            this.p1 = gameData;
            this.p1UserData = userData;
            userData.gameRooms.push(this);
        } else if (this.p2 === null) {
            this.p2 = gameData;
            this.p2UserData = userData;
            userData.gameRooms.push(this);
        } else {
            throw new Error('Game is full');
        }
        this.addToLobbies(userData);
        // this.room.addUser({ username });
    }
    addCpuPlayer = (cpuDifficulty, char) => {
        const charInfo = charData.data.find(c => c.name === char);
        const gameData = new Player({ username: 'CPU', isCpu: true, cpuDifficulty, ...charInfo });
        if (cpuDifficulty === 0) {
            gameData.stats.health = 500;
            gameData.stats.maxHealth = 500;
        }
        gameData.ready = true;
        if (this.p1 === null) {
            this.p1 = gameData;
            this.p1bot = Bots[cpuDifficulty];
        } else if (this.p2 === null) {
            this.p2 = gameData;
            this.p2bot = Bots[cpuDifficulty];
        } else {
            throw new Error('Game is full');
        }
    }
    started = () => {
        return this.curTs !== null;
    }
    start = () => {
        // update name of game in lobbies by calling addGameRoom again
        Object.values(this.lobbies).forEach(lobby => lobby.addGameRoom(this));

        this.curTs = Date.now();
        this.startTs = this.curTs;
        this.gameTimer = setInterval(() => {
            this.step();
        }, 1000 / 60);
        this.room.sendMessage({ username: serverName, msg: 'Game starting in...' });
    }
    addAction = (username, action) => {
        // todo: add action data
        const { command, moveName } = action;
        const fromP1 = this.p1.username === username;
        const player = fromP1 ? this.p1 : this.p2;
        const enemy = fromP1 ? this.p2 : this.p1;
        if (player.username !== username) {
            console.log('player not found', username);
            return;
        }
        const move = allMovesDict[moveName];
        if (!move) {
            console.log('move not found', command, moveName);
            return;
        }
        player.communicateTime = Date.now();

        // process the move
        // get the onCast effects
        const castInfo = CastLogic.castMove(player, enemy, move);
        const { res, effects, actionTime, castTime } = castInfo;
        if (!res) {
            console.log('move failed', command, moveName, castInfo);
            return;
        }
        const onCastUpdate = new Update({ effects, ts: actionTime, fromP1 });
        // in the future, move.effects may be updated with player modifiers
        const onResolveUpdate = new Update({ effects: move.effects, ts: actionTime + castTime, fromP1 });
        this.queueUpdate(onCastUpdate);
        this.queueUpdate(onResolveUpdate);
        this.sendUpdates();
        const notifData = { actionTime, castTime, username, moveName: move.fullName }
        if (command === 'cast') {
            if (move.type === mechanics.effectType.physicalDamage) {
                this.room.sendGameNotif({ action: 'uses', ...notifData });
            } else {
                this.room.sendGameNotif({ action: 'casts', ...notifData });
            }
        } else if (command === 'equip') {
            this.room.sendGameNotif({ action: 'equips', ...notifData });
        } else {
            this.room.sendGameNotif({ action: 'uses', ...notifData });
        }
    }
    sendUpdates = () => {
        this.room.sendGameUpdate(this.public())
    }

    queueUpdate(update) {
        const updatesBefore = this.updates.filter(u => u.ts < update.ts).length;
        if (updatesBefore === 0) {
            update.applyUpdate(this);
        } else {
            update.applyUpdate(this.updates[updatesBefore - 1]);
        }
        this.updates.splice(updatesBefore, 0, update);

        // recompute updates after this one
        for (let i = updatesBefore + 1; i < this.updates.length; i++) {
            this.updates[i].applyUpdate(this.updates[i - 1]);
        }
    }
    step = (io) => {
        if (this.gameIsOver) {
            return;
        }
        // todo: add cpu actions

        const events = [];
        const newTs = Date.now();

        //countdown
        if (this.countdown > -1) {
            if (newTs - this.startTs > 1000 * (4 - this.countdown)) {
                this.room.sendMessage({ username: serverName, msg: this.countdown > 0 ? this.countdown : 'Fight!' });
                this.countdown--;
                this.sendUpdates();
            }
        }
        this.steps += 1;
        if (this.p2.username === 'CPU') {
            this.p2bot(this, this.p2);
        }
        // process all updates with ts <= newTs
        while (this.updates.length > 0 && this.updates[0].ts <= newTs) {
            // console.log('processing update', newTs, this.updates[0].effects[0].type, this.p1.stats.gold);
            const update = this.updates.shift();
            const actionEvents = update.fromP1 ? CastLogic.resolveEffects(this.p1, this.p2, update.effects) : CastLogic.resolveEffects(this.p2, this.p1, update.effects);
            this.updateNum++;
            const notifData = { username: update.fromP1 ? this.p1.username : this.p2.username }
            const targetName = update.fromP1 ? this.p2.username : this.p1.username;
            // iterate over action events
            for (let i = 0; i < actionEvents.length; i++) {
                const event = actionEvents[i];
                switch (event.type) {
                    case mechanics.effectType.physicalDamage:
                        this.room.sendGameNotif({ target: targetName, ...notifData, ...event });
                        break;
                    case mechanics.effectType.magicalDamage:
                        this.room.sendGameNotif({ target: targetName, ...notifData, ...event });
                        break;
                    case mechanics.effectType.recoil:
                        this.room.sendGameNotif({ ...notifData, type: event.type, recoilDamage: event.recoilDamage });
                        break;
                    case 'statChange':
                        this.room.sendGameNotif({ username: event.username, type: event.type, stat: event.stat, prev: event.prev, post: event.post });
                        break;
                    case 'gainPassive':
                        this.room.sendGameNotif({ type: event.type, ...notifData, passive: event.passive });
                        break;
                    case 'opponentPassive':
                        this.room.sendGameNotif({ type: 'gainPassive', username: targetName, passive: event.passive });
                        break;
                    case mechanics.effectType.gainStatus:
                        this.room.sendGameNotif({ ...notifData, ...event });
                        break;
                    case mechanics.effectType.shield:
                        this.room.sendGameNotif({ ...notifData, ...event });
                        break;
                    case mechanics.effectType.stealGold:
                        this.room.sendGameNotif({ type: event.type, ...notifData, target: targetName, goldStolen: event.stealAmount });
                        break;
                    case mechanics.effectType.heal:
                        this.room.sendGameNotif({ type: event.type, ...notifData, healAmount: event.healAmount });
                        break;
                    case mechanics.effectType.restoreMana:
                        this.room.sendGameNotif({ type: event.type, ...notifData, manaAmount: event.manaAmount });
                        break;
                    case mechanics.effectType.burnMana:
                        this.room.sendGameNotif({ type: event.type, ...notifData, target: targetName, burnAmount: event.burnAmount });
                        break;
                    case mechanics.effectType.dropShield:
                        this.room.sendGameNotif({ type: event.type, ...notifData });
                        break;
                    default:
                        break;
                }
                this.checkGameOver();
            }
            this.checkGameOver();
        }

        events.forEach(event => {
            this.room.sendGameNotif(event);
        })

        this.curTs = newTs;
    }
    gameOver = ({ winnerUsername, description }) => {
        if (this.gameIsOver) {
            return;
        }
        this.removeFromLobbies();
        let tie = false;
        let message;
        if (winnerUsername === null) {
            tie = true;
            message = 'Game over! It\'s a tie! ' + description;
        } else {
            message = `${winnerUsername.toUpperCase()} wins! ${description}`;
        }
        this.gameIsOver = true;
        this.room.sendMessage({ username: serverName, msg: message });
        this.room.sendGameNotif({ type: 'gameOver', winnerUsername, tie, description });
        clearInterval(this.gameTimer);
        this.sendUpdates();
        if (this.declined)
            return;
        if (!this.p1.isCpu) {
            const p1Record = { username: this.p1.username, charName: this.p1.name, isRanked: this.isRanked() }
            if (tie) {
                recordTie(p1Record);
            } else if (winnerUsername === this.p1.username) {
                recordWin(p1Record);
            } else {
                recordLoss(p1Record);
            }
        }
        if (!this.p2.isCpu) {
            const p2Record = { username: this.p2.username, charName: this.p2.name, isRanked: this.isRanked() }
            if (tie) {
                recordTie(p2Record);
            } else if (winnerUsername === this.p2.username) {
                recordWin(p2Record);
            } else {
                recordLoss(p2Record);
            }
        }
    }
    checkGameOver = () => {
        if (this.gameIsOver)
            return;
        // if one player is dead, other player wins
        // if both players are dead, it is a tie
        // if game has lasted for 5 minutes, it is a tie
        if (this.declined) {
            this.gameOver({ winnerUsername: null, description: `${this.declined.toUpperCase()} declined the match.` });
        } else if (this.forfeit === this.p1.username) {
            this.gameOver({ winnerUsername: this.p2.username, description: `${this.p1.username.toUpperCase()} forfeits!` });
        } else if (this.forfeit === this.p2.username) {
            this.gameOver({ winnerUsername: this.p1.username, description: `${this.p2.username.toUpperCase()} forfeits!` });
        } else if (this.p1.stats.health <= 0) {
            if (this.p2.stats.health <= 0) {
                this.gameOver({ winnerUsername: null, description: 'Tie. Both players died.' });
            } else {
                this.gameOver({ winnerUsername: this.p2.username, description: `${this.p1.username.toUpperCase()} died.` });
            }
        } else if (this.p2.stats.health <= 0) {
            this.gameOver({ winnerUsername: this.p1.username, description: `${this.p2.username.toUpperCase()} died.` });
        } else if (Date.now() - this.startTs > 1000 * 60 * 5) {
            console.log('game lasted 5 minutes');
            this.gameOver({ winnerUsername: null, description: 'Tie. Both players stayed alive for 5 minutes.' });
        }
    }
    disconnectPlayer = (username) => {
        console.log('disconnecting player', username);
        if (this.p1?.username === username) {
            this.p1.ready = false;
            this.p1.disconnectTime = Date.now();
            this.room.sendMessage({ username: serverName, msg: `Player 1 (${username}) has disconnected` });
        } else if (this.p2?.username === username) {
            this.p2.ready = false;
            this.p2.disconnectTime = Date.now();
            this.room.sendMessage({ username: serverName, msg: `Player 2 (${username}) has disconnected` });
        }
    }
    isBroken = () => {
        if (this.p1 === null && this.p2 === null) {
            return false;
        }
        // if all joined players have disconnected, game is broken
        const p1Broken = this.p1 && this.p1.disconnectTime;
        const p2Broken = this.p2 && this.p2.disconnectTime;
        if (p1Broken && p2Broken) {
            this.removeFromLobbies();
        }
        return p1Broken && p2Broken;
    }
    getName = () => {
        if (this.metadata.friendly) {
            return `${this.p1?.username || '(waiting)'} vs ${this.p2?.username || '(waiting)'}`
        }
        return `${this.p1?.username || '(searching)'} vs ${this.p2?.username || '(searching)'}`
    }
    getMatchType = () => {
        if (this.metadata.friendly)
            return 'friendly';
        if (this.metadata.ranked)
            return 'ranked';
        return 'casual';
    }
    public = () => {
        return {
            id: this.id,
            p1: this.p1,
            p2: this.p2,
            ts: this.curTs,
            name: this.getName(),
            matchType: this.getMatchType(),
            updateNum: this.updateNum,
            updates: this.updates,
            gameInProgress: this.started() && !this.gameIsOver,
            gameIsOver: this.gameIsOver,
            startTs: this.startTs,
        }
    }
    publicSmall = () => {
        return {
            id: this.id,
            p1: this.p1,
            p2: this.p2,
            name: this.getName(),
            matchType: this.getMatchType(),
            gameInProgress: this.started() && !this.gameIsOver,
            gameIsOver: this.gameIsOver,
            startTs: this.startTs,
        }
    }
}

export default Game;
