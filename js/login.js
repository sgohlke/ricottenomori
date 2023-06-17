function login() {
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value

    if (username && password) {
        fetch(`${ricotteAPIUrl}login/`, {
            method: 'POST',
            body: `{"username":"${username}","password":"${password}"}`
        })
            .then((loginResponse) => {
                return loginResponse.json()
            })
            .then((loginResponseAsJson) => {
                if (loginResponseAsJson
                    && loginResponseAsJson.name
                    && loginResponseAsJson.userName
                    && loginResponseAsJson.playerId
                    && loginResponseAsJson.accessToken) {
                    document.cookie = `ricotte-pl=${JSON.stringify(loginResponseAsJson)}`
                    document.getElementById('successMessage').innerHTML = `Your login to your account <b>${username}</b> was successful. You can now create a new battle with it.`
                    document.getElementById('errorMessage').innerHTML = ''
                    document.getElementById('loginFields').classList.add('hidden')
                    document.getElementById('loginButton').classList.add('hidden')
                } else if (loginResponseAsJson && loginResponseAsJson.error) {
                    document.getElementById('errorMessage').innerHTML = `An error occured while logging into the account for user <b>${username}</b>. Error is:<br /><b>${loginResponseAsJson.error}</b>`
                }
            })
            .catch((error) => {
                document.getElementById('errorMessage').innerHTML = `An error occured while logging into the account for user <b>${username}</b>. Error is:<br /><b>${error.message}</b>`
            })
    } else {
        document.getElementById('errorMessage').innerHTML = 'Please fill out all necessary fields before clicking on Login button.'
    }
}
