import mechanics from "../mechanics.js";
import passives from "../passives.js";
const corruptedPossessions = {
    name: "corruptedPossessions",
    fullName: 'Corrupted Possessions',
    priority: 7,
    cd: 15,
    ct: 3.5,
    tags: {
        [mechanics.effectType.gainPassive]: true,
    },
    requirements: {
        alignment: mechanics.alignment.shadow,
        equipment: {},
    },
    costs: {
        mana: 40,
    },
    effects: [{
        type: mechanics.effectType.gainPassive,
        slot: mechanics.equipmentSlot.weapon,
        passive: passives.corrupted,
        alignment: mechanics.alignment.shadow,
    }, {
        type: mechanics.effectType.gainPassive,
        slot: mechanics.equipmentSlot.armor,
        passive: passives.corrupted,
        alignment: mechanics.alignment.shadow,
    }, {
        type: mechanics.effectType.gainPassive,
        slot: mechanics.equipmentSlot.gloves,
        passive: passives.corrupted,
        alignment: mechanics.alignment.shadow,
    }, {
        type: mechanics.effectType.gainPassive,
        slot: mechanics.equipmentSlot.aux,
        passive: passives.corrupted,
        alignment: mechanics.alignment.shadow,
    }, {
        type: mechanics.effectType.givePassive,
        slot: mechanics.equipmentSlot.weapon,
        passive: passives.corrupted,
        alignment: mechanics.alignment.shadow,
    }, {
        type: mechanics.effectType.givePassive,
        slot: mechanics.equipmentSlot.armor,
        passive: passives.corrupted,
        alignment: mechanics.alignment.shadow,
    }, {
        type: mechanics.effectType.givePassive,
        slot: mechanics.equipmentSlot.gloves,
        passive: passives.corrupted,
        alignment: mechanics.alignment.shadow,
    }, {
        type: mechanics.effectType.givePassive,
        slot: mechanics.equipmentSlot.aux,
        passive: passives.corrupted,
        alignment: mechanics.alignment.shadow,
    }],
    description: ['Corrupt all equipment. Shadow alignment +10% divinity effects for each equipped item; all other alignments -10% divinity effects.'],
    flavor: "The evil embraces consumption; the weak succumbs to it."
}
const bleedingHeart = {
    name: "bleedingHeart",
    fullName: 'Bleeding Heart',
    priority: 5,
    cd: 12,
    ct: 0.5,
    tags: {
        [mechanics.effectType.gainStatus]: true,
    },
    requirements: {
        alignment: mechanics.alignment.shadow,
        classType: mechanics.classType.priest,
    },
    costs: {
        mana: 20,
    },
    effects: [{
        type: mechanics.effectType.gainStatus,
        status: mechanics.statusType.sacrifice.name,
        duration: 7,
    }],
    description: ['Gain divinity equal to 20% of damage taken. Lasts 7 seconds.'],
    flavor: "So painful... and therefore so pleasurable!"
}
const prayerUltimatum = {
    name: "prayerUltimatum",
    fullName: 'Prayer - Ultimatum',
    priority: 8,
    cd: 100,
    ct: 4,
    tags: {
        [mechanics.effectType.gainPassive]: true,
    },
    requirements: {
        alignment: mechanics.alignment.shadow,
        classType: mechanics.classType.priest,
        equipment: {
            weapon: mechanics.weaponType.dagger,
        },
        divinity: 100,
    },
    costs: {
        mana: 1,
    },
    effects: [{
        type: mechanics.effectType.gainPassive,
        slot: mechanics.equipmentSlot.weapon,
        passive: passives.ritualKnife,
        alignment: mechanics.alignment.shadow,
    }, {
        type: mechanics.effectType.setDivinity,
        amount: 0,
    }],
    description: ['Enchant your weapon for +666 attack. Reduce divinity to 0.'],
    flavor: "If deals with the devil are so bad, why do they keep happening?"
}
export default [
    corruptedPossessions,
    bleedingHeart,
    prayerUltimatum,
].map((move) => {
    return {
        ...move,
        tags: {
            ...move.tags,
            [mechanics.castEffect.buff]: true,
            [mechanics.alignment.shadow]: true,
        }
    }
})