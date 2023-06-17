const ricotteAPIUrl = 'https://ricotte-api.deno.dev/'
const availableMonsterImages = ['greenslime', 'jellyslime', 'punchbag', 'slime']
let isCurrentBattleTutorialBattle = true
let currentPlayer;

async function checkIfPlayerIsAvaliable() {
    const cookies = await window.cookieStore.getAll();
    console.log('Test cookies', cookies)
    currentPlayer = extractPlayerFromCookie()
    const elementsToDisplayWhenLoggedIn = document.getElementsByClassName('onlyloggedin');

    for (const element of elementsToDisplayWhenLoggedIn) {
        if (currentPlayer && currentPlayer.playerId) {
            element.classList.remove('hidden')
        } else {
            element.classList.add('hidden')
        }
    }

    const elementsToDisplayWhenLoggedOut = document.getElementsByClassName('onlyloggedout');
    for (const element of elementsToDisplayWhenLoggedOut) {
        if (currentPlayer && currentPlayer.playerId) {
            element.classList.add('hidden')
        } else {
            element.classList.remove('hidden')
        }
    }

    const elementsToDisplayWhenLoggedInPlayerBattle = document.getElementsByClassName('onlyloggedInForPlayerBattle');
    for (const element of elementsToDisplayWhenLoggedInPlayerBattle) {
        if ((currentPlayer && currentPlayer.playerId) || isCurrentBattleTutorialBattle) {
            element.classList.remove('hidden')
        } else {
            element.classList.add('hidden')
        }
    }
}

document.addEventListener('visibilitychange', checkIfPlayerIsAvaliable);

function logout() {
    if (document.cookie) {
        document.cookie = document.cookie + "; expires=Thu, 01 Jan 1970 00:00:00 UTC"
    }
    checkIfPlayerIsAvaliable();
    return false;
}

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
        document.getElementById('attackLogSection').innerHTML += `Attacking opponent monster ${defendingUnit.value} with your monster ${attackingUnit.value}<br>`
        const battleId = document.getElementById('battleId').innerHTML
        fetch(`${ricotteAPIUrl}attack/${battleId}/${attackingUnit.value}/${defendingUnit.value}`, createRequestOptions())
            .then((attackResponse) => {
                console.log('Get attacking response with battle', attackResponse)
                return attackResponse.json()
            })
            .then((attackResponseAsJson) => {
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
                        document.getElementById('attackLogSection').innerHTML += `Opponent performs counterattack. Opponent monster ${attackResponseAsJson.counterAttackUnits.counterAttacker.joinNumber} attacks your monster ${attackResponseAsJson.counterAttackUnits.counterTarget.joinNumber}<br>`
                    }

                    // Battle has ended
                    if (attackResponseAsJson.battleStatus && attackResponseAsJson.battleStatus === 1 && attackResponseAsJson.battleWinner) {
                        document.getElementById('battleStatusSection').innerHTML = `<span>Battle Status: ${displayBattleStatus(attackResponseAsJson.battleStatus, attackResponseAsJson.battleWinner)}</span><br>`
                        document.getElementById('attackSection').innerHTML = ''
                    }
                }
            })
            .catch((error) => {
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
        unitImageHtml += `"img/${lowercaseUnitName}.svg" alt="${lowercaseUnitName}"`
    }
    return unitImageHtml + 'class="monsterUnitImage"/>'
}

function isUnitDefeated(unit) {
    return unit && unit.inBattleStatus.hp === 0 ? ' defeated' : ''
}

function displayMonsters(player) {
    if (player && player.unitsInBattle) {
        let playerHTML = '<section class="monsters">'
        for (const unit of player.unitsInBattle) {
            const playerMonsterId = getPlayerMonsterId(player, unit)
            const monsterInfoInTooltip = `Monster info: Name: ${unit.name} Max HP: ${unit.defaultStatus.hp} ATK: ${unit.inBattleStatus.atk} DEF: ${unit.inBattleStatus.def}`
            playerHTML += `<div id="${playerMonsterId}-unit" title="${monsterInfoInTooltip}" class="monsterUnit${isUnitDefeated(unit)}"> ${getImageForUnit(unit)} <br><span id="${playerMonsterId}-entry"> <span id="${playerMonsterId}-name" class="monsterUnitName">${unit.name}</span>   (<span id="${playerMonsterId}-hp" class="monsterUnitHP">${unit.inBattleStatus.hp}</span>/<span id="${playerMonsterId}-defaulthp" class="monsterUnitDefaultHP">${unit.defaultStatus.hp}</span>)</span></div><br>`
        }
        playerHTML += '</section>'
        return playerHTML
    }
}

