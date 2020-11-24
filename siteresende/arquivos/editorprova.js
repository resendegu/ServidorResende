var usuario
var contaRef = firebase.database().ref('/ServidorResende/contas/')
var provaRef = firebase.database().ref('/ServidorResende/provaonline/')
var assunto = document.getElementById('assunto')
var descricao = document.getElementById('descricao')
var id
var coluna1 = document.getElementById('coluna1')
var coluna2 = document.getElementById('coluna2')
var colunaprova = document.getElementById('colunaprova')
var assunto2

document.addEventListener("DOMContentLoaded", function() {
    if (location.hash) {
        id = location.hash.substring(1)
        if (id != undefined){
            coluna2.style.visibility = 'visible'
        }
    }
    console.log(id)
})
function carregando(finish=false) {
    if (finish == true) {
        document.getElementById('carregando').remove()
    } else {
        document.getElementById('carregando').visibility = 'visible'
    }
}



function libera(loggedUser) {
    carregando(true)
    usuario = loggedUser
    coluna1.style.visibility = 'visible'
    email = loggedUser.email.replaceAll('@', '-').replaceAll('.', '_')
    
    contaRef = firebase.database().ref('ServidorResende/contas/' + email + '/')
    contaRef.child('testes/' + id).once('value').then(snapshot => {
        if (snapshot.exists() == true) {
            abreEdicao(id)
            document.getElementById('linkProvaOnline').href = 'teste#' + id
            document.getElementById('linkProvaOnline').innerText = 'resende.web.app/teste#' + id
        } else if (id != undefined) {

            abrirModal(
                'Acesso negado',
                'Você não têm permissão para editar este teste, com a conta atual. Peça permissão ao dono, ou faça login em outra conta.<br><br><a class="botaoPadrao" href="login">Ir para página de Login</a>',
                'red'
            )
        }
    })
}

function escolheuProva(prova) {
    console.log(prova)
    nomeTeste = prova.slice(0, prova.indexOf('@'))
    chaveTeste = prova.slice(prova.indexOf('@') + 1, prova.length)
    console.log('nomeTeste:', nomeTeste)
    console.log('chaveTeste:', chaveTeste)
    var btnEditaTeste = document.getElementById('btnEditaTeste')
    var btnExcluiTeste = document.getElementById('deletar')
    var btnDetalhes = document.getElementById('btnDetalhes')

    btnEditaTeste.style.visibility = 'visible'
}

function Vertestes() {
    contaRef.child('testes').once('value').then(snapshot => {
        console.log(snapshot)
        console.log('Existe?', snapshot.exists())
        console.log(snapshot.val())
        abrirModal(
            'Meus testes online',
            '<h2 class="subtitulo">Gerencie seus testes/provas</h2><table><tbody><tr><td><select size=10 name="testes" id="testes"></select></td><td><a href="#" class="botaoPadrao" onclick="editaTeste()" id="btnEditaTeste" style="visibility: hidden;">Editar teste</a>'
        )
        var lista = document.getElementById('testes')
        let coisas = snapshot.val()
        for (const e in coisas) {
            if (coisas.hasOwnProperty(e)) {
                const element = coisas[e];
                console.log(element)
                lista.innerHTML += `<option onclick="escolheuProva(this.value)" value="${element.teste + '@' + e}">${element.teste}</option>`
            }
        }
    })
}
function editaTeste() {
    var testes = document.getElementById('testes')
    let idTemp = testes.value.slice(testes.value.indexOf('@') + 1, testes.value.length)
    window.location =  '/editorprova#' + idTemp
    window.location.reload()
}
/*
var questions = [
    {
      label : 'United States has how many states',
      options : [{label: '49', checked: false},{label: '50', checked: 'checked'},{label: '51', checked: false}],
      answer : ['50'],
      type: 'radio'
    },
    {
      label : 'A crocodile is a member of which family ?',
      options : [{label: 'amphibian', checked: false},{label: 'reptile', checked: 'checked'}, {label: 'anything', checked: false}],
      answer : ['reptile'],
      type: 'radio'
    }
 ]

 provaRef.child('ids/' + '4a6jd9' + '/questoes').set(questions)
 */
 
 var idProvaGlobal
