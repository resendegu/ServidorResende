var usuario
var coluna1 = document.getElementById('coluna1')
var coluna2 = document.getElementById('coluna2')
var colunaPrincipal = document.getElementById('colunaPrincipal')
var provaRef
var contaRef
var sessaoDoUsuario
var email
var id
var storageRef

function carregando(finish=false) {
    if (finish == true) {
        document.getElementById('carregando').remove()
    } else {
        document.getElementById('carregando').visibility = 'visible'
    }
}
function libera(user) {
    carregando(true)
    usuario = user
    email = user.email.replaceAll('@', '-').replaceAll('.', '_')
    
    contaRef = firebase.database().ref('ServidorResende/contas/' + email + '/')
    var menu = document.getElementById('botoesNavegacao')
    menu.innerHTML = `<a href='login'><div style='float: right;' id="foto-user"><img src="${user.photoURL}" width="40px" height="40px" style="border-radius: 10px;">&nbsp;<div id="name" style='float: right; color: white; vertical-align: middle;'>${user.displayName}<p style="font-size: xx-small;">${user.email}</p></div></div></a>`
    
    verificaConf(true)
}
document.addEventListener("DOMContentLoaded", function() {
    if (location.hash) {
        id = location.hash.substring(1)
        provaRef = firebase.database().ref('ServidorResende/provaonline/ids/' + id)
        storageRef = firebase.storage().ref('provaonline/ids/' + id)
    }
    console.log(id)
})

function semUser() {
    verificaConf(false)
}

