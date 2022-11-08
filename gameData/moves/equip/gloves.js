import mechanics from "../../mechanics.js";
const cd = 5;

const blacksmiths = {
    name: "blacksmiths",
    fullName: "Blacksmith's Gloves",
    priority: 6,
    cd,
    ct: 2,
    requirements: {
        alignment: mechanics.alignment.fire,
    },
    costs: { gold: 50 },
    effects: [{
        type: mechanics.effectType.equip,
        slot: mechanics.equipmentSlot.gloves,
        name: "blacksmiths",
        equipType: mechanics.gloveType.leather,
        attack: 10,
        armor: 5,
        tier: 'common',
    }],
    description: ["A pair of common leather gloves that can weather extreme heat. +10 ATK, +5 armor."],
    flavor: "Chaze's armorsmith is still waiting for him to return these."
}
const mystical = {
    name: "mystical",
    fullName: "Mystical Gauntlets",
    priority: 4,
    cd,
    ct: 3,
    requirements: {
        alignment: mechanics.alignment.shadow,
    },
    costs: { gold: 150 },
    effects: [{
        type: mechanics.effectType.equip,
        slot: mechanics.equipmentSlot.gloves,
        name: "mystical",
        equipType: mechanics.gloveType.leather,
        psyche: 50,
        tier: 'common',
    }],
    description: ["A pair of leather gauntlets glowing with magical power. +50 PSY."],
    flavor: "Before her dark dealings with Hecate, Threle relied on these gauntlets to amplify her own magical abilities."
}
export default [
    blacksmiths,
    mystical,
].map((move) => {
    return {
        ...move,
        tags: {
            ...move.tags,
            [mechanics.effectType.equip]: true,
        }
    }
})