function abreEdicao(idProva) {
    let valorDaProva
    idProvaGlobal = idProva
    provaRef.child('ids/' + idProva).on('value', function(snapshot) {
        valorDaProva = 0
        if (snapshot.val().configuracoesProva.whitelist != false) {
            whitelist(true)
            document.getElementById('whitelist').checked = true
            document.getElementById('listaEmails').value = snapshot.val().configuracoesProva.whitelist
        } else {
            whitelist(false)
        }
        try {
            document.getElementById('pedirNome').checked = snapshot.val().configuracoesProva.perguntaNome
            document.getElementById(snapshot.val().configuracoesProva.modo).checked = true
        } catch (error) {
            console.log(snapshot.val())

        }
        
        coluna2.style.visibility = 'visible'
        assunto.innerText = 'Assunto: ' + snapshot.val().assunto
        assunto2 = snapshot.val().assunto
        descricao.innerText = 'Descrição: ' + snapshot.val().descricao
        var questoes = snapshot.val().questoes
        colunaprova.innerHTML = ''
        
        for (const key in questoes) {
            if (questoes.hasOwnProperty(key)) {
                const questao = questoes[key];
                var RUchecked = ''
                var MEchecked = ''
                var TXchecked = ''
                var UPchecked = ''
                if (questao.type == 'radio') {
                    RUchecked = 'checked'
                }
                if (questao.type == 'checkbox') {
                    MEchecked = 'checked'
                }
                if (questao.type == 'text') {
                    TXchecked = 'checked'
                }
                if (questao.type == 'file') {
                    UPchecked = 'checked'
                }
                colunaprova.innerHTML += `
                Questão ${Number(key) + 1}<button style="background-color: transparent; border: transparent;" onclick="deletaQuestao(${key})">
                <span class="material-icons md-18 deleta">
                delete_forever
                </span>
                </button><br>
                <div class="pontuacao" id="pontuacao${key}">
                    <label for="pontuacaoNumber${key}" id="pontuacaoNumberLabel${key}"><b>Pontos desta questão</b></label>
                    <input class="pontuacaoNumber" type="number" name="pontuacaoNumber${key}" id="pontuacaoNumber${key}" placeholder='Pontuação da questão (pts)' value="${questao.value}" style="width: 45px" onchange="alteraPts(this.value, this.id, ${key})">
                </div>
                <div class="enunciado" id="enunciado${key}">
                    <input class="enunciadoText" type="text" name="enunciadoText${key}" id="enunciadoText${key}" placeholder='Digite aqui o enunciado' value="${questao.label}" style="width: 100%" onchange="alteraEnunciado(this.value, this.id)">
                </div>
                <div class="opcoes" id="opcoes${key}">
                    <b>Indique a resposta correta:</b>
                </div>
                <div class="addNovaOpcao" style="margin-top: 5px;" id="btnAddNova${key}">
                    <a class="addNovaOpcaoBotao" onclick="addNovaOpcao(${Number(key)})">+ Nova Opção</a>
                </div>
                <div class="respostaObrigatoria" style="margin-top: 10px;">
                    <input type="checkbox" class="respostaObrigatoriaRadio" name="respostaObrigatoria${key}" id="respostaObrigatoria${key}" onchange="respostaObrigatoria(this.checked, this.id)">
                    <label for="respostaObrigatoria${key}">Resposta obrigatória</label>
                </div>
                <div class="tipoQuestao" style="margin-top: 4px;">
                    <b>Tipo de Questão:</b><br>
                    <input name="tipoQuestao${key}" id="tipoQuestaoRU${key}" type="radio" value="radio" class="tipoQuestaoRadio" onchange="tipoQuestao(this.value, this.id)" ${RUchecked}>
                    <label for="tipoQuestaoRU${key}">Resposta Única</label>
                    <br>
                    <input name="tipoQuestao${key}" id="tipoQuestaoME${key}" type="radio" value="checkbox" class="tipoQuestaoRadio" onchange="tipoQuestao(this.value, this.id)" ${MEchecked}>
                    <label for="tipoQuestaoME${key}">Múltipla Escolha</label>
                    <br>
                    <input name="tipoQuestao${key}" id="tipoQuestaoTX${key}" type="radio" value="text" class="tipoQuestaoRadio" onchange="tipoQuestao(this.value, this.id)" ${TXchecked}>
                    <label for="tipoQuestaoTX${key}">Resposta em texto</label>
                    <br>
                    <input name="tipoQuestao${key}" id="tipoQuestaoUP${key}" type="radio" value="file" class="tipoQuestaoRadio" onchange="tipoQuestao(this.value, this.id)" ${UPchecked}>
                    <label for="tipoQuestaoUP${key}">Upload de arquivo</label>
                </div>
                <br>`
                if (questao.type == 'text') {
                    document.getElementById(`btnAddNova${key}`).style.display = 'none'
                }
                if (questao.type == 'file') {
                    document.getElementById(`pontuacaoNumber${key}`).style.display = 'none'
                    document.getElementById(`pontuacaoNumberLabel${key}`).style.display = 'none'
                }
                if (questao.type != 'file') {
                    valorDaProva += Number(questao.value)
                    
                    document.getElementById('valorProva').innerText = valorDaProva
                }

                
                
                var opcoes = questao.options
                for (const opt in opcoes) {
                    if (opcoes.hasOwnProperty(opt)) {
                        const opcao = opcoes[opt];
                        document.getElementById('opcoes' + key).innerHTML += `
                            <div class="opcao" id="opcao${opt}">
                                <input name="opcao${key}" id="opcao${opt}@${key}" type="${questao.type}" value="${opcao.label}" class="opcaoField" onchange="clicaOpcao(this.value, this.id, this.type)" placeholder="Indique a resposta aqui..." ${opcao.checked}>
                                <label for="opcao${opt}@${key}">${opcao.label}</label>
                                <button style="background-color: transparent; border: transparent;" onclick="alteraTexto(${opt}, ${key}, 'opcao${opt}@${key}')">
                                    <span class="material-icons md-18 edita">
                                    edit
                                    </span>
                                </button>
                                <button style="background-color: transparent; border: transparent;" onclick="deletaOpcao(${opt}, ${key})">
                                    <span class="material-icons md-18 deleta">
                                    delete_outline
                                    </span>
                                </button>
                            </div>
                        `
                        if (questao.type == 'text') {
                            document.getElementById(`opcao${opt}@${key}`).value = questao.answer
                        }
                        
                        if (opcao == questao.answer && questao.type == 'radio') {
                            console.log(true)
                            try {
                                document.getElementById(`opcao${opt}@${key}`).checked = true
                                console.log(document.getElementById(`opcao${opt}@${key}`))
                            } catch (error) {
                                console.error(error)
                            }
                            
                        }
                    }
                }

        }
    }
        // Verfica e marca as questões obrigatórias
        for (const key in questoes) {
            if (questoes.hasOwnProperty(key)) {
                const questao = questoes[key];
                if (questao.forceAnswer == true) {
                    console.log(questao.forceAnswer)
                    document.getElementById('respostaObrigatoria' + key).checked = true
                } else {
                    document.getElementById('respostaObrigatoria' + key).checked = false
                }
            }
        }
    })

    
}

