var imprimirRef = firebase.storage().ref('/imprimir')

var objArquivos
function listaArquivos() {
    let loadingBtn = document.getElementById('loadingBtn')
    loadingBtn.style.visibility = 'visible'
    let listGroup = document.getElementById('arquivos')
    imprimirRef.listAll().then(function (arquivos) {
        listGroup.innerHTML = ''
        objArquivos = arquivos
        console.log(arquivos)
        let c = 0
        arquivos.items.forEach(function (arquivo) {
            console.log(arquivo)
            listGroup.innerHTML += `<button type="button" class="list-group-item list-group-item-action" onclick="abreOpcoes(${c})">${arquivo.name} <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true" style="visibility: hidden;" id="${c}"></span><span id="muted${c}" class="text-muted text-sm-left" style="font-size: small;"></span></button>`
            pegaMetadados(arquivo, c)
            c++
        })
        loadingBtn.style.visibility = 'hidden'
    })
    
}

function pegaMetadados(arquivo, c) {
    arquivo.getMetadata().then(function (metadata) {
        if (usuario && usuario.email == metadata.customMetadata.email) {
            document.getElementById(`muted${c}`).innerText = ' Este arquivo salvo aqui por você'
        }
    })
}

function abreOpcoes(index) {
    document.getElementById(index).style.visibility = 'visible'
    let file = objArquivos.items[index]
    file.getDownloadURL().then(function (url) {
        AstNotif.dialog(`Arquivo "${file.name}"`, `<a class="btn btn-primary" target="_blank" href="${url}" role="button">Abrir arquivo</a> <br> ou <br> <button type="button" class="btn btn-primary" onclick="baixarArquivo('${url}', '${file.name}')">Baixar arquivo</button>`, {'positive': 'OK', 'negative': '', "icon": false})
        document.getElementById(index).style.visibility = 'hidden'
    })
    file.getMetadata().then(function (metadata) {
        if (usuario && usuario.email == metadata.customMetadata.email) {
            document.getElementById('ast-dialog-message').innerHTML += `<br><br><button type="button" class="btn btn-danger" onclick="apagarArquivo('${metadata.name}')">Deletar arquivo</button>`
        }
    })
}

function baixarArquivo(urlDownload, nomeArquivo) {
    document.getElementById('ast-dialog-bg').remove()
    AstNotif.dialog("Aguarde", `<img src="./images/carregamento.gif" width="50px"> <br> Baixando arquivo...<br> O download pode demorar dependendo da sua conexão e do tamanho do arquivo.`, {fa: "exclamation-circle", positive: "", negative: "", iconSize: 48});
    try {
        fetch(urlDownload).then(resp => resp.blob()).then(blob => {
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
}

function apagarArquivo(nome) {
    document.getElementById('ast-dialog-bg').remove()
    imprimirRef.child(nome).delete().then(function() {
        AstNotif.notify('Sucesso', nome + ' foi apagado com sucesso!')
        listaArquivos()
    }).catch(function(error) {
        console.log(error)
        AstNotif.dialog('Erro', error.message)
    })
}

function check(status) {
    if (status) {
        document.getElementById('drop-area').style.visibility = 'visible'
    } else {
        document.getElementById('drop-area').remove()
    }
}

// Drag and Drop
let dropArea = document.getElementById('drop-area')

;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false)
  })

function preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
}

;['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false)
  })
  
  ;['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false)
  })
  
  function highlight(e) {
    dropArea.classList.add('highlight')
  }
  
  function unhighlight(e) {
    dropArea.classList.remove('highlight')
  }
  function handleDrop(e) {
    console.log(e)
  let dt = e.dataTransfer
  let files = dt.files

  handleFiles(files)
}
dropArea.addEventListener('drop', handleDrop, false)

function handleFiles(files) {
    ([...files]).forEach(uploadFile)
  }

function uploadFile(file) {
    console.log(file)
    console.log(usuario)
    let metadata = {
        customMetadata: {
            'email': usuario.email
        }
    }
    var uploadTask = imprimirRef.child(file.name).put(file, metadata)
        // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
    function(snapshot) {
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    let progressBar = document.getElementById('progress')
    var progress = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(2);
    console.log('Upload is ' + progress + '% done');
    progressBar.style.width = progress + '%'
    progressBar.innerText = progress + '%'
    switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
        console.log('Upload is paused');
        break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
        console.log('Upload is running');
        AstNotif.toast('Enviando arquivo')
        break;
    }
    }, function(error) {

    // A full list of error codes is available at
    // https://firebase.google.com/docs/storage/web/handle-errors
    switch (error.code) {
    case 'storage/unauthorized':
        // User doesn't have permission to access the object
        break;

    case 'storage/canceled':
        // User canceled the upload
        break;


    case 'storage/unknown':
        // Unknown error occurred, inspect error.serverResponse
        break;
    }
    }, function() {
    // Upload completed successfully, now we can get the download URL
    AstNotif.notify("Sucesso", 'Arquivo salvo com sucesso!', "<i>De Servidor Resende</i>", {'length': 6000})
    listaArquivos()
    document.getElementById('progress').style.width = '0%'
    document.getElementById('progress').innerText = '0%'
    });
}


  
  


  