function preparePlayerAndOpponentData(battleId) {
    if (battleId) {
        fetch(`${ricotteAPIUrl}getBattle/${battleId}`, createRequestOptions())
            .then((getBattleResponse) => {
                console.log('Get response with battle', getBattleResponse)
                return getBattleResponse.json()
            })
            .then((getBattleResponseAsJson) => {
                console.log('Response JSON for created battle is', getBattleResponseAsJson)
                if (getBattleResponseAsJson) {
                    if (getBattleResponseAsJson.battleStatus !== undefined) {
                        document.getElementById('battleStatusSection').innerHTML = `<span>Battle Status: ${displayBattleStatus(getBattleResponseAsJson.battleStatus)}</span><br>`
                    }

                    if (getBattleResponseAsJson.playerTwo) {
                        document.getElementById('opponentSection').innerHTML = `<div>Your opponents monsters:</div><br> ${displayMonsters(getBattleResponseAsJson.playerTwo)}`
                    }

                    if (getBattleResponseAsJson.playerOne) {
                        document.getElementById('playerSection').innerHTML = `<div>Your monsters:</div><br> ${displayMonsters(getBattleResponseAsJson.playerOne)}`
                    }

                    document.getElementById('attackSection').innerHTML = `<div>Battle Actions:</div><br>  ${createAttackSection(getBattleResponseAsJson.playerOne, getBattleResponseAsJson.playerTwo)}`
                    document.getElementById('showBattleLogsButton').classList.remove('hidden')
                    document.getElementById('attackLogSection').innerHTML = `<b>Your battle log:<b><br>`
                    
                }
            })
            .catch((error) => {
                console.error('An error ocurred while fetching the battle data for battleId', battleId, error)
            })
    }
}

function createBattle(isTutorialBattle) {
    document.getElementById('errorMessage').innerHTML = ''
    isCurrentBattleTutorialBattle = isTutorialBattle
    checkIfPlayerIsAvaliable()
    console.log(`Create battle with isTutorialBattle ${isCurrentBattleTutorialBattle}`)
    if (!isCurrentBattleTutorialBattle) {
        try {
            currentPlayer = extractPlayerFromCookie()
            if (!currentPlayer) {
                document.getElementById('errorMessage').innerHTML = 'Creating battle failed. Please login and try again!'
                return;
            }
        } catch (error) {
            document.getElementById('errorMessage').innerHTML = `An error occured while trying to get user data. Error is: ${error.message}`
            return;
        }
    }

    const createBattleURL = getCreateBattleURL(isCurrentBattleTutorialBattle);
    if (!createBattleURL) {
        document.getElementById('errorMessage').innerHTML = 'Creating battle failed. Creating battleURL failed!'
    } else {
        fetch(createBattleURL, createRequestOptions())
            .then((createBattleResponse) => {
                console.log('Get response with battleId', createBattleResponse)
                return createBattleResponse.json()
            })
            .then((createBattleResponseAsJson) => {
                console.log('Response JSON for created battleId is', createBattleResponseAsJson)
                if (createBattleResponseAsJson && createBattleResponseAsJson.battleId) {
                    // Add battleId to the battle info
                    document.getElementById('battleIdInfo').innerHTML = `<br>(Your battleId is: <span id="battleId">${createBattleResponseAsJson.battleId}</span>)`
                    preparePlayerAndOpponentData(createBattleResponseAsJson.battleId)

                } else {
                    console.error('Cannot extract battleId from createBattleResponseAsJson', createBattleResponseAsJson)
                }
            })
            .catch((error) => {
                console.error('An error ocurred while creating a battle', error)
            })
    }
}

function getCreateBattleURL(isTutorialBattle) {
    if (isTutorialBattle) {
        return `${ricotteAPIUrl}createBattle`
    } else if (currentPlayer && currentPlayer.playerId) {
        return `${ricotteAPIUrl}createUserBattle/${currentPlayer.playerId}`
    } else {
        return undefined
    }
}

function extractPlayerFromCookie() {
    const playerCookie = document.cookie?.split('=')[1];
    console.log('PlayerCookie is ' + playerCookie)
    if (playerCookie) {
        try {
            const parsedPlayerCookie = JSON.parse(playerCookie)
            return parsedPlayerCookie
        } catch (error) {
            console.error('An error ocurred while parsing the player token', error.message)
        }
    }
    return undefined
}

function createRequestOptions() {
    if (!isCurrentBattleTutorialBattle && currentPlayer && currentPlayer.accessToken) {
        return {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentPlayer.accessToken}`,
            }
        }
    }
    return { method: 'GET' }
}

function showBattleLogs() {
    document.getElementById('attackLogSection').classList.remove('hidden')
    document.getElementById('showBattleLogsButton').classList.add('hidden')
}