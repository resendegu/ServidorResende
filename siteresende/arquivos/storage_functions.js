function downloadFile(urlD, name) {
    try {
        fetch(urlD)
            .then(resp => resp.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                console.log(url)
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.id = 'downloading'
                // the filename you want
                a.download = name;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.getElementById('ast-dialog-bg').remove()
            })
            .catch((error) => abrirModal('Erro', 'Um erro inesperado ocorreu. Tente novamente. ' + error.message, 'red'))
    } catch (error) {
        console.log(error)
        abrirModal('Erro',
            `<h2 class="subtitulo">Você deve selecionar algum arquivo para ser aberto. Mensagem de erro: ${error.message}</h2>`,
            'red'
        )
    }
}