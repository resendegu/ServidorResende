var usuarioAtual

function verificaInicial(caminho) {
    try {
        carregando()
    } catch (error) {
        console.log(error)
    }
    
    firebase.auth().onAuthStateChanged((usuario) => {
        if (usuario) {
            usuarioAtual = usuario
            status = 'true'
            bloqueia(caminho, status, usuario.emailVerified)
        } else {
            status = 'false'
            bloqueia(caminho, status)
        }
    })
}

document.addEventListener("DOMContentLoaded", function () {
    verificaInicial(window.location.pathname)
})

function bloqueia(caminho, status, email = false) {


    if (caminho == '/' && status == 'false' || caminho == '/index.html' && status == 'false') {
        document.getElementById('coluna2').innerHTML = '<h2 class="subtitulo">Você deve estar logado para ter acesso ás funções abertas de vídeo-chamadas</h2>'
    }
    if (caminho == '/' && status == 'true' || caminho == '/index.html' && status == 'true') {
        abrirModal(
            'Bem-vindo (a) ' + usuarioAtual.displayName + '!',
            'Você está logado com ' + usuarioAtual.email + '<br><br><a href="my" class="botaoPadrao">Ir para o My Drive</a>'
        )
    }
    if (caminho == '/my' && status == 'false') {
        let colunaPrincipal = document.getElementById('colunaPrincipal')
        colunaPrincipal.innerHTML = ''
        abrirModal(
            'Você não está logado',
            '<h2 class="subtitulo">Para acessar arquivos pessoais, e outros serviços do servidor, você deve estar logado em sua conta.</h2>Caso não tenha uma conta, clique no botão para fazer login ou se cadastrar<br><a href="login" class="botaoPadrao">Fazer login ou cadastre-se</a>'
        )
    }
    if (caminho == '/my' && status == 'true') {
        pegarUser(usuarioAtual)
    }
    if (caminho == '/imprimir' && status == 'true') {
        liberaBotaoApagar(usuarioAtual)
    }
    if (caminho == '/karaoke' && status == 'true' && email == true) {
        liberaBotaoApagar(usuarioAtual)
    }
    if (caminho == '/provaonline' && status == 'true') {
        libera(usuarioAtual)
    }
    if (caminho == '/provaonline' && status == 'false') {
        naoLibera()
    }
    if (caminho == '/editorprova' && status == 'true') {
        libera(usuarioAtual)
    }
    if (caminho == '/teste' && status == 'true') {
        libera(usuarioAtual)
    }
    if (caminho == '/teste' && status == 'false') {
        semUser()
    }
    if (caminho == '/provainfo' && status == 'true') {
        libera(usuarioAtual)
    }
}