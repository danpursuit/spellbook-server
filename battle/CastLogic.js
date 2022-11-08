import mechanics from "../gameData/mechanics.js"
import passives from "../gameData/passives.js";

// Bulk of the logic for casting moves


export const Fail = {
    alignment: 'alignment',
    classType: 'class',
    equipment: 'equipment',
    stat: 'stat',
    cost: 'cost',
    alreadyCasting: 'alreadyCasting',
    onCooldown: 'onCooldown',
}

const isActive = ({ startTime, endTime }) => {
    return startTime <= Date.now() && Date.now() <= endTime;
}

const equipTypeMatches = (playerEquip, requiredEquip) => {
    if (requiredEquip === mechanics.weaponType.any || requiredEquip === mechanics.gloveType.any) {
        return true
    }
    if (requiredEquip === mechanics.weaponType.slash) {
        return playerEquip.equipType === mechanics.weaponType.dagger || playerEquip.equipType === mechanics.weaponType.sword;
    }
    return playerEquip.equipType === requiredEquip
}
const calcMaxMana = (player) => {
    let maxMana = player.stats.originalMaxMana;
    // iterate over player passives
    player.passives.forEach((passive) => {
        if (passive.name === passives.manaCapacitor.name) {
            maxMana += passive.amount;
        }
    })
    //manaCapacitor
    return maxMana;
}
const calcAttack = (player, plus = null) => {
    let attack = player.stats.attack;
    if (plus) {
        attack += plus;
    }
    Object.values(player.equipment).forEach((equip) => {
        if (equip && equip.attack) {
            attack += equip.attack;
        }
    });
    // iterate over player passives
    player.passives.forEach((passive) => {
        if (passive.name === passives.kissOfVenus.name) {
            attack += attack * calcDivinity(player) * passive.mult;
        } else if (passive.name === passives.ritualKnife.name) {
            attack += passive.amount
        }
    })
    return attack;
}
const calcPsyche = (player, plus = null) => {
    let psyche = player.stats.psyche;
    if (plus) {
        psyche += plus;
    }
    Object.values(player.equipment).forEach((equip) => {
        if (equip && equip.psyche) {
            psyche += equip.psyche;
        }
    });
    // iterate over player passives
    player.passives.forEach((passive) => {
        // if (passive.name === passives.kissOfVenus.name) {
        //     attack += attack * calcDivinity(player) * passive.mult;
        // }
    })
    return psyche;
}
const calcArmor = (player) => {
    let armor = player.stats.armor;
    Object.values(player.equipment).forEach((equip) => {
        if (equip && equip.armor) {
            armor += equip.armor;
        }
    });
    return armor;
}
const rawDivinity = (player) => {
    return player.stats.divinity;
}
const calcDivinity = (player, plus = null) => {
    let divinity = player.stats.divinity;
    if (plus) {
        divinity += plus;
    }
    if (divinity > 100) {
        divinity = 100;
    }
    // iterate over player passives
    player.passives.forEach((passive) => {
        if (passive.name === passives.corrupted.name) {
            if (player.alignment === passive.requirements.alignment)
                divinity *= passive.mult;
            else
                divinity *= passive.alt.mult;
        } else if (passive.name === passives.blessed.name) {
            divinity *= passive.mult;
        }
    })
    return divinity;
}
const calcSpecial = (player, enemy, actionValues, effect) => {
    // for special amounts like gold pillage
    let amount = 0;
    if (effect.specialAmount === mechanics.actionValues.enemyPsyche) {
        amount = enemy.stats.psyche;
    } else {
        amount = actionValues[effect.specialAmount];
    }
    if (effect.specialMult) {
        amount *= effect.specialMult;
    }
    return Math.floor(amount);
}
const calcPassives = (player) => {
    let passives = [];
    Object.values(player.equipment).forEach((equip) => {
        if (equip && equip.passives) {
            passives = passives.concat(equip.passives);
        }
    });
    return passives;
}
const setPassives = (player) => {
    player.passives = calcPassives(player);
    player.stats.maxMana = calcMaxMana(player);
    if (player.stats.mana > player.stats.maxMana) {
        player.stats.mana = player.stats.maxMana;
    }
}
const calcCastTime = (player, enemy, move) => {
    let castTime = move.ct * 1000;
    if (move.tags[mechanics.effectType.physicalDamage]) {
        //iterate over player passives
        player.passives.forEach((passive) => {
            if (passive.name === passives.shortAndSweet.name) {
                castTime *= passive.mult;
            }
        })
    }
    return castTime;
}
const calcPhysicalShieldDamageMult = (player, enemy, effect) => {
    let mult = 1;
    //iterate over player passives
    player.passives.forEach((passive) => {
        if (passive.name === passives.sliceOfPious.name) {
            mult *= passive.mult;
        }
    })
    return mult;
}
const calcPhysicalDamageMult = (player, enemy, effect) => {
    let mult = 1;
    //iterate over player passives
    player.passives.forEach((passive) => {
        if (passive.name === passives.hotHands.name) {
            if (effect.tags && effect.tags[mechanics.alignment.fire]) {
                mult *= passive.mult;
            }
        }
    })
    return mult;
}
const calcMagicalShieldDamageMult = (player, enemy, effect) => {
    let mult = 1;
    //iterate over player passives
    player.passives.forEach((passive) => {
        // if (passive.name === passives.sliceOfPious.name) {
        //     mult *= passive.mult;
        // }
    })
    return mult;
}
const calcPsycheDamageMult = (player, enemy, effect) => {
    let mult = 1;
    //iterate over player passives
    player.passives.forEach((passive) => {
        // if (passive.name === passives.hotHands.name) {
        //     if (effect.tags && effect.tags[mechanics.alignment.fire]) {
        //         mult *= passive.mult;
        //     }
        // }
    })
    return mult;
}
const postAnyDamage = (player, enemy, effect, damageDealt) => {
    const events = [];
    // here, the player is taking damage
    //iterate over player statuses
    player.statuses.forEach((status) => {
        if (!isActive(status))
            return;
        if (status.name === mechanics.statusType.sacrifice.name) {
            events.push(...resolveEffects(player, enemy, [{
                type: mechanics.effectType.increaseDivinity,
                amount: Math.floor(damageDealt * 0.2),
            }]));
        }
    })
    return events;
}
const postPhysicalDamage = (player, enemy, effect, damageDealt) => {
    // here, player is dealing physical damage to enemy
    const events = [];
    //iterate over player passives
    player.passives.forEach((passive) => {
        if (passive.name === passives.spikyShell.name) {
            events.push(...resolveEffects(player, enemy, [{
                type: mechanics.effectType.burnMana,
                amount: passive.amount,
            }]));
        }
    })
    events.push(...postAnyDamage(enemy, player, effect, damageDealt));
    return events
}
const postMagicalDamage = (player, enemy, effect, damageDealt) => {
    // here, player is dealing magical damage to enemy
    const events = [];
    //iterate over player passives
    // player.passives.forEach((passive) => {
    //     if (passive.name === passives.spikyShell.name) {
    //         events.push(...resolveEffects(player, enemy, [{
    //             type: mechanics.effectType.burnMana,
    //             amount: passive.amount,
    //         }]));
    //     }
    // })
    events.push(...postAnyDamage(enemy, player, effect, damageDealt));
    return events
}
const postRecoilDamage = (player, enemy, effect, damageDealt) => {
    // here, player is taking recoil damage
    const events = [];
    //iterate over player passives
    // player.passives.forEach((passive) => {
    //     if (passive.name === passives.spikyShell.name) {
    //         events.push(...resolveEffects(player, enemy, [{
    //             type: mechanics.effectType.burnMana,
    //             amount: passive.amount,
    //         }]));
    //     }
    // })
    events.push(...postAnyDamage(player, enemy, effect, damageDealt));
    return events
}

