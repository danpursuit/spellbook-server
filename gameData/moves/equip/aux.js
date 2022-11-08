import mechanics from "../../mechanics.js";
import passives from "../../passives.js";
const cd = 5;

const eternalFlame = {
    name: "eternalFlame",
    fullName: "Eternal Flame",
    priority: 8,
    cd,
    ct: 0.1,
    requirements: {
        alignment: mechanics.alignment.fire,
        divinity: 10,
    },
    costs: { gold: 0 },
    effects: [{
        type: mechanics.effectType.equip,
        slot: mechanics.equipmentSlot.aux,
        name: "eternalFlame",
        equipType: mechanics.auxType.misc,
        passives: [passives.kissOfVenus],
        tier: 'rare',
    }],
    description: ["A blessing from Venus. ATK will be increased by divinity. +0% at 0 DIV, +200% at 100 DIV."],
    flavor: "Since cool guys never look at explosions, Venus lovingly sets her favorite valiants on fire. From behind."
}
const goldPendant = {
    name: "goldPendant",
    fullName: "Gold Pendant",
    priority: 7,
    cd,
    ct: 3,
    requirements: {
    },
    costs: { gold: 300 },
    effects: [{
        type: mechanics.effectType.equip,
        slot: mechanics.equipmentSlot.aux,
        name: "goldPendant",
        equipType: mechanics.auxType.misc,
        passives: [passives.manaCapacitor],
        tier: 'common',
    }, {
        type: mechanics.effectType.restoreMana,
        amount: passives.manaCapacitor.amount,
    }],
    description: [`A common pendant that increases mana by ${passives.manaCapacitor.amount} on equip.`],
    flavor: "Rare metals are prized for their ability to store magical power. Gold pendants are a drop in the bucket for those with high PSY, but an ocean of power for a valiant."
}
export default [
    eternalFlame,
    goldPendant,
].map((move) => {
    return {
        ...move,
        tags: {
            ...move.tags,
            [mechanics.effectType.equip]: true,
        }
    }
})