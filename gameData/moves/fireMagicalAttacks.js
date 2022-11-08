import mechanics from "../mechanics.js";
const crimsonSplinterData = {
    type: mechanics.effectType.magicalDamage,
    psycheMult: 1,
    divinityMult: 2,
    minPsycheDamage: 20,
    shieldMult: 10,
    tags: { [mechanics.alignment.fire]: true },
}
const crimsonSplinters = {
    name: "crimsonSplinters",
    fullName: 'Crimson Splinters',
    priority: 3,
    cd: 3,
    ct: 2,
    requirements: {
        alignment: mechanics.alignment.fire,
        classType: mechanics.classType.valiant,
        equipment: {
            gloves: mechanics.gloveType.any,
        },
    },
    costs: {
        mana: 5,
    },
    effects: [{
        verb: 'frags (x1)',
        ...crimsonSplinterData,
    }, {
        verb: 'frags (x2)',
        ...crimsonSplinterData,
    }, {
        verb: 'frags (x3)',
        ...crimsonSplinterData,
    }],
    description: ['Fire three splinters at the opponent for', { mult: crimsonSplinterData.psycheMult, stat: mechanics.stat.psyche, min: crimsonSplinterData.minPsycheDamage, long: false }, '+', { mult: crimsonSplinterData.divinityMult, stat: mechanics.stat.divinity, long: false }, 'damage each. 10x damage to shields.'],
    flavor: "Like a shotgun, but with fire."
}

export default [
    crimsonSplinters,
].map((move) => {
    return {
        ...move,
        tags: {
            ...move.tags,
            [mechanics.effectType.magicalDamage]: true,
            [mechanics.alignment.fire]: true,
        }
    }
})