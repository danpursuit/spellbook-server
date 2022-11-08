import mechanics from "./mechanics.js"

export default {
    shortAndSweet: {
        name: 'Short and Sweet',
        description: 'reducing physical attack cast times by 20%',
        verb: 'is',
        mult: 0.8
    },
    hotHands: {
        name: 'Hot Hands',
        description: 'physical fire attacks damage +10%',
        verb: 'has',
        mult: 1.1
    },
    spikyShell: {
        name: 'Spiky Shell',
        description: 'physical attacks burn 5 mana',
        verb: 'has',
        amount: 5
    },
    sliceOfPious: {
        name: 'Slice of Pious',
        description: 'physical attacks deal 4x shield damage',
        verb: 'has',
        mult: 4
    },
    kissOfVenus: {
        name: 'Kissed by Venus',
        description: 'attack scaled by divinity, up to +200% at 100 div.',
        verb: 'has been',
        mult: 2 / 100
    },
    corrupted: {
        name: 'Corrupted',
        description: 'divinity effects +10%',
        verb: 'is',
        mult: 1.1,
        requirements: {
            alignment: mechanics.alignment.shadow
        },
        alt: {
            description: 'divinity effects -10%',
            mult: 0.9
        }
    },
    ritualKnife: {
        name: 'Ritual Knife',
        description: 'physical attack increased by +666',
        verb: 'has',
        amount: 666
    },
    blessed: {
        name: 'Blessed',
        description: 'divinity effects +5%',
        verb: 'is',
        mult: 1.05
    },
    manaCapacitor: {
        name: 'Mana Capacitor',
        description: 'mana +100',
        verb: 'has',
        amount: 100
    }
}