const playerMeetsBaseRequirements = (player, { requirements }) => {
    // check alignment requirements
    if (requirements.alignment && player.alignment !== requirements.alignment) {
        return false;
    }
    // check class requirements
    if (requirements.classType && player.classType !== requirements.classType) {
        return false;
    }
    return true;
}


const playerMeetsRequirements = (player, { requirements, costs }) => {
    // check alignment requirements
    if (requirements.alignment && player.alignment !== requirements.alignment) {
        return { res: false, reason: Fail.alignment, required: requirements.alignment }
    }
    // check class requirements
    if (requirements.classType && player.classType !== requirements.classType) {
        return { res: false, reason: Fail.classType, required: requirements.classType }
    }
    // check equipment requirements
    if (requirements.equipment) {
        for (const equip in requirements.equipment) {
            if (!player.equipment[equip] || !equipTypeMatches(player.equipment[equip], requirements.equipment[equip])) {
                return { res: false, reason: Fail.equipment, detail: equip, required: requirements.equipment[equip] }
            }
        }
    }
    if (requirements.divinity && player.stats.divinity < requirements.divinity) {
        return { res: false, reason: Fail.stat, detail: mechanics.stat.divinity, required: requirements.divinity }
    }
    // check cost requirements
    if (costs) {
        for (const cost in costs) {
            if (player.stats[cost] < costs[cost]) {
                return { res: false, reason: Fail.cost, detail: cost }
            }
        }
    }
    return { res: true }
}

