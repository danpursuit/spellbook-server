
import allMovesDict from '../gameData/moves/allMovesDict.js';
import mechanics from '../gameData/mechanics.js';
import CastLogic from './CastLogic.js';

// Bot Configurations
// All bots have an ordered list of moves, and each move has conditions that must be met. 
// While bot is free, they will iterate through the list of moves and cast the first move that meets the conditions.

const tutorialMoves = [{
    command: 'cast',
    moveName: 'prayerShield',
    shouldCast: (game, player) => {
        return (player.stats.health <= 0.9 * player.stats.maxHealth)
            && (player.stats.divinity < 100 || player.stats.shieldHealth != player.stats.shieldMaxHealth)
            && (Date.now() - player.communicateTime > 4500)
    }
}, {
    command: 'equip',
    moveName: 'dagger',
    shouldCast: (game, player) => {
        return (player.stats.health <= 0.3 * player.stats.maxHealth) && player.equipment.weapon === null
    }
}, {
    command: 'cast',
    moveName: 'slash',
    shouldCast: (game, player) => {
        return (player.stats.health <= 0.3 * player.stats.maxHealth) && player.equipment.weapon !== null
            && (Date.now() - player.communicateTime > 1800)
    }
}]
const tutorialBot = (game, player) => {
    const botName = 'Tutorial Bot';
    if (game.countdown > -1) return;
    // iterate over tutorial moves
    if (!game.botProgress['init']) {
        game.botProgress['init'] = true;
        game.room.sendMessage({ username: botName, msg: 'Welcome to the tutorial!' });
        setTimeout(() => {
            game.room.sendMessage({ username: botName, msg: 'Use the keyboard and arrow keys to navigate the command input to perform actions. Press ENTER to select an action, or numbers 1-9 to quick cast.' });
        }, 0.5 * 1000);
        const msgSuggest = game.p1.name === 'chaze' ? 'I suggest you equip a sword or dagger first, then try using Flame Slash!' : 'I suggest you cast Prayer - Shield first to raise your divinity, then Dissipating your shield and using Prayer - Blast!';
        setTimeout(() => {
            game.room.sendMessage({ username: botName, msg: `I see that you are ${game.p1.name.toUpperCase()}. ` + msgSuggest });
        }, 1 * 1000);
    }
    if (Date.now() - player.communicateTime < 100) return;
    if (Date.now() - (player.actionTime + player.castTime) < 100) return;
    for (let i = 0; i < tutorialMoves.length; i++) {
        const { command, moveName, shouldCast } = tutorialMoves[i];
        const move = allMovesDict[moveName];
        if (shouldCast(game, player) && CastLogic.playerCanCast(player, move).res) {
            if (moveName === 'prayerShield' && !game.botProgress[moveName]) {
                game.botProgress[moveName] = true;
                game.room.sendMessage({ username: botName, msg: `Wow, you hit hard! I'm going to build my shield now. If you can get through this then you're a fine warrior indeed.` });
                const msgShield = game.p1.name === 'chaze' ? 'I suggest you equip the Blacksmiths Gloves and cast Crimson Splinters. It\'s great against shields!' : 'I suggest you raise your divinity to at least 30 before trying to break my shield. If you need more mana, you can equip a Gold Pendant!';
                // send message in 3 seconds
                setTimeout(() => {
                    game.room.sendMessage({ username: botName, msg: msgShield });
                }, 3 * 1000);
            } else if (moveName === 'dagger' && !game.botProgress[moveName]) {
                game.botProgress[moveName] = true;
                game.room.sendMessage({ username: botName, msg: `You're getting through my shield! I'm going to equip a dagger now. I hope you're ready for a fight!` });
                setTimeout(() => {
                    game.room.sendMessage({ username: botName, msg: 'Can\'t make this too easy after all...' });
                }, 2 * 1000);
            }
            game.addAction(player.username, { command, moveName })
            return;
        }
    }
}

