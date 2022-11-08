import mechanics from "../mechanics.js";
import passives from "../passives.js";
const hotHanded = {
    name: "hotHanded",
    fullName: 'Hot Handed',
    priority: 6,
    cd: 10,
    ct: 1.5,
    tags: {
        [mechanics.effectType.gainPassive]: true,
    },
    requirements: {
        alignment: mechanics.alignment.fire,
        equipment: {
            gloves: mechanics.gloveType.any,
        },
    },
    costs: {
        mana: 5,
    },
    effects: [{
        type: mechanics.effectType.gainPassive,
        slot: mechanics.equipmentSlot.gloves,
        passive: passives.hotHands,
        alignment: mechanics.alignment.fire,
    }],
    description: ['Set your gloves ablaze. +10% damage to physical fire attacks.'],
    flavor: "Nobody likes to play hot potato with Chaze XS."
}
export default [
    hotHanded
].map((move) => {
    return {
        ...move,
        tags: {
            ...move.tags,
            [mechanics.castEffect.buff]: true,
            [mechanics.alignment.fire]: true,
        }
    }
})