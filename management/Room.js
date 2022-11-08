class Room {
    constructor(roomName, io, game = null) {
        this.roomName = roomName;
        this.usernames = new Set();
        this.messages = [];
        this.totalMessages = 0;
        this.game = game;
        this.io = io;
        this.gameRooms = [];
    }
    addUser = (userData) => {
        this.usernames.add(userData.username);
        this.io.to(this.roomName).emit('userJoined', { roomName: this.roomName, userData: userData.publicUserData() });
        if (!userData.rooms.includes(this.roomName))
            userData.rooms.push(this.roomName);
        // loop through games that user is in and add them to the room
        for (let game of userData.gameRooms) {
            this.addGameRoom(game);
        }
    }
    removeUser = ({ username }) => {
        this.usernames.delete(username);
        this.io.to(this.roomName).emit('userLeft', { roomName: this.roomName, username });
        if (this.game) {
            this.game.disconnectPlayer(username);
        } else {
            // loop through gamerooms and if player is in game and opponent is not in room, remove game
            this.gameRooms.filter(gameRoom => {
                return (gameRoom.isPlayer(username) && !this.usernames.has(gameRoom.getOpponent(username).username));
            }).forEach(gameRoom => this.removeGameRoom(gameRoom));
        }
    }
    manualRemoveUser = ({ username }) => {
        // the user is choosing to leave room, which means they will forfeit games
        this.usernames.delete(username);
        this.io.to(this.roomName).emit('userLeft', { roomName: this.roomName, username });
        if (this.game) {
            this.game.disconnectPlayer(username);
            if (!this.game.gameIsOver) {
                if (this.game.isPlayer(username) && this.game.started()) {
                    this.game.setForfeit(username);
                }
            }
        } else {
            // loop through gamerooms and if player is in game and opponent is not in room, remove game
            this.gameRooms.filter(gameRoom => {
                return (gameRoom.isPlayer(username) && !this.usernames.has(gameRoom.getOpponent(username).username));
            }).forEach(gameRoom => this.removeGameRoom(gameRoom));
        }
    }
    // creates a new message, as a test (preload messages into room)
    addMessage = ({ username, msg }) => {
        this.messages.push({ id: this.totalMessages + 1, username, msg });
        this.totalMessages++;
    }
    // create a new message and sends it
    sendMessage = (messageData) => {
        // {username, msg, actionTime, castTime}
        const newMessage = { id: this.totalMessages + 1, roomName: this.roomName, ...messageData };
        this.messages.push(newMessage);
        this.totalMessages++;
        this.io.to(this.roomName).emit('newRoomMessage', newMessage);
    }
    sendGameUpdate = (update) => {
        this.io.to(this.roomName).emit('gameUpdate', { update, roomName: this.roomName });
    }
    sendGameNotif = (notif) => {
        this.io.to(this.roomName).emit('gameNotif', { notif, roomName: this.roomName });
    }
    addGameRoom = (game) => {
        // for lobbies, broadcast that a game for spectating is available
        if (!this.gameRooms.find(room => room.id === game.id))
            this.gameRooms.push(game);
        this.io.to(this.roomName).emit('newRoomGame', { roomName: this.roomName, game: game.publicSmall() });
        game.lobbies[this.roomName] = this;
    }
    removeGameRoom = (game) => {
        this.gameRooms = this.gameRooms.filter(room => room.id !== game.id);
        this.io.to(this.roomName).emit('removeRoomGame', { roomName: this.roomName, gameId: game.id });
        game.lobbies[this.roomName] = null;
    }
}

export default Room;