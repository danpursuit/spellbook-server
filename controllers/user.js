import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user.js';
import charData from "../gameData/characters/charData.js";

dotenv.config();

export const signin = async (req, res) => {
    try {
        console.log('signin', req.body);
        let { username, password } = req.body;
        username = username.toLowerCase().replace(/[^a-zA-Z0-9$-_]+/gi, '').slice(0, 16);
        if (username.startsWith('guest') || username.startsWith('cpu')) {
            return res.status(400).json({ message: 'Invalid username' });
        }


        const existingUser = await User.findOne({ username });

        console.log('signin', existingUser);
        if (!existingUser) {
            const hashedPassword = await bcrypt.hash('', 12); // empty password
            const result = await User.create({ username, password: hashedPassword });
            const token = jwt.sign({ username, id: result._id }, process.env.LOGIN_KEY, { expiresIn: '14d' });
            return res.status(200).json({ result, token, guest: true });
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            if (password === '')
                return res.status(400).json({ message: 'Username exists with password.' });
            else
                return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign({ username: existingUser.username, id: existingUser._id }, process.env.LOGIN_KEY, { expiresIn: '14d' });
        return res.status(200).json({ result: existingUser, token, guest: password === '' });
    } catch (error) {
        console.log('error?', error);
        res.status(500).json({ message: error.message });
    }
}

export const changePassword = async (req, res) => {
    try {
        console.log('changePassword', req.body);
        let { username, oldPassword, newPassword, confirmPassword } = req.body;
        username = username.toLowerCase().replace(/[^a-zA-Z0-9$-_]+/gi, '').slice(0, 16);
        const existingUser = await User.findOne({ username });
        console.log('changePassword', existingUser);
        if (!existingUser) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const isPasswordCorrect = await bcrypt.compare(oldPassword, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        const result = await User.findByIdAndUpdate(existingUser._id, { password: hashedPassword }, { new: true });
        const token = jwt.sign({ username, id: result._id }, process.env.LOGIN_KEY, { expiresIn: '14d' });
        return res.status(200).json({ result, token, guest: false });
    } catch (error) {
        console.log('error?', error);
        res.status(500).json({ message: error.message });
    }
}

export const getRanking = async (req, res) => {
    const ranking = {
        username: null,
        rank: null,
        characters: {}
    }
    try {
        ranking.username = req.body.username;
        const existingUser = await User.findOne({ username: ranking.username });
        ranking.rank = existingUser.rank;
        charData.data.forEach(char => {
            const charStats = existingUser.charStats.get(char.name);
            if (!charStats) {
                ranking.characters[char.name] = {
                    rankWins: 0,
                    casualWins: 0,
                }
            } else {
                ranking.characters[char.name] = {
                    rankWins: charStats[3],
                    casualWins: charStats[0],
                }
            }
        });
        return res.status(200).json({ ranking });
    } catch (error) {
        console.log('error?', error);
        res.status(500).json({ message: error.message });
    }
}