function verificaConf(temUser) {
    provaRef.once('value').then(snapshot => {
        if (snapshot.exists() == true) {
            coluna1.style.visibility = 'visible'
            if (snapshot.val().configuracoesProva.modo == 'modoLoginServidor') {
                document.getElementById('modoDaProva').innerHTML = 'Só é permitido executar esta prova caso você esteja logado no Servidor Resende. Caso não esteja logado, <a href="login">Vá para o login/cadastro</a>'
                if (temUser == true) {
                    if (snapshot.val().configuracoesProva.perguntaNome == true) {
                        document.getElementById('perguntaNomeDiv').style.display = 'block'
                    }
                    if (snapshot.val().configuracoesProva.whitelist != false) {
                        
                        let whitelist = snapshot.val().configuracoesProva.whitelist
                        
                        if (whitelist.indexOf(usuario.email) == -1) {
                            colunaPrincipal.remove()
                            abrirModal(
                                'Prova restrita',
                                'Parece que você não permissão para acessar esta prova. Se você acha que isto é um erro, entre em contato com seu professor ou a pessoa que criou esta prova, ou tente logar com outra conta.',
                                'red'
                            )
                        } else {
                            abreSessao('modoLoginServidor')
                        }
                    } else {
                        abreSessao('modoLoginServidor')
                    }
                } else {
                    abrirModal(
                        'Você não está logado',
                        'Parece que você não está logado. Para realizar esta prova é necessário fazer login no servidor.<br><a href="login" class="botaoPadrao">Ir para página de cadastro/login</a>'
                    )
                }
            } else if (snapshot.val().configuracoesProva.modo == 'modoAnonimo') {
                coluna1.style.visibility = 'visible'
                document.getElementById('modoDaProva').innerHTML = 'Esta prova é realizada anonimamente, nenhum dado pessoal será coletado, mesmo que você esteja já logado no Servidor Resende'
                try {
                    document.getElementById('carregando').remove()
                } catch (error) {
                    console.log(error)
                }
                abreSessao('modoAnonimo')
            }
        } else {
            AstNotif.dialog(
                'Prova não encontrada', 
                'Esta prova não foi encontrada no Servidor. Verifique o link e tente novamente',
                {positive: "OK", negative: ""}
            )
        }
        

        
    }) 
    
}
var modoDaProva
function abreSessao(modo) {
    modoDaProva = modo
    if (modo == 'modoLoginServidor') {
        contaRef.child('sessoes/provas/' + id).once('value').then(snapshot => {
            if (snapshot.exists() == true) {
                let sessions = snapshot.val()
                let vezesTerminadas = []
                let vezesNaoterminadas = []
                for (const key in sessions) {
                    if (sessions.hasOwnProperty(key)) {
                        const session = sessions[key];
                        if (session.terminada == false) {
                            vezesNaoterminadas.push(key)
                        } else {
                            vezesTerminadas.push(key)
                        }
                    }
                }
                if (vezesNaoterminadas.length > 0) {
                    abrirModal(
                        'Atenção',
                        `Existe(m) sessão(ões) aberta(s) desta prova que você não terminou. Na lista abaixo estão as sessões que você iniciou. Escolha uma para terminar ou inicie uma nova.
                        <br><br><b>Sessões iniciadas:</b>
                        <div id="sessoes"></div>
                        <br><br>
                        <a class="botaoPadrao" onclick="novaSessao('${modo}')">+ Abrir nova sessão</a>
                        `
                    )
                    let divSessoes = document.getElementById('sessoes')
                    for (const i in vezesNaoterminadas) {
                        if (vezesNaoterminadas.hasOwnProperty(i)) {
                            const sessaoKey = vezesNaoterminadas[i];
                            provaRef.child('sessoes/' + sessaoKey).once('value').then(snapshot2 => {
                                var time = snapshot2.val().time
                                divSessoes.innerHTML += `<a class="botaoPadrao" id="${sessaoKey}" onclick="carregaSessao('${modo}', '${sessaoKey}')">Sessão Iniciada ás ${time.hora}h:${time.min}min:${time.sec}s do dia ${time.dia} de ${mes(time.mes)} de ${time.ano}.</a>`
                            })
                            
                        }
                    }
                } else if (vezesTerminadas.length > 0) {
                    abrirModal(
                        'Atenção',
                        `Você já realizou esta prova ${vezesTerminadas.length} vez(es). Para realizar novamente, basta abrir uma nova sessão.<br><br>
                        <a class="botaoPadrao" onclick="novaSessao('${modo}')">+ Abrir nova sessão</a>
                        `
                    )
                } else {
                    abrirModal(
                        'Atenção',
                        `
                        Clique no botão abaixo para iniciar o teste/prova
                        <br><br>
                        <a class="botaoPadrao" onclick="novaSessao('${modo}')">+ Abrir sessão da prova</a>
                        `
                    )
                }
            } else {
                abrirModal(
                    'Atenção',
                    `
                    Clique no botão abaixo para iniciar o teste/prova
                    <br><br>
                    <a class="botaoPadrao" onclick="novaSessao('${modo}')">+ Abrir sessão da prova</a>
                    `
                )
            }
            
        })
    } else {
        novaSessao(modo)
    }
    
    
}
function mes(mes) {
    switch(mes) {
        case 0:
            return 'Janeiro'
            break
        case 1:
            return 'Fevereiro'
            break
        case 2: 
            return 'Março'
            break
        case 3:
            return 'Abril'
            break
        case 4:
            return 'Maio'
            break
        case 5:
            return 'Junho'
            break
        case 6:
            return 'Julho'
            break
        case 7:
            return 'Agosto'
            break
        case 8:
            return 'Setembro'
            break
        case 9:
            return 'Outubro'
            break
        case 10:
            return 'Novembro'
            break
        case 11:
            return 'Dezembro'
        default:
            return ''
            break
    }
}

function carregaSessao(modo, chave) {
    sessaoDoUsuario = chave
    carregaProva(chave)
    fechaModal()
}

