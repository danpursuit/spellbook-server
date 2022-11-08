
import allMoves from './allMoves.js';
const allMovesDict = {};
allMoves.cast.forEach((move) => {
    allMovesDict[move.name] = move;
});
allMoves.equip.forEach((move) => {
    allMovesDict[move.name] = move;
});
export default allMovesDict;