function alteraPts(value, id, qst) {
    provaRef.child('ids/' + idProvaGlobal + '/questoes/' + qst + '/value').set(document.getElementById(id).value)
}

function visualizarProva() {
    window.location = '/teste#' + idProvaGlobal
}

function deletaQuestao(questao, deleta=false) {
    provaRef.child('ids/' + idProvaGlobal + '/questoes/' + questao).once('value').then(snapshot => {
        if (deleta == true) {
            provaRef.child('ids/' + idProvaGlobal + '/questoes/' + questao).set({
                answer: [''],
                label: '',
                options: [{checked: false, label:'Altere o texto'},{checked: false, label:'Altere o texto'},{checked: false, label:'Altere o texto'},{checked: false, label:'Altere o texto'}],
                type: 'radio'
            }).then(function() {
                fechaModal()
            }).catch(function(error){
                abrirModal(
                    'Erro', 
                    'Mensagem de erro:<br>' + error.message, 
                    'red'
                )
                console.error(error)
            })
        } else {
            abrirModal(
                'Confirmação',
                `<p>Deseja apagar os dados da questão <b>"${questao + 1} - ${snapshot.val().label}"</b>?</p><br><a class="botaoPadrao" id="deletar" onclick="deletaQuestao(${questao}, ${true})">Apagar</a><br><a class="botaoPadrao" onclick="fechaModal()">Não</a>` 
            )
        }
        
    })
}

function addNovaQuestao() {
    let quests
    provaRef.child('ids/' + idProvaGlobal + '/questoes/').once('value').then(snapshot => {
        quests = snapshot.val()
        if (quests == null) {
            quests = [{
                answer: [''],
                label: '',
                options: [
                        {checked: false, label:'Altere o texto'}, {checked: false, label:'Altere o texto'}, {checked: false, label:'Altere o texto'}, {checked: false, label:'Altere o texto'}
                    ],
                type: 'radio',
                value: 1
            }]
        } else {
            quests.push({
                answer: [''],
                label: '',
                options: [
                        {checked: false, label:'Altere o texto'}, {checked: false, label:'Altere o texto'}, {checked: false, label:'Altere o texto'}, {checked: false, label:'Altere o texto'}
                    ],
                type: 'radio',
                value: 1
            })
        
        }
        provaRef.child('ids/' + idProvaGlobal + '/questoes/').set(quests)
    })
    
    
}

