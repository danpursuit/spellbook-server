import mechanics from "../mechanics.js";
import passives from "../passives.js";
const prayerShield = {
    name: "prayerShield",
    fullName: 'Prayer - Shield',
    priority: 0.1,
    cd: 3,
    ct: 1,
    tags: {
        [mechanics.castEffect.prayer]: true,
    },
    requirements: {
        classType: mechanics.classType.priest,
    },
    costs: {
        mana: 5,
    },
    effects: [{
        type: mechanics.effectType.increaseDivinity,
        amount: 5,
    }, {
        type: mechanics.effectType.shield
    }],
    description: ['Increase divinity by 5, then create a prayer shield that reduces damage by', { plus: 4, mult: 0.8, max: 100, stat: mechanics.stat.divinity, long: true, suffix: '%', suffix2: '.' },
        'Prayer shield is created with', { mult: 10, stat: mechanics.stat.psyche }, 'max health, and damage reduction drops linearly as shield health drops.'],
    flavor: "Every priest's bread and butter. Watch out for recoil from magic attacks while your shield is up!"
}
const prayerBlast = {
    name: "prayerBlast",
    fullName: 'Prayer - Blast',
    priority: 0.3,
    cd: 5,
    ct: 5,
    tags: {
        [mechanics.castEffect.prayer]: true,
        [mechanics.effectType.magicalDamage]: true,
    },
    requirements: {
        classType: mechanics.classType.priest,
    },
    costs: {
        mana: 45,
    },
    effects: [{
        type: mechanics.effectType.magicalDamage,
        psycheMult: 1,
        divinityMult: 20,
        verb: 'blasts',
    }, {
        type: mechanics.effectType.increaseDivinity,
        amount: 5,
    }],
    description: ['Unleash a magical blast for', { stat: mechanics.stat.psyche, mult: 1 },
        '+', { mult: 10, stat: mechanics.stat.divinity }, 'damage, then increase divinity by 5.'],
    flavor: "Priests are a conduit for their deity's power. A touch of psyche and a whole lot of divinity will take out just about anything."
}
const dissipate = {
    name: "dissipate",
    fullName: 'Dissipate',
    priority: 0.2,
    cd: 2,
    ct: 0,
    requirements: {
        classType: mechanics.classType.priest,
    },
    costs: {},
    effects: [{
        type: mechanics.effectType.dropShield
    }],
    description: ['Instantly dissipates your prayer shield.'],
    flavor: "Maintaining a prayer shield in the heat of battle requires purity of heart and intense concentration. In contrast, it is almost relaxing for a priest to drop shield and blast their enemy out of existence."
}
export default [
    prayerShield,
    prayerBlast,
    dissipate,
].map((move) => {
    return {
        ...move,
        tags: {
            ...move.tags
        }
    }
})