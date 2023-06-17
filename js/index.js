
let currentPlayer;

async function checkIfPlayerIsAvaliable() {
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

function router(target) {
    fetch(`./${target}.html`).then(async (response) => {
        const responseText = await response.text()
        document.getElementById('content').innerHTML = responseText
        checkIfPlayerIsAvaliable()
    }).catch( error => {
        console.log(`Error when routing: ${JSON.stringify(error)}`)
    })
}