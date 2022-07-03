const ricotteAPIUrl='https://ricotte-api.deno.dev/'
const availableMonsterImages = ['greenslime', 'jellyslime', 'punchbag', 'slime']

function getPlayerMonsterId(player, unit) {
    return `${player.playerId}-${unit.joinNumber}`
}

function updateMonsterHP(player) {
    console.log('Update Monster HP', JSON.stringify(player))
    if (player && player.unitsInBattle) {
        for (const unit of player.unitsInBattle) {
            const playerMonsterId = getPlayerMonsterId(player, unit)
            document.getElementById(`${playerMonsterId}-hp`).innerHTML = `HP: ${unit.inBattleStatus.hp}`
            if (unit.inBattleStatus.hp === 0) {
                document.getElementById(`${playerMonsterId}-unit`).className = 'monsterUnit defeated'
            } 
        }
    }
}

function attack() {
    const attackingUnit = document.querySelector('input[name="attacker"]:checked');
    const defendingUnit = document.querySelector('input[name="defender"]:checked');
    if (attackingUnit && defendingUnit) {
        document.getElementById('attackLogSection').innerHTML += `Attacking oponent monster ${defendingUnit.value} with your monster ${attackingUnit.value}<br>`
        const battleId = document.getElementById('battleId').innerHTML
        fetch( `${ricotteAPIUrl}attack/${battleId}/${attackingUnit.value}/${defendingUnit.value}`)
        .then( (attackResponse) => {
            console.log('Get attacking response with battle', attackResponse)
            return attackResponse.json()
        })
        .then( (attackResponseAsJson) => {
            console.log('Response JSON for attack battle is', attackResponseAsJson)
            // Refresh battle!
            if (attackResponseAsJson.error) {
                document.getElementById('attackLogSection').innerHTML += `Attack failed with error: ${JSON.stringify(attackResponseAsJson.error)}<br>`
            } else if (attackResponseAsJson.playerOne && attackResponseAsJson.playerTwo) {
                if (attackResponseAsJson.playerTwo) {
                    updateMonsterHP(attackResponseAsJson.playerTwo)
                }

                if (attackResponseAsJson.playerOne) {
                    updateMonsterHP(attackResponseAsJson.playerOne)
                }

                // Add counterattack log
                if (attackResponseAsJson.counterAttackUnits && attackResponseAsJson.counterAttackUnits.counterAttacker && attackResponseAsJson.counterAttackUnits.counterTarget) {
                    document.getElementById('attackLogSection').innerHTML += `Opponent performs counterattack. Opponent monster ${attackResponseAsJson.counterAttackUnits.counterAttacker.joinNumber} attacks your monster ${ attackResponseAsJson.counterAttackUnits.counterTarget.joinNumber}<br>`
                }

                // Battle has ended
                if (attackResponseAsJson.battleStatus && attackResponseAsJson.battleStatus === 1 && attackResponseAsJson.battleWinner ) {
                   document.getElementById('battleStatusSection').innerHTML = `<h2>Battle Status:</h2> ${displayBattleStatus(attackResponseAsJson.battleStatus, attackResponseAsJson.battleWinner)}`
                   document.getElementById('attackSection').innerHTML = ''
                }
            }
        })
        .catch( (error) => {
            console.error('An error ocurred while creating a battle', error)
        })
    
    
    } else if (attackingUnit) {
        document.getElementById('attackLogSection').innerHTML += "Please select a defending monster!<br>"
    } else if (defendingUnit) {
        document.getElementById('attackLogSection').innerHTML += "Please select an attacking monster!<br>"
    } else {
        document.getElementById('attackLogSection').innerHTML += "Please select an attacking and defending monster!<br>"
    }
}

function createAttackSection(player, opponent) {
    let attackSectionHTML = '<div id="attackSectionPanel">'

    if (player && player.unitsInBattle) {
        attackSectionHTML += '<div><span>Attacking unit (player)</span><br>'
        for (const unit of player.unitsInBattle) {
            attackSectionHTML += `<div class="monsterSelection" ><input type="radio" id="attacker${unit.joinNumber}" name="attacker" value="${unit.joinNumber}">
            <label for="attacker${unit.joinNumber}"> ${unit.joinNumber}-${unit.name}</label></div>`
        }
    }

    attackSectionHTML += '</div>'

    if (opponent && opponent.unitsInBattle) {
        attackSectionHTML += '<div><span>Defending unit (opponent)</span><br>'
        for (const unit of opponent.unitsInBattle) {
            attackSectionHTML += `<div class="monsterSelection" ><input type="radio" id="defender${unit.joinNumber}" name="defender" value="${unit.joinNumber}">
            <label for="defender${unit.joinNumber}"> ${unit.joinNumber}-${unit.name}</label></div>`
        }
    }

    attackSectionHTML += '</div><button id="attackButton" onclick="attack()">Attack</button></div>'
    return attackSectionHTML
}

