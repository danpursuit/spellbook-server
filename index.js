import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';

import userRoutes from './routes/user.js';
import viewRoutes from './routes/views.js';
import Names from './constants/names.js';
import ViewCount from './models/viewCount.js';
import UserModel from './models/user.js';
import { randomColor } from './colors.js';
import Game from "./battle/Game.js";
import Room from "./management/Room.js";

dotenv.config();

const app = express();
app.use(express.static('public'))
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use('/api/user', userRoutes);
app.use('/api/views', viewRoutes);

const PORT = process.env.PORT || 5002;
mongoose.connect(process.env.DB_URL)
    .then(async () => {
        const views = await ViewCount.findOne({ name: Names.view });
        if (views === null) {
            console.log('no view table, creating!');
            const newViews = await ViewCount.create({ name: Names.view, count: 0 });
            console.log('Created views', newViews);
        } else {
            console.log('Found view table', views);
        }
    })
    .catch((e) => console.log('mongoose error', e))


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: `http://localhost:3000`,
        methods: ["GET", "POST"]
    }
});

class User {
    constructor(username, client = null) {
        this.username = username;
        this.rooms = [];
        this.ts = Date.now();
        this.color = randomColor();
        this.client = client;
        this.gameRooms = [];
    }
    inGame = () => {
        return this.rooms.some(room => room.includes('-'));
    }
    publicUserData = () => {
        return {
            username: this.username,
            rooms: this.rooms,
            color: this.color,
            ts: this.ts,
        }
    }
}
const users = []
const rooms = {};
rooms['Lobby'] = new Room('Lobby', io);
const games = {};