function novaSessao(modo) {
    try {
        fechaModal()
    } catch (error) {
        console.log(error)
    }
    var perguntaNome = document.getElementById('perguntaNome')
    const URL = 'https://worldtimeapi.org/api/ip'
    /**
     * Exemplo de um output usando essa api de Time:
     *  {
    *       abbreviation: "-03"
            client_ip: "201.77.172.54"
            datetime: "2020-09-29T12:21:42.507397-03:00"
            day_of_week: 2
            day_of_year: 273
            dst: false
            dst_from: null
            dst_offset: 0
            dst_until: null
            raw_offset: -10800
            timezone: "America/Sao_Paulo"
            unixtime: 1601392902
            utc_datetime: "2020-09-29T15:21:42.507397+00:00"
            utc_offset: "-03:00"
            week_number: 40
        }
     */
    var dados

        fetch(`${URL}`)
            .then((body) => body.json())
            .then((data) => {
                console.log(data)
                var hora = new Date().getHours()
                var min = new Date().getMinutes()
                var sec = new Date().getSeconds()
                var dia = new Date().getDate()
                var mes = new Date().getMonth()
                var ano = new Date().getFullYear()
                dados = {
                    idProva: id, 
                    email: '',
                    nomeServidor: '',
                    nomeDigitado: '',
                    foto: '',
                    terminada: false,
                    time: {
                        hora: hora,
                        min: min,
                        sec: sec,
                        dia: dia,
                        mes: mes,
                        ano: ano,
                        apiTime: data
                    }
                }
                if (perguntaNome.value != '') {
                    dados.nomeDigitado = perguntaNome.value
                }
                if (modo == 'modoLoginServidor') {
                    dados.email = usuario.email
                    dados.foto = usuario.photoURL
                    dados.nomeServidor = usuario.displayName
                } else if ('modoAnonimo') {
                    dados.email = ''
                    dados.foto = ''
                    dados.nomeServidor = ''
                }
                let emailFormatado
                provaRef.child('sessoes').push(dados).then(snapshot => {
                    sessaoDoUsuario = snapshot.key
                    if (modo == 'modoLoginServidor') {
                        emailFormatado = usuario.email.replaceAll('@', '-').replaceAll('.', '_')
                        provaRef.child('usuarios/' + emailFormatado + '/dados').set({email: usuario.email, foto: usuario.photoURL, nome: usuario.displayName})
                        provaRef.child('usuarios/' + emailFormatado + '/sessoes').push({sessaoKey: sessaoDoUsuario})
                        contaRef.child('sessoes/provas/' + id + '/' + sessaoDoUsuario).set(dados).then(function () {
                            carregaProva(snapshot.key)
                        }).catch(function(error) {
                            abrirModal(
                                'Erro',
                                error.message,
                                'red'
                            )
                            console.log(error)
                        })
                    } else {
                        carregaProva(snapshot.key)
                    }
                    
        
                }).catch(function(error) {
                    abrirModal(
                        'Erro',
                        error.message,
                        'red'
                    )
                    console.log(error)
                })
            })
            .catch((error) => console.error('Erro:', error.message || error))
        
        
}

function nomePessoa(nome) {
    provaRef.child('sessoes/' + sessaoDoUsuario + '/nomeDigitado').set(nome).then(function() {

    }).catch(function(error) {
        abrirModal(
            'Erro',
            error.message,
            'red'
        )
        console.log(error)
    })
}
var questoesObrigatorias = []

