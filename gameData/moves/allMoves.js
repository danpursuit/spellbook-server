import firePhysicalAttacks from "./firePhysicalAttacks.js";
import fireMagicalAttacks from "./fireMagicalAttacks.js";
import fireBuffs from "./fireBuffs.js";
import shadowBuffs from "./shadowBuffs.js";
import shadowMagicalAttacks from "./shadowMagicalAttacks.js";
import priestSpells from "./priestSpells.js";
import generalPhysicalAttacks from "./generalPhysicalAttacks.js";
import weapons from "./equip/weapons.js";
import gloves from "./equip/gloves.js";
import armor from "./equip/armor.js";
import aux from "./equip/aux.js";

const nameMove = (command) => (move) => {
    const capitalizedCommand = command.charAt(0).toUpperCase() + command.slice(1);
    return {
        ...move,
        command,
        commandName: command + ' ' + move.name.toLowerCase(),
        lowerName: move.name.toLowerCase()
    }
}

export default {
    cast: [...shadowMagicalAttacks, ...priestSpells, ...shadowBuffs, ...fireBuffs, ...firePhysicalAttacks, ...fireMagicalAttacks, ...generalPhysicalAttacks].map(nameMove('cast')),
    equip: [...weapons, ...gloves, ...armor, ...aux].map(nameMove('equip')),
};