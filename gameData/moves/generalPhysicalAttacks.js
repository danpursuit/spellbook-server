import mechanics from "../mechanics.js";
const slash = {
    name: 'slash',
    fullName: 'Slash',
    priority: 1,
    cd: 1,
    ct: 1,
    tags: {
        [mechanics.weaponType.slash]: true,
    },
    requirements: {
        equipment: {
            weapon: mechanics.weaponType.slash,
        },
    },
    costs: {},
    effects: [{
        type: mechanics.effectType.physicalDamage,
        attackMult: 1,
        verb: 'slashes',
    }],
    description: ['Slash your opponent for', { mult: 1, stat: mechanics.stat.attack }, 'damage.'],
    flavor: 'Gets the job done.'
}
const pillage = {
    name: 'pillage',
    fullName: 'Pillage',
    priority: 4,
    cd: 10,
    ct: 2,
    tags: {
        [mechanics.effectType.stealGold]: true,
    },
    requirements: {
        equipment: {
            weapon: mechanics.weaponType.any,
        },
        classType: mechanics.classType.valiant
    },
    costs: {},
    effects: [{
        type: mechanics.effectType.physicalDamage,
        attackMult: 0.5,
        verb: 'pillages',
    }, {
        type: mechanics.effectType.reduceDivinity,
        amount: 5,
    }, {
        type: mechanics.effectType.stealGold,
        specialAmount: mechanics.actionValues.physicalDamage,
    }],
    description: ['Slash your opponent for', { mult: 0.5, stat: mechanics.stat.attack }, 'damage and steal gold equal to damage dealt. Reduces divinity by 5.'],
    flavor: "Stealing gold is a downright dirty tactic. Don't expect the gods to like it."
}

export default [
    slash,
    pillage
].map((move) => {
    return {
        ...move,
        tags: {
            ...move.tags,
            [mechanics.effectType.physicalDamage]: true,
        }
    }
})