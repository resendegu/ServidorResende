var link
var nomeNovo
var preLink

var encurtadorRef = firebase.database().ref('ServidorResende/links')
document.addEventListener("DOMContentLoaded", function () {
    if (location.hash) {
        preLink = location.hash.substring(1)
        link = document.getElementById('link')
        link.value = preLink
        geraLink()
    }
})

function geraLink() {
    nomeNovo = document.getElementById('nomeNovo')
    var linkGerado = Math.floor(Math.random() * 0xFFFFFF).toString(20)
    nomeNovo.value = linkGerado

}

function verificaLink() {
    link = document.getElementById('link').value
    nomeNovo = document.getElementById('nomeNovo').value
    if (link.length == 0) {
        AstNotif.notify("Atenção", "Você não passou o link para ser encurtado.", '', {'length': 5000, 'bgcolor': 'red'});
    } else {
        let objeto = {
            nome: link
        }
        encurtadorRef.child(nomeNovo).once('value').then(snapshot => {
            if (snapshot.exists() == true) {
                AstNotif.notify("Desculpe :(", "Este ID já está sendo utilizado em outro link. Tente outro ID. ;)", '', {'length': 7000, 'bgcolor': 'red'});
            } else {
                encurtadorRef.child(nomeNovo).set(objeto).then(() => {
                    AstNotif.dialog("Link curto criado!", `Este é o link curto:<br><a href="https://linkresende.web.app#${nomeNovo}">linkresende.web.app#${nomeNovo}</a>`, {'positive': 'Ok', 'negative': '', 'icon': false});
                })
            }
    
        })
    }
    
}