function carregaProva(session) {
    let divTermina = document.getElementById('divTermina')
    divTermina.innerHTML = '<a class="botaoPadrao" onclick="terminaSessao()">Finalizar e entregar este teste</a>'
    
    coluna2.style.visibility = 'visible'
    provaRef.child('sessoes/' + session + '/nomeDigitado').once('value').then(nome => {
        document.getElementById('perguntaNome').value = nome.val()
    })
    provaRef.once('value').then(snapshot => {
        document.getElementById('assunto').innerText = snapshot.val().assunto
        document.getElementById('descricao').innerText = snapshot.val().descricao
        var questoes = snapshot.val().questoes
        var prova = document.getElementById('prova')
        prova.innerHTML = ''
        for (const i in questoes) {
            if (questoes.hasOwnProperty(i)) {
                const questao = questoes[i];
                let asteristico = ''
                if (questao.forceAnswer == true) {
                    questoesObrigatorias.push(i)
                    asteristico = '*'
                }
                prova.innerHTML += `
                <div class="questao">
                    <b>Questão ${Number(i) + 1}</b><br>
                    ${questao.label}<label style="color: red;"><b>${asteristico}</b></label><br>
                    <div class="opcoes" id="divOpcoesQst${i}"></div>
                </div>
                <br>
                `
                var opcoes = questao.options
                var tipo = questao.type
                for (const opt in opcoes) {
                    if (opcoes.hasOwnProperty(opt)) {
                        const opcao = opcoes[opt];
                        if (questao.type == 'text') {
                            document.getElementById(`divOpcoesQst${i}`).innerHTML += `
                            <input type="${tipo}" name="opcao${i}" id="opcao${opt}@${i}" class="opcaoField" placeholder="Digite sua resposta aqui..." onchange="opcao('${opcao.value}', this.id, this.type)">
                            `
                            provaRef.child('sessoes/' + session + '/questoes/' + i + '/options/' + opt).once('value').then(option => {
                                if (option.val().answer != undefined) {
                                    document.getElementById(`opcao${opt}@${i}`).value = option.val().answer
                                }
                            })
                        } else {
                            document.getElementById(`divOpcoesQst${i}`).innerHTML += `
                            <input type="${tipo}" name="opcao${i}" id="opcao${opt}@${i}" value="${opcao.label}" class="opcaoField" placeholder="Indique a resposta aqui..." onchange="opcao(this.value, this.id, this.type, this.checked)">&nbsp; <label for="opcao${opt}@${i}">${opcao.label}</label>
                            <br>
                            <div id="upload${opt}@${i}" style="display: none;"></div>
                            `
                            if (tipo != 'radio') {
                                provaRef.child('sessoes/' + session + '/questoes/' + i + '/options/' + opt).once('value').then(option => {
                                    try {
                                        if (tipo == 'checkbox' || tipo == 'file') {
                                            console.log(option.val(), opt, i)
                                            if (option.val().checked != undefined) {
                                                if (option.val().checked == true) {
                                                    document.getElementById(`opcao${opt}@${i}`).checked = true     
                                            } else if (option.val().checked == 'tipoArquivo') {
                                                uploadTemp = document.getElementById(`upload${opt}@${i}`)
                                                uploadTemp.style.display = 'block'
                                                uploadTemp.innerHTML = `<a href="${option.val().link}" target="_blank">Abrir arquivo</a>`
                                            }
                                            }
                                            
                                        } else {
                                            try {
                                                if (option.val().answer == opt) {
                                                    console.log(option.val().answer)
                                                    console.log(opt)
                                                    
                                                } 
                                            } catch (error) {
                                                console.log(error)
                                            }
                                            
                                        }
                                    } catch (error) {
                                        console.log(error)
                                    }
                                    
                                })
                            } else {
                                provaRef.child('sessoes/' + session + '/questoes/' + i + '/answer').once('value').then(radAns => {
                                    if (radAns.val() == opt) {
                                        document.getElementById(`opcao${opt}@${i}`).checked = true
                                    }
                                    
                                })
                            }
                                
                            
                            
                        }
                        
                    }
                }
            }
        }
    })
    document.getElementById('prova').style.visibility = 'visible'
    console.log(questoesObrigatorias)
}
// Refazer essa function opcao né meu querido, pq ta uma bosta
function opcao(resposta, id, type, checked=false) {
    let opc = id.slice(0, id.indexOf('@'))
    let opcNumb = opc.slice(5, opc.length)
    let qst = id.slice(id.indexOf('@') + 1, id.length)
    try {
        if (type == 'radio') {
            provaRef.child('sessoes/' + sessaoDoUsuario + '/questoes/' + qst + '/').set({answer: opcNumb})
        }
            
        if (type == 'checkbox') {
                provaRef.child('sessoes/' + sessaoDoUsuario + '/questoes/' + qst + '/options/' + opcNumb + '/checked').set(checked)
        }
        if (type == 'text') {
            answer = document.getElementById(id).value
            provaRef.child('sessoes/' + sessaoDoUsuario + '/questoes/' + qst + '/options/' + opcNumb + '/answer').set(answer)
        } else if (type == 'file') {
            var arquivo = document.getElementById(id).files[0]
            var divUpload = document.getElementById(`upload${opcNumb}@${qst}`)
            divUpload.style.display = 'block'
            divUpload.innerHTML = 'Fazendo upload...'
            uploadResposta(qst, opcNumb, arquivo, divUpload, id)
        }
    } catch (error) {
        console.log(error)
            provaRef.child('sessoes/' + sessaoDoUsuario + '/questoes/' + qst + '/options/' + opcNumb + '/label').set(resposta)
            if (type == 'radio' || type == 'checkbox') {
                provaRef('sessoes/' + sessaoDoUsuario + '/questoes/' + qst + '/options/' + opcNumb + '/checked').set(checked)
            }
            
    }

    }

