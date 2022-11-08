import mongoose from "mongoose";
import charData from "../gameData/characters/charData.js";

const userSchema = mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: false },
    password: { type: String, required: true },
    id: { type: String },
    rank: { type: Number, default: 1000 },

    // character data
    charStats: { type: Map, of: [Number], default: {} }, // wins, losses, ties, rankWins, rankLosses, rankTies
})

const UserModel = mongoose.model('SpellbookUser', userSchema);
export default UserModel;

const recordGame = ({ username, charName, isRanked, isTie, isWin }) => {
    // if user is guest, return
    if (username.toLowerCase().startsWith("guest")) return;
    // first make sure charName exists in charData
    const char = charData.data.find(char => char.name === charName);
    if (!char) {
        console.log('char not found for recording game', charName);
    }
    // then make sure user exists
    UserModel.findOne({ username: username }, (err, user) => {
        if (err) {
            console.log('error finding user for recording game', err);
        }
        if (!user) {
            console.log('user not found for recording game', username);
        }
        // grab stats for charName, create if not found
        let stats = user.charStats.get(charName);
        if (!stats) {
            stats = [0, 0, 0, 0, 0, 0];
        }
        if (isRanked) {
            if (isTie) {
                stats[5] += 1;
            } else if (isWin) {
                stats[3] += 1;
                user.rank += 10;
            } else {
                stats[4] += 1;
                user.rank -= 10;
            }
        } else {
            if (isTie) {
                stats[2] += 1;
            } else if (isWin) {
                stats[0] += 1;
            } else {
                stats[1] += 1;
            }
        }
        user.charStats.set(charName, stats);
        user.save();
    })
}

export const recordWin = ({ username, charName, isRanked }) => {
    return recordGame({ username, charName, isRanked, isTie: false, isWin: true });
}
export const recordLoss = ({ username, charName, isRanked }) => {
    return recordGame({ username, charName, isRanked, isTie: false, isWin: false });
}
export const recordTie = ({ username, charName, isRanked }) => {
    return recordGame({ username, charName, isRanked, isTie: true, isWin: false });
}