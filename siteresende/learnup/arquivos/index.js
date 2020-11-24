firebase.auth().onAuthStateChanged((user) => {
    let dados = {
        email: user.email.replaceAll('@', '-').replaceAll('.', '_'),
        uid: user.uid
    }
    fetch('https://us-central1-guresende.cloudfunctions.net/verificadorDeAcesso', {
        body: JSON.stringify(dados),
        method: 'POST',
        mode: 'no-cors'
    }).then(response => {
        console.log(response)
    }).catch(error => {
        console.log(error)
    })
})