function alteraTexto(option, question, id, altera=false, tipoAntes='') {
    if (altera == true) {
        input.type = tipoAntes
    } else {
        var input = document.getElementById(id)
        input.type = 'text'
        input.focus()
    }
}

function deletaOpcao(option, question) {
    console.log(option, question)
    provaRef.child('ids/' + idProvaGlobal + '/questoes/' + question + '/options/' + option).remove().then(function() {
        console.log('deu')
    }).catch(function(error) {
        abrirModal(
        'Erro', 
        'Mensagem de erro:<br>' + error.message, 
        'red'
        )
        console.error(error)
    })
}

function addNovaOpcao(questao) {
    var questaoParaAdd
    provaRef.child('ids/' + idProvaGlobal + '/questoes/' + questao).once('value').then(snapshot =>{
        questaoParaAdd = snapshot.val()
        console.log(questaoParaAdd.options)
        if (questaoParaAdd.options == undefined) {
            questaoParaAdd.options = [{
                label: 'Altere o texto',
                checked: false
            }]
        } else {
            questaoParaAdd.options.push({label: 'Altere o texto', checked: false})
        }
        
        provaRef.child('ids/' + idProvaGlobal + '/questoes/' + questao).set(questaoParaAdd).then(function() {

        }).catch(function(error) {
            abrirModal(
                'Erro',
                error.message,
                'red'
            )
            console.error(error)
        })
    }, function(error) {
        abrirModal(
            'Erro',
            error.message,
            'red'
        )
        console.error(error)
    })
    

}

function alteraEnunciado(enunciado, id) {
    console.log(enunciado)
    console.log(id)
    var idquest = id.slice(13, id.length)
    provaRef.child('ids/' + idProvaGlobal + '/questoes/' + idquest + '/label').set(document.getElementById(id).value)
}

function tipoQuestao(tipo, id) {
    console.log(tipo)
    console.log(id)
    var idquestao = id.slice(13, id.length)
    provaRef.child('ids/' + idProvaGlobal + '/questoes/' + idquestao + '/type').set(tipo)
    if (tipo == 'text') {
        provaRef.child('ids/' + idProvaGlobal + '/questoes/' + idquestao + '/options').set([{
            label: '',
            checked: false
        }])
    } else if (tipo == 'file') {
        provaRef.child('ids/' + idProvaGlobal + '/questoes/' + idquestao + '/options').set([{
            label: 'Aluno, envie o 1º arquivo',
            checked: false
        }, {
            label: 'Aluno, envie o 2º arquivo',
            checked: false
        }])
    }
}

function clicaOpcao(resposta, opcQst, type) {
    console.log(resposta)
    console.log(opcQst)
    var opc = opcQst.slice(0, opcQst.indexOf('@'))
    var opcNumb = opc.slice(5, opc.length)
    var qst = opcQst.slice(opcQst.indexOf('@') + 1, opcQst.length)
    console.log(opc)
    console.log(qst)
    console.log(opcNumb)
    var tipoOnline
    provaRef.child('ids/' + idProvaGlobal + '/questoes/' + qst + '/type').once('value').then(snapshot => {
        tipoOnline = snapshot.val()
    })
    
   if (type == 'text' && tipoOnline == 'text') {
    var respostanow = document.getElementById(opcQst)
    var ans = {
        0: respostanow.value
    }
        provaRef.child('ids/' + idProvaGlobal + '/questoes/' + qst + '/answer').set(ans)
   } else if (type == 'text' && tipoOnline != 'text') {
        var respostanow = document.getElementById(opcQst)
        provaRef.child('ids/' + idProvaGlobal + '/questoes/' + qst + '/options/' + opcNumb + '/label').set(respostanow.value)
        alteraTexto(opcNumb, qst, respostanow.id, true, tipoOnline)
       
   } else {
    var checked
    var respostanow = document.getElementById(opcQst)
    if (respostanow.checked == true) {
        checked = 'checked'
    } else {
        checked = false
    }
    var obj
    provaRef.child('ids/' + idProvaGlobal + '/questoes/' + qst + '/options').once('value').then(snapshot => {
        obj = snapshot.val()
        console.log(obj)
        for (const opcaoobj in obj) {
         if (obj.hasOwnProperty(opcaoobj)) {
             const umaopc = obj[opcaoobj];
             if (umaopc.label == respostanow.value && type == 'radio') {
                 umaopc.checked = 'checked'
             } else if (type == 'radio'){
                 umaopc.checked = false
             }
             if (respostanow.value == umaopc.label && type == 'checkbox') {
                 console.log(respostanow.value , umaopc.label)

                 if (respostanow.checked == true) {
                     umaopc.checked = 'checked'
                 } else {
                     umaopc.checked = false
                 }
                 
             } 
             //if (respostanow.checked == false && type == 'checkbox' && respostanow.value == umaopc.label) {
             //    umaopc.checked = false
             //}
         }
     }

      console.log(obj)
      provaRef.child('ids/' + idProvaGlobal + '/questoes/' + qst + '/options').set(obj)
      if (type == 'radio') {
        provaRef.child('ids/' + idProvaGlobal + '/questoes/' + qst + '/answer').set({0: opcNumb})
      }
    })
   }
   
alteraTexto(altera=true)
   
}