function displayBattleStatus(battleStatusAsNumber, winner = undefined) {
    switch (battleStatusAsNumber) {
        case 0:
            return "ACTIVE"
        case 1:
            return `ENDED - The winner is: ${winner.name}` 
        default:
            return "UNKNOWN"
    }
}

function getImageForUnit(unit) {
    let unitImageHtml = '<img src='
    let lowercaseUnitName = unit.name.toLowerCase()
    if (!availableMonsterImages.includes(lowercaseUnitName)) {
        lowercaseUnitName = 'placeholder'
    }

    if (unit && unit.name) {
        unitImageHtml += `"img/${lowercaseUnitName}.svg"`
    }
    return unitImageHtml + 'class="monsterUnitImage"/>'
}

function isUnitDefeated(unit) {
    return  unit && unit.inBattleStatus.hp === 0 ? ' defeated' : ''
}

function displayMonsters(player) {
    if (player && player.unitsInBattle) {
        let playerHTML = '<section class="monsters">'
        for (const unit of player.unitsInBattle) {
            const playerMonsterId = getPlayerMonsterId(player, unit)
            playerHTML += `<div id="${playerMonsterId}-unit" class="monsterUnit${isUnitDefeated(unit)}"> ${getImageForUnit(unit)} <div id="${playerMonsterId}-name" class="monsterUnitName">Name: ${unit.name}</div><div id="${playerMonsterId}-hp" class="monsterUnitHP">HP: ${unit.inBattleStatus.hp}</div><div id="${playerMonsterId}-atk" class="monsterUnitATK">ATK: ${unit.inBattleStatus.atk}</div><div id="${playerMonsterId}-def" class="monsterUnitDEF">DEF: ${unit.inBattleStatus.def}</div></div><br>` 
        }

        playerHTML += '</section>'
        return playerHTML
    }
}

function preparePlayerAndOpponentData(battleId) {
    if (battleId) {
        fetch( `${ricotteAPIUrl}getBattle/${battleId}`)
        .then( (getBattleResponse) => {
            console.log('Get response with battle', getBattleResponse)
            return getBattleResponse.json()
        })
        .then( (getBattleResponseAsJson) => {
            console.log('Response JSON for created battle is', getBattleResponseAsJson)
            if (getBattleResponseAsJson) {
                if (getBattleResponseAsJson.battleStatus !== undefined ) {
                    document.getElementById('battleStatusSection').innerHTML = `<h2>Battle Status:</h2> ${displayBattleStatus(getBattleResponseAsJson.battleStatus)}`
                }

                if (getBattleResponseAsJson.playerTwo) {
                    document.getElementById('opponentSection').innerHTML = `<h2>Your opponents monsters:</h2> ${displayMonsters(getBattleResponseAsJson.playerTwo)}`
                }

                if (getBattleResponseAsJson.playerOne) {
                    document.getElementById('playerSection').innerHTML = `<h2>Your monsters:</h2> ${displayMonsters(getBattleResponseAsJson.playerOne)}`
                }

                document.getElementById('attackSection').innerHTML = `<h2>Battle Actions:</h2>  ${createAttackSection(getBattleResponseAsJson.playerOne, getBattleResponseAsJson.playerTwo)}` 

                document.getElementById('attackLogSection').innerHTML = `<b>Your battle log:<b><br>`

            }
        })
        .catch( (error) => {
            console.error('An error ocurred while fetching the battle data for battleId', battleId , error)
        })
    }
}

function createBattle() {
    fetch( `${ricotteAPIUrl}createBattle`)
    .then( (createBattleResponse) => {
        console.log('Get response with battleId', createBattleResponse)
        return createBattleResponse.json()
    })
    .then( (createBattleResponseAsJson) => {
        console.log('Response JSON for created battleId is', createBattleResponseAsJson)
        if (createBattleResponseAsJson && createBattleResponseAsJson.battleId) {
            // Add battleId to the battle info
            document.getElementById('battleIdInfo').innerHTML = `(Your battleId is: <span id="battleId">${createBattleResponseAsJson.battleId}</span>)` 
            preparePlayerAndOpponentData(createBattleResponseAsJson.battleId)

        } else {
            console.error('Cannot extract battleId from createBattleResponseAsJson', createBattleResponseAsJson)
        }
    })
    .catch( (error) => {
        console.error('An error ocurred while creating a battle', error)
    })
}