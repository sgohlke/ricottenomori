const ricotteAPIUrl='https://ricotte-api.deno.dev/'

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
                    document.getElementById('opponentSection').innerHTML = `Your opponents monsters:<br /> ${displayMonsters(attackResponseAsJson.playerTwo)}`
                }

                if (attackResponseAsJson.playerOne) {
                    document.getElementById('playerSection').innerHTML = `Your monsters:<br /> ${displayMonsters(attackResponseAsJson.playerOne)}`
                }

                // Battle has ended
                if (attackResponseAsJson.battleStatus && attackResponseAsJson.battleStatus === 1 && attackResponseAsJson.battleWinner ) {
                   document.getElementById('battleStatusSection').innerHTML = `Battle Status:<br /> ${displayBattleStatus(attackResponseAsJson.battleStatus, attackResponseAsJson.battleWinner)}`
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
    let attackSectionHTML = ''

    if (player && player.unitsInBattle) {
        attackSectionHTML += '<span>Attacking unit (player):<span>'
        for (const unit of player.unitsInBattle) {
            attackSectionHTML += `<input type="radio" id="attacker${unit.joinNumber}" name="attacker" value="${unit.joinNumber}">
            <label for="attacker${unit.joinNumber}"> ${unit.joinNumber}-${unit.name}</label>`
        }
    }

    attackSectionHTML += '<br>'

    if (opponent && opponent.unitsInBattle) {
        attackSectionHTML += '<span>Defending unit (opponent) :<span>'
        for (const unit of opponent.unitsInBattle) {
            attackSectionHTML += `<input type="radio" id="defender${unit.joinNumber}" name="defender" value="${unit.joinNumber}">
            <label for="defender${unit.joinNumber}"> ${unit.joinNumber}-${unit.name}</label>`
        }
    }

    attackSectionHTML += '<br><button onclick="attack()">Attack</button><br />'
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

function displayMonsters(player) {
    if (player && player.unitsInBattle) {
        let playerHTML = ''
        for (const unit of player.unitsInBattle) {
            playerHTML += JSON.stringify(unit) + '<br>' 
        }

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
                    document.getElementById('battleStatusSection').innerHTML = `Battle Status:<br /> ${displayBattleStatus(getBattleResponseAsJson.battleStatus)}`
                }

                if (getBattleResponseAsJson.playerTwo) {
                    document.getElementById('opponentSection').innerHTML = `Your opponents monsters:<br /> ${displayMonsters(getBattleResponseAsJson.playerTwo)}`
                }

                if (getBattleResponseAsJson.playerOne) {
                    document.getElementById('playerSection').innerHTML = `Your monsters:<br /> ${displayMonsters(getBattleResponseAsJson.playerOne)}`
                }

                document.getElementById('attackSection').innerHTML = createAttackSection(getBattleResponseAsJson.playerOne, getBattleResponseAsJson.playerTwo)

                document.getElementById('attackLogSection').innerHTML = `<b>Your battle log:<b><br>`

            }
        })
        .catch( (error) => {
            console.error('An error ocurred while fetching the battle data for battleId', battleId , error)
        })
    }
}

function createBattle() {
    // Create Battle
    console.log('Clicked on createBattle')

    fetch( `${ricotteAPIUrl}createBattle`)
    .then( (createBattleResponse) => {
        console.log('Get response with battleId', createBattleResponse)
        return createBattleResponse.json()
    })
    .then( (createBattleResponseAsJson) => {
        console.log('Response JSON for created battleId is', createBattleResponseAsJson)
        if (createBattleResponseAsJson && createBattleResponseAsJson.battleId) {
            // Add battleId to the battle info
            document.getElementById('battleId').innerHTML = createBattleResponseAsJson.battleId
            preparePlayerAndOpponentData(createBattleResponseAsJson.battleId)

        } else {
            console.error('Cannot extract battleId from createBattleResponseAsJson', createBattleResponseAsJson)
        }
    })
    .catch( (error) => {
        console.error('An error ocurred while creating a battle', error)
    })
}