export default class Player {
    constructor({ name, alignment, classType, stats, username, isCpu = false, cpuDifficulty = 0 }) {
        this.name = name;
        this.alignment = alignment;
        this.classType = classType;
        this.stats = { ...stats };
        this.stats.maxHealth = stats.health;
        this.stats.maxMana = stats.mana;
        this.stats.originalMaxMana = stats.mana;
        this.username = username;
        this.isCpu = isCpu;
        this.cpuDifficulty = cpuDifficulty;
        this.ready = false; // is player connected to game lobby
        this.statuses = []; // statuses that affect player

        // equipment
        this.equipment = {
            weapon: null,
            armor: null,
            gloves: null,
            aux: null,
        };
        this.moves = {};
        this.passives = [];

        // manage player's current action
        this.action = null;
        this.actionTime = null;
        this.castTime = null;

        this.disconnectTime = null;
        this.communicateTime = 0;
    }
}