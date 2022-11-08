import mechanics from "../mechanics.js";

const drainSoul = {
    name: "drainSoul",
    fullName: 'Drain Soul',
    priority: 6,
    cd: 8,
    ct: 3,
    requirements: {
        alignment: mechanics.alignment.shadow,
    },
    costs: {
        mana: 100,
    },
    effects: [{
        type: mechanics.effectType.magicalDamage,
        psycheMult: 3,
        divinityMult: 7,
        verb: 'drains',
    }, {
        type: mechanics.effectType.heal,
        specialAmount: mechanics.actionValues.magicalDamage,
    }],
    description: ['Deal', { stat: mechanics.stat.psyche, mult: 3 }, '+', { stat: mechanics.stat.divinity, mult: 7 }, 'magical damage to the opponent, then heal yourself equal to the damage dealt.'],
    flavor: "Drain Soul can be used early on to stabilize, or late game to outrace your opponent. Make sure to watch your mana bar!"
}

export default [
    drainSoul,
].map((move) => {
    return {
        ...move,
        tags: {
            ...move.tags,
            [mechanics.effectType.magicalDamage]: true,
            [mechanics.alignment.shadow]: true,
        }
    }
})