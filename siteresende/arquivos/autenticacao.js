var currentUser
let uploadFoto
let botaoVerifica = document.getElementById('verificar')
let verificaRef = firebase.database().ref('ServidorResende/verificacao')
let contaRef = firebase.database().ref('ServidorResende/contas/')
let storagePhotoRef = firebase.storage().ref('user')

var tituloModal = document.getElementById('tituloModal')
var corpoModal = document.getElementById('corpoModal')
var botoesModal = document.getElementById('botoesModal')

document.addEventListener('DOMContentLoaded', initApp)
function telaLogin() {
    var ui = new firebaseui.auth.AuthUI(firebase.auth())
    var config = {
        callbacks: {
            signInSuccessWithAuthResult: function(authResult) {
                contaRef.child(authResult.user.email.replaceAll('@', '-').replaceAll('.', '_') + '/email').set(authResult.user.email).then(function() {
                    contaRef.child(authResult.user.email.replaceAll('@', '-').replaceAll('.', '_') + '/nome').set(authResult.user.displayName).then(function() {
                        window.location.reload()
                    })
                })
                return false
            }
        }, 
        signInOptions: [
            {
                provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                customParameters: {
                    // Forces account selection even when one account
                    // is available.
                    prompt: 'select_account'
                }
            },
            {
                provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
                requireDisplayName: true
            }
            
        ],
        signInFlow: 'popup'
    }
    ui.start('#firebaseui-auth', config)  
}
let colunaPrincipal = document.getElementById('logado')
let emailDisplay = document.getElementById('email')
let nomeDisplay = document.getElementById('nome')
let emailVerifDisplay = document.getElementById('emailVerificado')
function initApp() {
    let foto = document.getElementById('foto')
    firebase.auth().onAuthStateChanged((usuario) => {
        if(usuario) {
            currentUser = usuario
            if (usuario.photoURL != null) {
                foto.src = usuario.photoURL
            } else {
                foto.src = 'images/user.png'
            }
            
            emailDisplay.innerText = usuario.email
            nomeDisplay.innerText = usuario.displayName
            if (usuario.emailVerified == true) {
                emailVerifDisplay.innerText = 'Verificado'
                emailVerifDisplay.style.color = 'green'
                botaoVerifica.remove()
            } else {
                emailVerifDisplay.innerText = 'Não verificado'
                emailVerifDisplay.style.color = 'red'
            }
        } else {
            colunaPrincipal.remove()
            telaLogin()

        }
    })
}

function mudarSenha() {
    firebase.auth().sendPasswordResetEmail(currentUser.email).then(() => {
        $('#modal').modal({backdrop: 'static'})
        tituloModal.innerText = 'Atenção'
        corpoModal.innerHTML = 'Foi enviado um e-mail para mudança de senha. Verifique seu e-mail.'
        botoesModal.innerHTML = '<button type="button" class="btn btn-secondary" data-dismiss="modal">Ok</button>'
    })
}

function antesDeDeletar() {
    $('#modal').modal({backdrop: 'static'})
        tituloModal.innerText = 'Tem certeza de que deseja deletar sua conta?'
        corpoModal.innerHTML = 'Sua conta e seus dados serão apagados do Servidor Resende.'
        botoesModal.innerHTML = '<button type="button" class="btn btn-danger" onclick="deletar()">Deletar minha conta</button><button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>'
}

function deletar() {
    if(currentUser) {
        currentUser.delete().then(() => {
            $('#modal').modal({backdrop: 'static'})
            tituloModal.innerText = 'Usuário deletado'
            corpoModal.innerHTML = 'Usuário excluído do Servidor Resende com sucesso.'
            botoesModal.innerHTML = '<button type="button" class="btn btn-secondary" data-dismiss="modal">Ok</button>'
        })
    }
}

function sair() {
    firebase.auth().signOut().then(() => {
        console.log('ByeBye')
    })
}

function verificaEmail() {
    verificaRef.once('value').then(snapshot => {
        if(snapshot.child('pode').val() == 'bloqueado') {
            $('#modal').modal({backdrop: 'static'})
            tituloModal.innerText = 'Verificação bloqueada'
            corpoModal.innerHTML = 'Para verificar o seu e-mail, o administrador deve antes liberar a verificação.'
            botoesModal.innerHTML = '<button type="button" class="btn btn-secondary" data-dismiss="modal">Ok</button>'
        } else {
            firebase.auth().useDeviceLanguage()
            currentUser.sendEmailVerification().then(() => {
                $('#modal').modal({backdrop: 'static'})
                tituloModal.innerText = 'E-mail de verificação enviado'
                corpoModal.innerHTML = 'Abra seu e-mail para verificar seu e-mail no Servidor Resende.'
                botoesModal.innerHTML = '<button type="button" class="btn btn-secondary" data-dismiss="modal">Ok</button>'
            })
            
        }
    })
}
let pegafoto = document.getElementById('pegafoto')
function alteraFoto() {
    pegafoto.click()
}

function enviaFoto() {
    let urlNovaFoto
    uploadFoto = storagePhotoRef.child(currentUser.uid + '/profilePicture').put(pegafoto.files[0])
    $('#modal').modal({backdrop: 'static'})
            tituloModal.innerText = 'Salvando foto'
            corpoModal.innerHTML = '<div class="progress"><div id="myBar" class="progress-bar" role="progressbar" style="width: 25%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">25%</div></div><br><section id="botoesUp"><button class="btn btn-warning" href="#" onclick="pausarUp()">Pausar</button>&nbsp;<button class="btn btn-danger" onclick="cancelarUp()">Cancelar</button><section id="botaoCont"></section></section>'
            botoesModal.innerHTML = '<button type="button" class="btn btn-secondary" data-dismiss="modal">Concluído</button>'
    let barraProgresso = document.getElementById('myBar')
    let sectionBotoes = document.getElementById('botoesUp')
    let sectionBotaoCont = document.getElementById('botaoCont')
    uploadFoto.on('state_changed', upload => {
        if (upload.state == 'running') {
            sectionBotaoCont.innerHTML = ''
            var progresso = Math.round((upload.bytesTransferred / upload.totalBytes) * 100)
            barraProgresso.style.width = progresso + '%'
            barraProgresso.textContent = progresso.toFixed(2) + '%'
        } else if (upload.state == 'paused') {
            sectionBotaoCont = document.getElementById('botaoCont')
            sectionBotaoCont.innerHTML = '<button class="btn btn-primary" onclick="voltaUp()">Continuar Upload</button>'
        }
    }, error => {
        if (error.code != 'storage/canceled') {
            $('#modal').modal({backdrop: 'static'})
            tituloModal.innerText = 'Ocorreu um erro'
            corpoModal.innerHTML = '<h2 class="subtitulo">Mensagem de erro: </h2>' + error.message
            botoesModal.innerHTML = '<button type="button" class="btn btn-secondary" data-dismiss="modal">Ok</button>'
        }
    }, () => {
        uploadFoto.snapshot.ref.getDownloadURL().then(function(url) {
            currentUser.updateProfile({  
                photoURL: url
            })
        })
            corpoModal.innerHTML += 'Upload concluído'
        setTimeout( function() {
            initApp()
        }, 2000 );
    })
    
}

function pausarUp() {
    uploadFoto.pause()
}

function cancelarUp() {
    uploadFoto.cancel()
    fechaModal()
}
function voltaUp() {
    uploadFoto.resume()
}