function respostaObrigatoria(checked, id) {
    console.log(checked, id)
    id = id.replace('respostaObrigatoria', '')
    var obrigatoria = {
        forceAnswer: checked
    }
    provaRef.child('ids/' + idProvaGlobal + '/questoes/' + id + '/forceAnswer').set(checked).then(() => {

    }, function(error) {
        abrirModal(
            'Erro',
            error.message,
            'red'
        )
        console.log(error)
    })
}

function modoProva(modo) {
    if (modo == 'modoAnonimo') {
        document.getElementById('pedirNome').disabled = true
        provaRef.child('ids/' + idProvaGlobal + '/configuracoesProva/perguntaNome').set(false)
    } else if (modo == 'modoLoginServidor') {
        document.getElementById('pedirNome').disabled = false
    }
    provaRef.child('ids/' + idProvaGlobal + '/configuracoesProva/modo').set(modo).then(function() {

    }).catch(function(error) {
        abrirModal(
            'Erro',
            error.message,
            'red'
        )
        console.log(error)
    })
        
}

function confPerguntaNome(pergunta) {
    provaRef.child('ids/' + idProvaGlobal + '/configuracoesProva/perguntaNome').set(pergunta).then(function() {

    }).catch(function(error) {
        abrirModal(
            'Erro',
            error.message,
            'red'
        )
        console.log(error)
    })
}

function whitelist(ativado, salva=false, lista='') {
    var whitelistDiv = document.getElementById('whitelistDiv')
    if (ativado == true) {
        whitelistDiv.style.display = 'block'
    } else {
        whitelistDiv.style.display = 'none'
        provaRef.child('ids/' + idProvaGlobal + '/configuracoesProva/whitelist').set(false)
    }
    if (salva == true) {
        provaRef.child('ids/' + idProvaGlobal + '/configuracoesProva/whitelist').set(lista)
    }
}

function darPermissao(permitir=false, email) {
    if (permitir == false) {
        abrirModal(
            'Confirmação',
            `
            Digite abaixo o e-mail associado à conta que deseja dar o privilégio de edição deste teste.<br>
            <input type="text" name="emailPermissao" id="emailPermissao" placeholder="Digite o e-mail..." onchange="buscaEmail(this.id)"><label id="emailOk"></label>
            <br><div id="botaoPermitaAcesso"></div>
            `
        )
    } else {
        let emailRefLibera = firebase.database().ref('ServidorResende/contas/' + email + '/testes/' + id)
        emailRefLibera.set({'teste': assunto2}).then(function() {
            fechaModal()
            AstNotif.toast("Permissão concedida!");
        }).catch(function(error) {
            fechaModal()
            AstNotif.dialog(
                'Erro', 
                error.message,
                {positive: "OK", negative: ""}
            )
            console.log(error)
        })
    }
}

function buscaEmail(id) {
    let email = document.getElementById(id).value
    let emailOk = document.getElementById('emailOk')
    let divBotaoPermita = document.getElementById('botaoPermitaAcesso')
    let emailFormatado = email.replaceAll('@', '-').replaceAll('.', '_')
    let emailRef = firebase.database().ref('ServidorResende/contas/' + emailFormatado)
    emailRef.once('value').then(snapshot => {
        if (snapshot.exists()) {
            emailOk.innerHTML = '<label style="color: green;">E-mail encontrado</label>'
            divBotaoPermita.innerHTML = `<br><br><a class="botaoPadrao" onclick="darPermissao(true, '${emailFormatado}')">Permitir acesso à edição</a>`
        } else {
            emailOk.innerHTML = '<label style="color: red;">E-mail não encontrado</label>'
            divBotaoPermita.innerHTML = `<br><br><a class="botaoPadrao" onclick="darPermissao(true, '${emailFormatado}')">Permitir acesso à edição mesmo assim</a>`
        }
    })
}