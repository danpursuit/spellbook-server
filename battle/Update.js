import CastLogic from "./CastLogic.js";

// update stores a list of effects and can be "applied" to a game state, storing the new game state within itself
// note that game state = p1 + p2
export default class Update {
    constructor({ effects, ts, fromP1, gameState = null }) {
        this.effects = effects;
        this.ts = ts;
        this.fromP1 = fromP1;

        this.p1 = null;
        this.p2 = null;
        this.updateNum = null;

        if (gameState) {
            this.applyUpdate(gameState);
        }
    }
    applyUpdate({ p1, p2, updateNum }) {
        // apply effects to a game state/past update
        this.updateNum = updateNum + 1;
        //deep copy p1
        this.p1 = JSON.parse(JSON.stringify(p1));
        this.p2 = JSON.parse(JSON.stringify(p2));
        this.fromP1 ? CastLogic.resolveEffects(this.p1, this.p2, this.effects) : CastLogic.resolveEffects(this.p2, this.p1, this.effects);
    }
}