const playerCanCast = (player, move, checkAlreadyCasting = true) => {
    // check if player is already performing an action
    if (checkAlreadyCasting && player.actionTime && Date.now() < player.actionTime + player.castTime) {
        return { res: false, reason: Fail.alreadyCasting }
    }
    // check if the move is on cooldown
    if (player.moves[move.name] && Date.now() < player.moves[move.name].actionTime + player.moves[move.name].cdTime) {
        return { res: false, reason: Fail.onCooldown, actionTime: player.moves[move.name].actionTime, cdTime: player.moves[move.name].cdTime }
    }
    // check move requirements
    const meetsRequirements = playerMeetsRequirements(player, move)
    if (!meetsRequirements.res) {
        return meetsRequirements;
    }
    return { res: true }
}

const castMove = (player, enemy, move) => {
    // perform logic to prepare player for casting move

    // check if player can cast the move
    const canCast = playerCanCast(player, move)
    if (!canCast.res) {
        return canCast;
    }

    const actionTime = Date.now();
    const castTime = calcCastTime(player, enemy, move);
    const cdTime = move.cd * 1000;
    const onCastEffects = move.onCastEffects === undefined ? [] : [...move.onCastEffects];
    onCastEffects.push({
        type: mechanics.effectType.castMove,
        moveName: move.name,
        actionTime,
        castTime,
        cdTime,
        costs: { ...move.costs },
    })

    return {
        res: true,
        actionTime,
        castTime,
        effects: onCastEffects
    }
}