const level1Moves = [{
    command: 'equip',
    moveName: 'sword',
    shouldCast: (game, player) => {
        return player.equipment.weapon === null && player.action !== 'sword'
    }
}, {
    command: 'equip',
    moveName: 'blacksmiths',
    shouldCast: (game, player) => {
        return player.equipment.gloves === null && player.action !== 'blacksmiths'
    }
}, {
    command: 'equip',
    moveName: 'steelChestplate',
    shouldCast: (game, player) => {
        return player.equipment.armor === null && player.action !== 'steelChestplate'
    }
}, {
    command: 'equip',
    moveName: 'eternalFlame',
    shouldCast: (game, player) => {
        return player.equipment.aux === null && player.action !== 'eternalFlame'
    }
}, {
    command: 'equip',
    moveName: 'hellslicer',
    shouldCast: (game, player) => {
        return player.equipment.weapon && player.equipment.weapon.name === 'sword' && player.action !== 'hellslicer' && player.stats.divinity >= 16
    }
}, {
    command: 'cast',
    moveName: 'crimsonSplinters',
    shouldCast: (game, player) => {
        return (game.p1.stats.shieldHealth > 0 && game.p1.stats.shield >= 20)
    }
}, {
    command: 'cast',
    moveName: 'flameSlash',
    shouldCast: (game, player) => {
        return (player.equipment.weapon !== null) && (Date.now() - player.communicateTime > 2800)
    }
}, {
    command: 'cast',
    moveName: 'slash',
    shouldCast: (game, player) => {
        return (player.equipment.weapon !== null) && (Date.now() - player.communicateTime > 2800) && (player.stats.mana < 5)
    }
}]
const level1Bot = (game, player) => {
    const botName = 'Chaze Bot (Level 1)';
    if (game.countdown > -1) return;
    // iterate over tutorial moves
    if (!game.botProgress['init']) {
        game.botProgress['init'] = true;
        game.room.sendMessage({ username: botName, msg: 'Is that a challenger I see? I\'ve been waiting for a worthy opponent.' });
        setTimeout(() => {
            game.room.sendMessage({ username: botName, msg: "I'll take care of you right quick. Just gimme a sec to gear up!" });
        }, 0.5 * 1000);
    }
    if (Date.now() - player.communicateTime < 100) return;
    if (Date.now() - (player.actionTime + player.castTime) < 100) return;
    for (let i = 0; i < level1Moves.length; i++) {
        const { command, moveName, shouldCast } = level1Moves[i];
        const move = allMovesDict[moveName];
        if (shouldCast(game, player) && CastLogic.playerCanCast(player, move).res) {
            if (moveName === 'steelChestplate' && !game.botProgress[moveName]) {
                game.botProgress[moveName] = true;
                setTimeout(() => {
                    game.room.sendMessage({ username: botName, msg: `Let's rock!` });
                }, 3 * 1000);
            } else if (moveName === 'eternalFlame' && !game.botProgress[moveName]) {
                game.botProgress[moveName] = true;
                game.room.sendMessage({ username: botName, msg: `You're in for it now. Venus give me strength!` });
            } else if (moveName === 'slash' && !game.botProgress[moveName]) {
                game.botProgress[moveName] = true;
                game.room.sendMessage({ username: botName, msg: `Aaaugh! Where did my mana go?` });
            } else if (moveName === 'hellslicer' && !game.botProgress[moveName]) {
                game.botProgress[moveName] = true;
                game.room.sendMessage({ username: botName, msg: `Ohhh yes. Have you met my friend the Hellslicer?` });
            } else if (moveName === 'crimsonSplinters' && !game.botProgress[moveName]) {
                game.botProgress[moveName] = true;
                game.room.sendMessage({ username: botName, msg: `Shields, shields, shields. I think not!` });
            }
            game.addAction(player.username, { command, moveName })
            return;
        }
    }
}

