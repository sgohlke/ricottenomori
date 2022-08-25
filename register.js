const ricotteAPIUrl='https://ricotte-api.deno.dev/'

function register() {
    const playername = document.getElementById('playername').value
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value

    if (playername && username && password) {
        fetch( `${ricotteAPIUrl}register/`, {
            method: 'POST',
            body: `{"playername":"${playername}","username":"${username}","password":"${password}"}`
        })
        .then( (registerResponse) => {
            return registerResponse.json()
        })
        .then( (registerResponseAsJson) => {
            if (registerResponseAsJson && registerResponseAsJson.playerId) {
                document.getElementById('successMessage').innerHTML = `Your account for user <b>${username}</b> was successfully created. You can now login with the provided username and password.`
                document.getElementById('registerFields').classList.add('hidden')
                document.getElementById('registerButton').classList.add('hidden')
            } else if (registerResponseAsJson && registerResponseAsJson.error) {
                document.getElementById('errorMessage').innerHTML = `An error occured while creating an account for user  <b>${username}</b>. Error is:<br /><b>${registerResponseAsJson.error}</b>`
            }
        })
        .catch( (error) => {
            document.getElementById('errorMessage').innerHTML = `An error occured while creating an account for user <b>${username}</b>. Error is:<br /><b>${error.message}</b>`
        })
    } else {
        document.getElementById('errorMessage').innerHTML = 'Please fill out all necessary fields before clicking on Register button.'
    }
}