function uploadResposta(qst, opcNumb, arquivo, divUpload, id) {
    let uploadTask = storageRef.child(sessaoDoUsuario + '/uploadsdequestoes/' + qst + '/' + opcNumb + '/arquivoresposta').put(arquivo)

        uploadTask.on('state_changed', upload => {

            if (upload.state == 'running') {
                console.log('running')

            } else if (upload.state == 'paused') {
                console.log('paused')
            }
        }, error => {
            abrirModal('Ocorreu um erro', error.code, 'red')
        }, () => {
            uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                console.log('File available at', downloadURL);
                divUpload.innerHTML = '<label><b>Arquivo salvo!</b></label>'
                provaRef.child('sessoes/' + sessaoDoUsuario + '/questoes/' + qst + '/options/' + opcNumb + '/checked').set('tipoArquivo')
                divUpload.innerHTML += `<br><a href="${downloadURL}" target="_blank">Abrir arquivo</a>`
                provaRef.child('sessoes/' + sessaoDoUsuario + '/questoes/' + qst + '/options/' + opcNumb + '/link').set(downloadURL)
                document.getElementById(id).remove()
              });
        })
}

function terminaSessao(termina=false) {
    AstNotif.notify("Aguarde", "Verificando o teste...", "Servidor Resende");
    let libera
    if (document.getElementById('perguntaNome').value == '') {
        AstNotif.dialog(
            'Atenção', 
            'Você não digitou seu nome no início da prova. Para terminar esta sessão é obrigatório colocar o seu nome.',
            {positive: "OK", negative: ""}
        )
    } else {
        if (termina == false) {
            provaRef.once('value').then(teste => {
                let questoes = teste.val().questoes
                let questoesRespondidas = teste.val().sessoes[sessaoDoUsuario].questoes
                if (questoesObrigatorias.length != 0) {
                    for (const key in questoesObrigatorias) {
                        if (questoesObrigatorias.hasOwnProperty(key)) {
                            const qstObKey = questoesObrigatorias[key];
                            try {
                                if (questoesRespondidas[qstObKey] == undefined) {
                                    libera = false
                                    AstNotif.dialog(
                                        'Atenção', 
                                        'Você não respondeu as questões obrigatórias. Verifique e tente novamente.',
                                        {positive: "OK", negative: ""}
                                    )
                                } else {
                                    if (libera == undefined) {
                                        libera = true
                                    }
                                    
                                }
                            } catch (error) {
                                console.log(error)
                                if (error.message == `Cannot read property '${qstObKey}' of undefined`) {
                                    AstNotif.dialog(
                                        'Atenção', 
                                        'Você não respondeu as questões obrigatórias. Verifique e tente novamente.',
                                        {positive: "OK", negative: ""}
                                    )
                                }
                                
                            }
                            
                        }
                    //break
                    }
                    if (libera == true) {
                        abrirModal(
                            'Confirmação',
                            '<h2 class="subtitulo">Você tem certeza que quer terminar esta sessão do seu teste?</h2> <br><br> <a class="botaoPadrao" onclick="terminaSessao(true)">Sim, tenho certeza</a><br><br><a class="botaoPadrao" onclick="fechaModal()">Voltar para o teste</a>'
                        )
                    }
                } else {
                    abrirModal(
                        'Confirmação',
                        '<h2 class="subtitulo">Você tem certeza que quer terminar esta sessão do seu teste?</h2> <br><br> <a class="botaoPadrao" onclick="terminaSessao(true)">Sim, tenho certeza</a><br><br><a class="botaoPadrao" onclick="fechaModal()">Voltar para o teste</a>'
                    )
                }
            }).catch(function(error) {
                AstNotif.dialog(
                    'Erro', 
                    error.message,
                    {positive: "OK", negative: ""}
                )
                console.log(error)
            })
            
            
            
        } else {
            const URL = 'https://worldtimeapi.org/api/ip'

            fetch(`${URL}`)
                .then((body) => body.json())
                .then((data) => {
                    console.log(data)
                    var hora = new Date().getHours()
                    var min = new Date().getMinutes()
                    var sec = new Date().getSeconds()
                    var dia = new Date().getDate()
                    var mes = new Date().getMonth()
                    var ano = new Date().getFullYear()
                    var dados = {
                            hora: hora,
                            min: min,
                            sec: sec,
                            dia: dia,
                            mes: mes,
                            ano: ano,
                            apiTime: data
                        }
                        let divTermina = document.getElementById('divTermina')
                        divTermina.innerHTML += 'Finalizando esta sessão...'
                        document.getElementById('prova').style.visibility = 'hidden'
                        fechaModal()
                        provaRef.child('sessoes/' + sessaoDoUsuario + '/terminada').set(true).then(function () {
                            if (modoDaProva == 'modoLoginServidor') {
                                contaRef.child('sessoes/provas/' + id + '/' + sessaoDoUsuario + '/terminada').set(true).then(function () {
                                    provaRef.child('sessoes/' + sessaoDoUsuario + '/timeEnd').set(dados).then(function() {
                                        computaResultados()
                                    })
                                    
                                }).catch(function(error) {
                                    abrirModal(
                                        'Erro',
                                        error.message,
                                        'red'
                                    )
                                })
                            } else {
                                computaResultados()
                            }
                        }).catch(function (error) {
                            abrirModal(
                                'Erro',
                                error.message,
                                'red'
                            )
                        })
                })
                .catch((error) => console.error('Erro:', error.message || error))
            
            
        }
    }
}

