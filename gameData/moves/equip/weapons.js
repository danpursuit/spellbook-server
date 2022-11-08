import mechanics from "../../mechanics.js";
import passives from "../../passives.js";
const cd = 5;

const dagger = {
    name: "dagger",
    fullName: 'Questing Dagger',
    priority: 1,
    cd,
    ct: 1,
    requirements: {},
    costs: { gold: 10 },
    effects: [{
        type: mechanics.effectType.equip,
        slot: mechanics.equipmentSlot.weapon,
        name: "dagger",
        equipType: mechanics.weaponType.dagger,
        attack: 10,
        passives: [passives.shortAndSweet],
        tier: 'common',
    }],
    description: ["A common dagger that can be upgraded. +10 to ATK, and hastens physical attacks."],
    flavor: "Stabby stab stab."
}
const sword = {
    name: "sword",
    fullName: 'Questing Sword',
    priority: 2,
    cd,
    ct: 5,
    // ct: 1,
    requirements: {
        classType: mechanics.classType.valiant,
    },
    costs: { gold: 100 },
    effects: [{
        type: mechanics.effectType.equip,
        slot: mechanics.equipmentSlot.weapon,
        name: "sword",
        equipType: mechanics.weaponType.sword,
        attack: 120,
        tier: 'common',
    }],
    description: ["A common sword that can be upgraded. +120 to ATK."],
    flavor: "Slashy slash slash!"
}
const hellslicer = {
    name: "hellslicer",
    fullName: 'Hellslicer',
    priority: 3,
    cd,
    ct: 4,
    requirements: {
        alignment: mechanics.alignment.fire,
        classType: mechanics.classType.valiant,
        divinity: 10,
        equipment: {
            weapon: mechanics.weaponType.sword,
        }
    },
    costs: { gold: 500 },
    effects: [{
        type: mechanics.effectType.equip,
        slot: mechanics.equipmentSlot.weapon,
        name: "hellslicer",
        equipType: mechanics.weaponType.sword,
        attack: 200,
        passives: [passives.sliceOfPious],
        tier: 'rare',
    }],
    description: ["A rare sword that deals 4x damage to shields. +200 to ATK."],
    flavor: "When swung fast enough, the Hellslicer opens a rift to the Nether, causing shields to dissipate back into the divine force that created them."
}

export default [
    dagger,
    sword,
    hellslicer,
].map((move) => {
    return {
        ...move,
        tags: {
            ...move.tags,
            [mechanics.effectType.equip]: true,
        }
    }
})