// this will mutate the player/enemy
const resolveEffects = (player, enemy, effects) => {
    let actionValues = {
        physicalDamage: 0,
        physicalDamageFromAttack: 0,
        physicalDamageFromDivinity: 0,
        goldStolen: 0,
        attackPrev: null,
        attackPost: null,
        armorPrev: null,
        armorPost: null,
        divinityPrev: null,
        divinityPost: null,
        psychePrev: null,
        psychePost: null,
        magicalDamageFromPsyche: 0,
        magicalDamageFromDivinity: 0,
        magicalDamage: 0,
    }
    const events = [];
    for (const effect of effects) {
        let psyche;
        let divinity, damageMult;
        let damage, damageAfterShield, damageAfterArmor;
        let shieldPct, shieldDamage;
        let eventsPost;
        let divinityPrev, attackPrev, armorPrev, psychePrev;
        switch (effect.type) {
            case mechanics.effectType.castMove:
                player.action = effect.moveName;
                player.actionTime = effect.actionTime;
                player.castTime = effect.castTime;
                // set move's action time
                if (!player.moves[effect.moveName]) {
                    player.moves[effect.moveName] = {
                        actionTime: 0,
                        cdTime: 0,
                    }
                }
                player.moves[effect.moveName].actionTime = effect.actionTime;
                player.moves[effect.moveName].cdTime = effect.cdTime;
                // deduct move costs
                if (effect.costs) {
                    for (const cost in effect.costs) {
                        player.stats[cost] -= effect.costs[cost];
                    }
                }
                break;
            case mechanics.effectType.physicalDamage:
                let attack = effect.attackMult ? Math.floor(calcAttack(player) * effect.attackMult) : 0;
                if (effect.minAttackDamage && attack < effect.minAttackDamage) {
                    attack = effect.minAttackDamage;
                }
                divinity = effect.divinityMult ? player.stats.divinity * effect.divinityMult : 0;
                damageMult = calcPhysicalDamageMult(player, enemy, effect);
                attack *= damageMult;
                divinity *= damageMult;
                damage = attack + divinity;
                shieldPct = (enemy.stats.shield > 0 & enemy.stats.shieldHealth > 0) ? enemy.stats.shield * enemy.stats.shieldHealth / enemy.stats.shieldMaxHealth / 100 : 0;
                damageAfterShield = damage * (1 - shieldPct);
                damageAfterArmor = damageAfterShield / (1 + calcArmor(enemy) / 100);
                shieldDamage = damage * calcPhysicalShieldDamageMult(player, enemy, effect);
                if (effect.shieldMult)
                    shieldDamage *= effect.shieldMult;

                const physicalDamageFromAttack = attack * damageAfterArmor / damage;
                const physicalDamageFromDivinity = divinity * damageAfterArmor / damage;
                actionValues.physicalDamageFromAttack += physicalDamageFromAttack;
                actionValues.physicalDamageFromDivinity += physicalDamageFromDivinity;
                actionValues.physicalDamage += damageAfterArmor;
                events.push({
                    type: effect.type,
                    verb: effect.verb,
                    physicalDamage: damageAfterArmor,
                    physicalDamageFromAttack,
                    physicalDamageFromDivinity,
                    shieldedDamage: Math.min(shieldDamage, enemy.stats.shieldHealth),
                    shieldBreak: enemy.stats.shieldHealth > 0 && shieldDamage >= enemy.stats.shieldHealth,
                })
                enemy.stats.health -= damageAfterArmor;
                enemy.stats.shieldHealth = Math.max(0, enemy.stats.shieldHealth - shieldDamage);

                eventsPost = postPhysicalDamage(player, enemy, effect, damageAfterArmor);
                if (eventsPost) {
                    events.push(...eventsPost);
                }
                break;
            case mechanics.effectType.magicalDamage:
                //here
                psyche = effect.psycheMult ? Math.floor(calcPsyche(player) * effect.psycheMult) : 0;
                if (effect.minPsycheDamage && psyche < effect.minPsycheDamage) {
                    psyche = effect.minPsycheDamage;
                }
                divinity = effect.divinityMult ? player.stats.divinity * effect.divinityMult : 0;
                damageMult = calcPsycheDamageMult(player, enemy, effect);
                psyche *= damageMult;
                divinity *= damageMult;

                //recoil from player's own shield
                const recoilPct = (player.stats.shield > 0 & player.stats.shieldHealth > 0) ? player.stats.shield * player.stats.shieldHealth / player.stats.shieldMaxHealth / 100 : 0;
                if (recoilPct > 0) {
                    const recoilDamage = (psyche + divinity) * recoilPct;
                    psyche *= (1 - recoilPct);
                    divinity *= (1 - recoilPct);
                    events.push({
                        type: mechanics.effectType.recoil,
                        recoilDamage,
                    })
                    player.stats.health -= recoilDamage;
                    eventsPost = postRecoilDamage(player, enemy, effect, recoilDamage);
                    if (eventsPost) {
                        events.push(...eventsPost);
                    }
                }

                damage = psyche + divinity;
                shieldPct = (enemy.stats.shield > 0 & enemy.stats.shieldHealth > 0) ? enemy.stats.shield * enemy.stats.shieldHealth / enemy.stats.shieldMaxHealth / 100 : 0;
                damageAfterShield = damage * (1 - shieldPct);
                const damageAfterPsyche = damageAfterShield / (1 + calcPsyche(enemy) / 100);
                shieldDamage = damage * calcMagicalShieldDamageMult(player, enemy, effect);
                if (effect.shieldMult)
                    shieldDamage *= effect.shieldMult;

                const magicalDamageFromPsyche = psyche * damageAfterPsyche / damage;
                const magicalDamageFromDivinity = divinity * damageAfterPsyche / damage;
                actionValues.magicalDamageFromPsyche += magicalDamageFromPsyche;
                actionValues.magicalDamageFromDivinity += magicalDamageFromDivinity;
                actionValues.magicalDamage += damageAfterPsyche;
                if (damageAfterPsyche > 0)
                    events.push({
                        type: effect.type,
                        verb: effect.verb,
                        magicalDamage: damageAfterPsyche,
                        magicalDamageFromPsyche,
                        magicalDamageFromDivinity,
                        shieldedDamage: Math.min(shieldDamage, enemy.stats.shieldHealth),
                        shieldBreak: enemy.stats.shieldHealth > 0 && shieldDamage >= enemy.stats.shieldHealth,
                    })
                enemy.stats.health -= damageAfterPsyche;
                enemy.stats.shieldHealth = Math.max(0, enemy.stats.shieldHealth - shieldDamage);

                eventsPost = postMagicalDamage(player, enemy, effect, damageAfterPsyche);
                if (eventsPost) {
                    events.push(...eventsPost);
                }
                break;
            case mechanics.effectType.increaseDivinity:
                if (actionValues.divinityPrev === null) {
                    actionValues.divinityPrev = rawDivinity(player);
                }
                divinityPrev = actionValues.divinityPrev;
                player.stats.divinity += effect.amount;
                player.stats.divinity = Math.min(player.stats.divinity, 100);
                actionValues.divinityPost = rawDivinity(player);
                events.push({
                    type: 'statChange',
                    stat: mechanics.stat.divinity,
                    prev: divinityPrev,
                    post: actionValues.divinityPost,
                    username: player.username,
                })
                break;
            case mechanics.effectType.reduceDivinity:
                if (actionValues.divinityPrev === null) {
                    actionValues.divinityPrev = rawDivinity(player);
                }
                divinityPrev = actionValues.divinityPrev;
                player.stats.divinity -= effect.amount;
                actionValues.divinityPost = rawDivinity(player);
                events.push({
                    type: 'statChange',
                    stat: mechanics.stat.divinity,
                    prev: divinityPrev,
                    post: actionValues.divinityPost,
                    username: player.username,
                })
                break;
            case mechanics.effectType.setDivinity:
                if (effect.amount < player.stats.divinity) {
                    events.push(...resolveEffects(player, enemy, [{
                        type: mechanics.effectType.reduceDivinity,
                        amount: player.stats.divinity - effect.amount,
                    }]));
                } else if (effect.amount > player.stats.divinity) {
                    events.push(...resolveEffects(player, enemy, [{
                        type: mechanics.effectType.increaseDivinity,
                        amount: effect.amount - player.stats.divinity,
                    }]));
                }
            case mechanics.effectType.stealGold:
                const stealAmount = effect.specialAmount ? calcSpecial(player, enemy, actionValues, effect) : effect.amount;
                player.stats.gold += stealAmount;
                enemy.stats.gold -= stealAmount;
                actionValues.goldStolen += stealAmount;
                events.push({
                    type: effect.type,
                    stealAmount,
                })
                break;
            case mechanics.effectType.heal:
                const healAmount = effect.specialAmount ? calcSpecial(player, enemy, actionValues, effect) : effect.amount;
                player.stats.health += healAmount;
                player.stats.health = Math.min(player.stats.health, player.stats.maxHealth);
                events.push({
                    type: effect.type,
                    healAmount,
                })
                break;
            case mechanics.effectType.restoreMana:
                const manaAmount = effect.specialAmount ? calcSpecial(player, enemy, actionValues, effect) : effect.amount;
                player.stats.mana += manaAmount;
                player.stats.mana = Math.min(player.stats.mana, player.stats.maxMana);
                events.push({
                    type: effect.type,
                    manaAmount,
                })
                break;
            case mechanics.effectType.burnMana:
                const burnAmount = Math.min(effect.specialAmount ? calcSpecial(player, enemy, actionValues, effect) : effect.amount, enemy.stats.mana);
                enemy.stats.mana -= burnAmount;
                events.push({
                    type: effect.type,
                    burnAmount,
                })
                break;
            case mechanics.effectType.equip:
                if (actionValues.attackPrev === null) {
                    actionValues.attackPrev = calcAttack(player);
                }
                if (actionValues.armorPrev === null) {
                    actionValues.armorPrev = calcArmor(player);
                }
                if (actionValues.psychePrev === null) {
                    actionValues.psychePrev = calcPsyche(player);
                }
                attackPrev = actionValues.attackPrev;
                armorPrev = actionValues.armorPrev;
                psychePrev = actionValues.psychePrev;
                player.equipment[effect.slot] = { ...effect };
                actionValues.attackPost = calcAttack(player);
                actionValues.armorPost = calcArmor(player);
                actionValues.psychePost = calcPsyche(player);
                setPassives(player);
                if (attackPrev !== actionValues.attackPost || effect.attack) {
                    events.push({
                        type: 'statChange',
                        stat: mechanics.stat.attack,
                        prev: attackPrev,
                        post: actionValues.attackPost,
                        username: player.username,
                    })
                }
                if (armorPrev !== actionValues.armorPost || effect.armor) {
                    events.push({
                        type: 'statChange',
                        stat: mechanics.stat.armor,
                        prev: armorPrev,
                        post: actionValues.armorPost,
                        username: player.username,
                    })
                }
                if (psychePrev !== actionValues.psychePost || effect.psyche) {
                    events.push({
                        type: 'statChange',
                        stat: mechanics.stat.psyche,
                        prev: psychePrev,
                        post: actionValues.psychePost,
                        username: player.username,
                    })
                }
                if (effect.passives) {
                    for (const passive of effect.passives) {
                        events.push({
                            type: 'gainPassive',
                            passive,
                        })
                    }
                }
                break;
            case mechanics.effectType.gainPassive:
                const equipToEnchant = player.equipment[effect.slot];
                if (equipToEnchant) {
                    if (!equipToEnchant.passives) {
                        equipToEnchant.passives = [];
                    }
                    // check for duplicates
                    if (!equipToEnchant.passives.find(p => p.name === effect.passive.name)) {
                        equipToEnchant.passives.push(effect.passive);
                        if (effect.alignment) {
                            equipToEnchant.alignment = effect.alignment;
                        }
                        setPassives(player);
                        events.push({
                            type: 'gainPassive',
                            passive: effect.passive,
                        })
                    }
                }
                break;
            case mechanics.effectType.givePassive:
                const enemyEquipToEnchant = enemy.equipment[effect.slot];
                if (enemyEquipToEnchant) {
                    if (!enemyEquipToEnchant.passives) {
                        enemyEquipToEnchant.passives = [];
                    }
                    // check for duplicates
                    if (!enemyEquipToEnchant.passives.find(p => p.name === effect.passive.name)) {
                        enemyEquipToEnchant.passives.push(effect.passive);
                        if (effect.alignment)
                            enemyEquipToEnchant.alignment = effect.alignment;
                        setPassives(enemy);
                        events.push({
                            type: 'opponentPassive',
                            passive: effect.passive,
                        })
                    }
                }
                break;
            case mechanics.effectType.gainStatus:
                const newStatus = {
                    name: effect.status,
                    duration: effect.duration,
                    startTime: Date.now(),
                    endTime: Date.now() + effect.duration * 1000,
                }
                player.statuses.push(newStatus)
                events.push({
                    type: effect.type,
                    ...newStatus,
                })
                break;
            case mechanics.effectType.shield:
                // shield protection = 2x divinity, but not more than 100
                // shield health = 10x psyche
                psyche = calcPsyche(player)
                player.stats.shield = Math.min(calcDivinity(player) * 0.8, 100);
                player.stats.shieldMaxHealth = psyche * 10;
                player.stats.shieldHealth = psyche * 10;
                events.push({
                    type: effect.type,
                    shield: player.stats.shield,
                    shieldMaxHealth: player.stats.shieldMaxHealth,
                    shieldHealth: player.stats.shieldHealth,
                    alignment: player.alignment,
                })
                break;
            case mechanics.effectType.dropShield:
                player.stats.shield = 0;
                player.stats.shieldMaxHealth = 1;
                player.stats.shieldHealth = 0;
                events.push({
                    type: effect.type,
                })
            default:
                break;
        }
    }
    return events;
}

export default {
    playerMeetsBaseRequirements,
    playerMeetsRequirements,
    playerCanCast,
    castMove,
    resolveEffects,
    calcAttack,
    calcArmor,
    calcPsyche,
    calcDivinity,
}