const level2Moves = [{
    command: 'equip',
    moveName: 'ceremonialGarb',
    shouldCast: (game, player) => {
        return player.equipment.armor === null
    }
}, {
    command: 'equip',
    moveName: 'goldPendant',
    shouldCast: (game, player) => {
        return player.stats.mana < 50
    }
}, {
    command: 'cast',
    moveName: 'bleedingHeart',
    shouldCast: (game, player) => {
        // return true if p1 is attacking and won't land an attack for 0.5 seconds
        if (player.equipment.weapon) return false;
        if (player.stats.divinity > 75) return false;
        if (game.p1.action && game.p1.actionTime + game.p1.castTime - Date.now() > 500 && Date.now() - game.p1.actionTime > 200) {
            if (allMovesDict[game.p1.action].tags[mechanics.effectType.magicalDamage] || allMovesDict[game.p1.action].tags[mechanics.effectType.physicalDamage]) {
                return true;
            }
        }
        return false;
    }
}, {
    command: 'equip',
    moveName: 'mystical',
    shouldCast: (game, player) => {
        // return true if p1 is threle (priest) and no gloves yet
        if (player.equipment.gloves) return false;
        if (game.p1.name === 'chaze') return false;
        return true;
    }
}, {
    command: 'cast',
    moveName: 'prayerShield',
    shouldCast: (game, player) => {
        if (game.p1.action && game.p1.actionTime + game.p1.castTime - Date.now() > 500) {
            if (allMovesDict[game.p1.action].tags[mechanics.effectType.magicalDamage] || allMovesDict[game.p1.action].tags[mechanics.effectType.physicalDamage]) {
                if (player.stats.divinity < 75) {
                    if (CastLogic.playerCanCast(player, allMovesDict['bleedingHeart']).res) {
                        return false;
                    }
                }
            }
        }
        return player.stats.divinity < 100 && player.equipment.weapon === null
    }
}, {
    command: 'equip',
    moveName: 'dagger',
    shouldCast: (game, player) => {
        return player.stats.divinity === 100 && player.equipment.weapon === null
    }
}, {
    command: 'cast',
    moveName: 'prayerUltimatum',
    shouldCast: (game, player) => {
        return player.stats.divinity === 100 && player.equipment.weapon !== null
    }
}, {
    command: 'cast',
    moveName: 'slash',
    shouldCast: (game, player) => {
        return player.stats.divinity !== 100 && player.equipment.weapon !== null
    }
}]
const level2Bot = (game, player) => {
    const botName = 'Threle Bot (Level 2)';
    if (game.countdown > -1) return;
    // iterate over tutorial moves
    if (!game.botProgress['init']) {
        game.botProgress['init'] = true;
        game.room.sendMessage({ username: botName, msg: 'Hello, challenger. Did you practice against my friend Chaze Bot or did you skip right over to see me?' });
        setTimeout(() => {
            game.room.sendMessage({ username: botName, msg: "It doesn't matter. I doubt he could prepare you for this!" });
        }, 1.5 * 1000);
    }
    if (Date.now() - player.communicateTime < 100) return;
    if (Date.now() - (player.actionTime + player.castTime) < 100) return;
    for (let i = 0; i < level2Moves.length; i++) {
        const { command, moveName, shouldCast } = level2Moves[i];
        const move = allMovesDict[moveName];
        if (shouldCast(game, player) && CastLogic.playerCanCast(player, move).res) {
            if (moveName === 'prayerUltimatum' && !game.botProgress[moveName]) {
                game.botProgress[moveName] = true;
                game.room.sendMessage({ username: botName, msg: `Now that I've reached max divinity... let me show you true power!` });
            } else if (moveName === 'bleedingHeart' && !game.botProgress[moveName]) {
                game.botProgress[moveName] = true;
                game.room.sendMessage({ username: botName, msg: `Pain! I must have more!` });
            } else if (moveName === 'slash' && !game.botProgress[moveName]) {
                game.botProgress[moveName] = true;
                setTimeout(() => {
                    game.room.sendMessage({ username: botName, msg: `I pray that Hecate is pleased and nourished by my offering.` });
                }, 2 * 1000);
            }
            game.addAction(player.username, { command, moveName })
            return;
        }
    }
}

export default {
    0: tutorialBot,
    1: level1Bot,
    2: level2Bot,
}
