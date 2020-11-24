var databaseRef = firebase.database().ref('ServidorResende/amongus/')

function entraSala(sala=undefined, adm=false) {
    if (sala == undefined) {
        sala = document.getElementById('codEntrar').value
    }
    let telaInicial = document.getElementById('telaInicial')
    let telaSala = document.getElementById('telaSala')
    let imgLogo = document.getElementById('imgLogo')
    databaseRef.child(`salas/${sala}`).once('value').then(snapshot => {
        if (snapshot.exists()) {
            let dadosSala = snapshot.val()
            imgLogo.style.width = '25%'
            telaInicial.style.display = 'none'
            telaSala.style.display = 'block'
            document.getElementById('mostraCod').innerText = sala
        } else {
            document.getElementById('textoErro').innerHTML = 'Esta sala não existe'
            $('#erros').modal('show')
        }
        
    }).catch(function (error) {
        document.getElementById('textoErro').innerHTML = 'Mensagem de erro: ' + error.message
        $('#erros').modal('show')
        console.log(error)
    })
}