const leaveAllRooms = (userData) => {
    userData.rooms.forEach(roomName => {
        rooms[roomName].removeUser(userData);
    })
}
const publicUserData = ({ username, rooms, ts, color }) => {
    return { username, rooms, ts, color }
}
io.on('connection', client => {
    const userData = new User(`guest_${Math.floor(Math.random() * 100000)}`, client);
    userData.guestName = userData.username;
    users.push(userData);
    console.log('client with id', client.id, 'connected!');
    client.emit('init', 'hello from server');
    const clientJoinRoom = (roomName) => {
        if (rooms[roomName]) {
            const room = rooms[roomName];
            room.addUser(userData);
            client.join(roomName);
            const roomUsers = users.filter(({ username }) => room.usernames.has(username))
            client.emit('roomData', {
                roomName,
                users: roomUsers.map(user => publicUserData(user)),
                messages: room.messages,
                games: room.gameRooms.map(game => game.publicSmall()),
            });
            // if this room belongs to a game:
            if (room.game) {
                // add user to game
                // if both players are in the game, start the game
                if (room.game.isPlayer(userData.username)) {
                    room.game.readyUp(userData.username);
                }
            } else {
                // this is a lobby. take all games the user is in and add to lobby
                const userGames = Object.values(games).filter(game => game.isPlayer(userData.username));
                userGames.forEach(game => {
                    game.addToLobbies(userData)
                })
            }
        }
    };
    client.on('joinRoom', clientJoinRoom)
    client.on('spectateGame', (gameId) => {
        const game = games[gameId];
        if (game) {
            client.emit('gameFound', game.public());
            clientJoinRoom(gameId);
        }
    })
    client.on('leaveRoom', (roomName) => {
        if (rooms[roomName]) {
            const room = rooms[roomName];
            const idx = userData.rooms.indexOf(roomName);
            if (idx !== -1) {
                userData.rooms.splice(idx, 1);
            }
            room.manualRemoveUser(userData);
            client.leave(roomName);
            if (room.game && rooms[roomName].usernames.size === 0) {
                delete rooms[roomName];
            }
        }
    })
    client.on('verifyUser', async (username, token) => {
        const existingUser = await UserModel.findOne({ username });
        if (!existingUser) {
            client.emit('fail', 'User does not exist');
        } else {
            jwt.verify(token, process.env.LOGIN_KEY, (err, verifiedJwt) => {
                if (err) {
                    client.emit('fail', 'Bad token');
                } else {
                    console.log('verify guest to user, leaving rooms');
                    if (userData.guestName === userData.username) {
                        leaveAllRooms(userData);
                    }
                    userData.username = username;
                    userData.rooms.forEach(roomName => {
                        console.log('joining', roomName, userData.username, userData.rooms);
                        rooms[roomName].addUser(userData);
                    })
                    // check for all games that user is in
                    const openGames = Object.values(games).filter(game => game.isPlayer(username) && !game.isBroken()).map(game => game.public());
                    if (openGames.length > 0) {
                        client.emit('openGames', openGames);
                    }
                }
            })
        }
    })
    client.on('disconnect', () => {
        leaveAllRooms(userData);
        users.splice(users.indexOf(userData), 1);
    })
    client.on('sendRoomMessage', (roomName, message) => {
        if (!rooms[roomName]) {
            client.emit('fail', `Room ${roomName} does not exist`);
            return;
        }
        rooms[roomName].sendMessage({ username: userData.username, msg: message });
    })
    client.on('logout', () => {
        console.log('logout, leaving rooms');
        leaveAllRooms(userData);
        userData.username = userData.guestName
        userData.rooms.forEach(roomName => {
            if (rooms[roomName] && !rooms[roomName].game) {
                rooms[roomName].addUser(userData);
            }
        })
    })

    //game stuff
    client.on('challengePlayerToFriendly', (playerData, opponent) => {
        if (userData.inGame()) {
            client.emit('friendlyChallengeFail', 'You are already in a game');
            return;
        } else if (opponent === userData.username) {
            client.emit('friendlyChallengeFail', 'You cannot challenge yourself!');
            return;
        }
        // check that opponent is a real player and not in a game
        const opponentData = users.find(user => user.username === opponent);
        if (opponentData && opponentData.client) {
            if (opponentData.inGame()) {
                client.emit('friendlyChallengeFail', `${opponent.toUpperCase()} is already in a game`);
            } else {
                const game = new Game({ rooms, io, ranked: false, friendly: opponent, games });
                game.addPlayer(userData, playerData);
                games[game.id] = game;
                client.emit('gameFound', game.public());
                opponentData.client.emit('friendlyChallengeRcv', userData.username);
            }
        } else {
            client.emit('friendlyChallengeFail', 'Opponent does not exist');
        }
    })
    client.on('acceptChallenge', (playerData, opponent) => {
        const game = Object.values(games).find(game => game.isPlayer(opponent) && game.metadata.friendly === userData.username);
        if (game) {
            game.addPlayer(userData, playerData);
            client.emit('gameFound', game.public());
            // broadcast to all players in game that game is ready to start
            game.sendUpdates();
        } else {
            client.emit('friendlyChallengeFail', 'Game does not exist');
        }
    })
    client.on('declineChallenge', (opponent) => {
        const game = Object.values(games).find(game => game.isPlayer(opponent) && game.metadata.friendly === userData.username);
        if (game) {
            game.setDecline(userData.username);
        }
    })
    client.on('findGame', (vsCpu, ranked, playerData) => {
        if (userData.username === userData.guestName) {
            client.emit('fail', 'You must be logged in to play');
            return;
        }
        // if vs CPU, create game and add user to it
        if (vsCpu) {
            const game = new Game({ rooms, io, games });
            game.addPlayer(userData, playerData);
            // todo: add cpu player
            if (ranked == 0 || ranked == 2) {
                game.addCpuPlayer(ranked, 'threle');
            } else {
                game.addCpuPlayer(ranked, 'chaze');
            }
            games[game.id] = game;
            client.emit('gameFound', game.public());
        } else {
            // find game that matches criteria
            let gameFound = false;
            for (const [gameId, game] of Object.entries(games)) {
                if (game.isOpen() && game.isRanked() === ranked > 0 && !game.isPlayer(userData.username)) {
                    game.addPlayer(userData, playerData);
                    client.emit('gameFound', game.public());
                    // broadcast to all players in game that game is ready to start
                    game.sendUpdates();
                    gameFound = true;
                    break;
                }
            }
            if (gameFound)
                return;
            // if no game found, create new game
            const game = new Game({ rooms, io, games, ranked: ranked > 0 });
            game.addPlayer(userData, playerData);
            games[game.id] = game;
            client.emit('gameFound', game.public());
        }
    })
    client.on('gameAction', (gameId, action) => {
        if (!games[gameId] || !games[gameId].isPlayer(userData.username)) {
            client.emit('fail', 'Game does not exist');
            return;
        }
        const game = games[gameId];
        game.addAction(userData.username, action);
    })


})
server.listen(PORT, () => console.log('socket server running on port PORT'));

