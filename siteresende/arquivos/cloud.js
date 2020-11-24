var storageRef = firebase.storage().ref('user')
var divArquivos = document.getElementById('arquivos')
function check(logado) {
    if (logado) {
        storageRef = storageRef.child(usuario.uid)
        listaArquivos()
    } else {
        divArquivos.innerHTML = `Você não está logado. Para acessar este recurso você deve logar ou criar sua conta no Servidor Resende. <a href="../login">Clique aqui para ir à área de login/cadastro</a>`
    }
}

function listaArquivos() {
    if (usuario) {
        storageRef.listAll().then(function(res) {
            divArquivos.innerHTML = ''
            c = 0
            i = 0
            res.prefixes.forEach(function(folderRef) {
                console.log(folderRef)
                divArquivos.innerHTML += `<button type="button" class="list-group-item list-group-item-action" onclick="abrePasta(${folderRef.fullPath}, ${c})">${folderRef.name} <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true" style="visibility: hidden;" id="${c}"></span><span id="muted${c}" class="text-muted text-sm-left" style="font-size: small;"></span></button>`
                c++
            })
            res.items.forEach(function(itemRef) {
                console.log(itemRef)
                divArquivos.innerHTML += `<button type="button" class="list-group-item list-group-item-action" onclick="abreArquivo('${itemRef.fullPath}', ${i}, ${itemRef.name})">${itemRef.name} <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true" style="visibility: hidden;" id="arquivo${i}"></span><span id="mutedArquivo${i}" class="text-muted text-sm-left" style="font-size: small;"></span>`
                i++
            })
        })
    } else {
        
    }
}

function abreArquivo(caminho, id, nome) {
    console.log(caminho, id)
    AstNotif.dialog(nome, 
    ``, 
    {fa: "exclamation-circle", positive: "", negative: "", iconSize: 48});

}

function abrePasta(params) {
    
}

function baixarArquivo(caminho) {
    firebase.storage().ref(caminho).getDownloadURL().then(function (urlD) {
        AstNotif.dialog("Aguarde", `<img src="../images/carregamento.gif" width="50px"> <br> Baixando arquivo...<br> O download pode demorar dependendo da sua conexão e do tamanho do arquivo.`, {fa: "exclamation-circle", positive: "", negative: "", iconSize: 48});
        try {
            fetch(urlD).then(resp => resp.blob()).then(blob => {
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.style.display = 'none'
                a.href = url
                a.download = nomeArquivo
                console.log(a)
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.getElementById('ast-dialog-bg').remove()
            }).catch(() => AstNotif.dialog('Erro', 'Um erro inesperado ocorreu', {'negative': ''}))
        } catch (error) {
            console.log(error)
            AstNotif.dialog('Erro', error.message, {'negative': ''})
        }
    })
}