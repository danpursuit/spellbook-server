import mechanics from "../../mechanics.js";
import passives from "../../passives.js";
const cd = 5;

const steelChestplate = {
    name: "steelChestplate",
    fullName: "Steel Chestplate",
    priority: 4,
    cd,
    ct: 5,
    requirements: {
        classType: mechanics.classType.valiant,
    },
    costs: { gold: 200 },
    effects: [{
        type: mechanics.effectType.equip,
        slot: mechanics.equipmentSlot.armor,
        name: "steelChestplate",
        equipType: mechanics.armorType.steel,
        armor: 30,
        tier: 'common',
    }],
    description: ["A sturdy steel chestplate that reduces damage of physical attacks. +30 to armor."],
    flavor: "A standard outfit for a valiant."
}
const magmaticBarbs = {
    name: "magmaticBarbs",
    fullName: "Magmatic Barbs",
    priority: 5,
    cd,
    ct: 4,
    requirements: {
        classType: mechanics.classType.valiant,
        alignment: mechanics.alignment.fire,
        divinity: 10,
        equipment: {
            armor: mechanics.armorType.steel,
        },
    },
    costs: { gold: 500 },
    effects: [{
        type: mechanics.effectType.equip,
        slot: mechanics.equipmentSlot.armor,
        name: "magmaticBarbs",
        equipType: mechanics.armorType.steel,
        armor: 80,
        attack: 5,
        passives: [passives.spikyShell],
        tier: 'rare',
    }],
    description: [`Expensive but powerful. +80 armor, +5 ATK. Physical attacks will burn ${passives.spikyShell.amount} mana.`],
    flavor: "Yes, spikes on my back are uncomfortable. Yes, it's necessary! ~ Chaze to his armorsmith, probably"
}
const ceremonialGarb = {
    name: "ceremonialGarb",
    fullName: "Ceremonial Garb",
    priority: 2,
    cd,
    ct: 2,
    requirements: {
        classType: mechanics.classType.priest,
    },
    costs: { gold: 200 },
    effects: [{
        type: mechanics.effectType.equip,
        slot: mechanics.equipmentSlot.armor,
        name: "ceremonialGarb",
        equipType: mechanics.armorType.cloth,
        armor: 10,
        passives: [passives.blessed],
        tier: 'common',
    }],
    description: ['Fast, simple protection. +10 armor and +5% to divinity effects.'],
    flavor: "A standard outfit for a priest."
}
export default [
    steelChestplate,
    magmaticBarbs,
    ceremonialGarb,
].map((move) => {
    return {
        ...move,
        tags: {
            ...move.tags,
            [mechanics.effectType.equip]: true,
        }
    }
})