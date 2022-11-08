import mechanics from "../mechanics.js";
const flameSlash = {
    name: "flameSlash",
    fullName: 'Flame Slash',
    priority: 2,
    cd: 1,
    ct: 1,
    tags: {
        [mechanics.weaponType.slash]: true,
    },
    requirements: {
        alignment: mechanics.alignment.fire,
        equipment: {
            weapon: mechanics.weaponType.slash,
        },
    },
    costs: {
        mana: 5,
    },
    effects: [{
        type: mechanics.effectType.physicalDamage,
        attackMult: 1,
        divinityMult: 5,
        verb: 'slashes',
        tags: { [mechanics.alignment.fire]: true },
    }, {
        type: mechanics.effectType.increaseDivinity,
        amount: 2,
    }],
    description: ['Slash your opponent for', { mult: 1, stat: mechanics.stat.attack, long: true }, '+', { mult: 5, stat: mechanics.stat.divinity, long: true }, 'damage, then increase your divinity by 2.'],
    flavor: "Nothing cuts through priest quite like a flaming sword."
}
const manaBurn = {
    name: "manaBurn",
    fullName: 'Mana Burn',
    priority: 5,
    cd: 17,
    ct: 5,
    requirements: {
        alignment: mechanics.alignment.fire,
        classType: mechanics.classType.valiant,
    },
    costs: {
        mana: 15,
    },
    effects: [{
        type: mechanics.effectType.physicalDamage,
        attackMult: 2,
        shieldMult: 1.5,
        verb: 'burns',
        tags: { [mechanics.alignment.fire]: true },
    }, {
        type: mechanics.effectType.burnMana,
        specialAmount: mechanics.actionValues.enemyPsyche,
    }, {
        type: mechanics.effectType.increaseDivinity,
        amount: 10,
    }],
    description: ['A powerful slam that deals', { mult: 2, stat: mechanics.stat.attack, long: true },
        "damage, and burns mana equal to the opponent's PSY. Slight bonus damage to shields. Increases divinity by 10."],
    flavor: "The arcane technique of burning mana is one of the few traditions that valiants hold sacred. It is said to have been passed down by the ancient Magina from eons passed."
}

export default [
    flameSlash,
    manaBurn,
].map((move) => {
    return {
        ...move,
        tags: {
            ...move.tags,
            [mechanics.effectType.physicalDamage]: true,
            [mechanics.alignment.fire]: true,
        }
    }
})