function computaResultados() {
    let optValue
    let optValueErrada
    let resultado = []
    let totalProva = 0
    provaRef.once('value').then(prova => {
        let questoes = prova.val().questoes
        let questoesRespondidas = prova.val().sessoes[sessaoDoUsuario].questoes
        console.log('Questões', questoes)
        console.log('Questões Respondidas', questoesRespondidas)
        
        for (const qst in questoes) {
            optValue = 0
            if (questoes.hasOwnProperty(qst)) {
                const questao = questoes[qst];
                if (questao.type != 'file') {
                    totalProva += Number(questao.value)
                }
                
                console.log(questao.type)
                if (questao.type == 'radio') {
                    try {
                        if (questao.options[questoesRespondidas[qst].answer].checked == 'checked') {
                            console.log(questao.options[questoesRespondidas[qst].answer].checked == 'checked')
                            resultado.push(questao.value)
                            provaRef.child(sessaoDoUsuario + '/questoes/' + qst + '/correta').set(true)
                        }
                    } catch (error) {
                        console.log(error)
                    }
                    
                } else if(questao.type == 'checkbox') {
                    let questoesCertas = 0
                    let questoesErradas = 0
                    for (const opt in questao.options) {
                        if (questao.options.hasOwnProperty(opt)) {
                            const option = questao.options[opt];
                            
                            
                            if (option.checked == 'checked') {
                                ++questoesCertas
                                optValue = questao.value/questoesCertas
                                
                            } else {
                                ++questoesErradas
                                optValueErrada = questao.value/questoesErradas
                                
                            }
                        }
                    }
                           
                            
                     
            } else if (questao.type == 'text') {
                try {
                    console.log(questao.options[0].label == questoesRespondidas[qst].options[0].answer)
                    if (questao.options[0].label == questoesRespondidas[qst].options[0].answer) {
                        resultado.push(questao.value)
                        provaRef.child(sessaoDoUsuario + '/questoes/' + qst + '/options/0/correta').set(true)
                    }
                } catch (error) {
                    console.log(error)
                }
                
            }
            for (const opt in questao.options) {
                if (questao.options.hasOwnProperty(opt)) {
                    const option = questao.options[opt];
                    try {
                        if(questoesRespondidas[qst].options[opt].checked == true && option.checked == 'checked') {
                            resultado.push(optValue)
                            provaRef.child(sessaoDoUsuario + '/questoes/' + qst + '/options/' + opt + '/correta').set(true)
                        } else if(questoesRespondidas[qst].options[opt].checked == true && option.checked == false) {
                            resultado.push(-optValueErrada)
                            provaRef.child(sessaoDoUsuario + '/questoes/' + qst + '/options/' + opt + '/correta').set(false)
                        }
                    } catch (error) {
                        console.log(error)
                    }
                }
            }
        }
        var somaNota = 0
        // Questão
            for (const q in resultado) {
                if (resultado.hasOwnProperty(q)) {
                    const questao = resultado[q];
                    somaNota += Number(questao)
                    console.log('Sua nota:', somaNota.toFixed(2))
                }
            }
        }
    console.log('Resultados:', resultado)
    let textoDeResultado
    if (totalProva == somaNota) {
        textoDeResultado = `
        Esta sessão de prova foi finalizada, e sua prova foi entregue.<br>
        Sua nota: <b>${somaNota.toFixed(2)}</b>/${totalProva} pts.<br>
        Você acertou todas as questões de valor.<br>
        <br>
        <a class="botaoPadrao" onclick="abreSessao('${modoDaProva}')">Realizar prova novamente</a>
        
        `
    } else {
        textoDeResultado = `
        Esta sessão de prova foi finalizada, e sua prova foi entregue.<br>
        Sua nota: <b>${somaNota.toFixed(2)}</b>/${totalProva}.<br>
        Você não acertou todas as questões.<br>
        <br>
        <a class="botaoPadrao" onclick="abreSessao('${modoDaProva}')">Realizar prova novamente</a>
        
        `
    }
    provaRef.child('sessoes/' + sessaoDoUsuario + '/resultados').set({nota: somaNota, totalDaProva: totalProva}).then(function() {

    }).catch(function(error) {
        AstNotif.dialog(
            'Erro', 
            error.message,
            {positive: "OK", negative: ""}
        )
        console.log(error)
    })
    if (modoDaProva != 'modoAnonimo') {
        contaRef.child('sessoes/provas/' + id + '/' + sessaoDoUsuario + '/resultados').set({nota: somaNota, totalDaProva: totalProva}).then(function() {

        }).catch(function(error) {
            AstNotif.dialog(
                'Erro', 
                error.message,
                {positive: "OK", negative: ""}
            )
            console.log(error)
        })
    }
    

    abrirModal(
        'Resultado',
        textoDeResultado
    )
    
        
    }).catch(function(error) {
        AstNotif.dialog(
            'Erro', 
            error.message,
            {positive: "OK", negative: ""}
        )
        console.log(error)
    })
}
