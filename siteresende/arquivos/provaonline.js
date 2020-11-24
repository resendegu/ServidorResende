var contaRef = firebase.database().ref('/ServidorResende/contas/')
var provaRef = firebase.database().ref('/ServidorResende/provaonline/')
var provaRefCheck = firebase.database().ref('/ServidorResende/provaonline/')
var coluna1 = document.getElementById('coluna1')
var coluna2 = document.getElementById('coluna2')
var user
var chaveTeste

function carregando(finish=false) {
    if (finish == true) {
        document.getElementById('carregando').remove()
    } else {
        document.getElementById('carregando').visibility = 'visible'
    }
}
function naoLibera() {
    carregando(true)
    abrirModal(
        'Opa...',
        'Parece que você não está logado. Clique no botão abaixo para realizar seu login ou cadastro para ter acesso à esta página.<br><br><a href="login" class="botaoPadrao">Ir para página de Login/Cadastro</a>'
    )
}

function libera(loggedUser) {
    carregando(true)
    coluna1.style.visibility = 'visible'
    user = loggedUser
    console.log(loggedUser)
    email = loggedUser.email.replaceAll('@', '-').replaceAll('.', '_')
    
    contaRef = firebase.database().ref('ServidorResende/contas/' + email + '/')
    if (chaveTeste != undefined) {
        provaRefCheck.child('ids/' + chaveTeste + '/criador').once('value').then(email => {
            if (email.val() == loggedUser.email) {
                detalheTeste()
            } else {
                AstNotif.dialog("Permissão negada", 'Você não tem permissão para acessar os dados desta prova. Tente fazer login com a conta que criou esta prova.', {fa: "exclamation-circle", positive: "OK", negative: "", iconSize: 48});
            }
        })
    }
}

function Vertestes() {
    contaRef.child('testes').once('value').then(snapshot => {
        abrirModal(
            'Meus testes online',
            '<h2 class="subtitulo">Gerencie seus testes/provas</h2><table><tbody><tr><td><select size=10 name="testes" id="testes"></select></td><td><a href="#" class="botaoPadrao" onclick="detalheTeste()" id="btnDetalhes" style="visibility: hidden;">Ver detalhes e informações</a><a href="#" class="botaoPadrao" onclick="editaTeste()" id="btnEditaTeste" style="visibility: hidden;">Editar teste</a><a href="#" id="deletar" class="botaoPadrao" onclick="excluiTeste()" style="visibility: hidden;">Excluir teste</a></td></tr></tbody></table><a href="#" class="botaoPadrao" onclick="modalcriaTeste()" id="btnCriaTeste">+ Criar um teste/prova</a>'
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
var nomeTeste

document.addEventListener("DOMContentLoaded", function() {
    if (location.hash) {
        chaveTeste = location.hash.substring(1)

    }
})
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
    btnExcluiTeste.style.visibility = 'visible'
    btnDetalhes.style.visibility = 'visible'
}

function detalheTeste() {
    AstNotif.notify("Aguarde", "Resultados estão sendo carregados", "...", {length: 3000});
    fechaModal()
    coluna2.style.visibility = 'visible'
    provaRef.child('ids/' + chaveTeste).on('value', function(snapshot) {
        let todaProva = snapshot.val()
        let contagem = 0
        let contagemTerminados = 0
        let somaDasNotas = 0
        let valorTotalProva = 0
        document.getElementById("tituloProva").innerText = snapshot.val().assunto
        document.getElementById("descricaoProva").innerText = 'Resultados desta prova'
        // Usuários que realizaram
        let divUsuarios = document.getElementById('usuarios')
        divUsuarios.innerHTML = '<p><b>Usuários que realizaram o teste:</b></p>'
        for (const email in todaProva.usuarios) {
            if (todaProva.usuarios.hasOwnProperty(email)) {
                const usuario = todaProva.usuarios[email];
                divUsuarios.innerHTML += `<a class="listaUsersBotao " id="${email}" onclick="detalheUsuario(this.id)" width="300px"><img src="${usuario.dados.foto}" style="border-radius: 10px; width: 30px;  height: 30px;">&nbsp;<label style="vertical-align: super; height: 100%;">${usuario.dados.nome} (${usuario.dados.email})</label></a>`
            }
        }
        // Sessão
        for (const key in todaProva.sessoes) {
            if (todaProva.sessoes.hasOwnProperty(key)) {
                const sessao = todaProva.sessoes[key];
                ++contagem
                if (sessao.terminada == true) {
                    ++contagemTerminados
                }
                try {
                    somaDasNotas += Number(sessao.resultados.nota)
                    valorTotalProva = Number(sessao.resultados.totalDaProva)
                } catch (error) {
                    console.log(error)
                }
                
                // Questão
                for (const qst in sessao.questoes) {
                    if (sessao.questoes.hasOwnProperty(qst)) {
                        const questao = sessao.questoes[qst];
                        // Opção
                        for (const opt in questao.options) {
                            if (questao.options.hasOwnProperty(opt)) {
                                const opcao = questao.options[opt];
                                
                            }
                        }
                    }
                }
            }
        }
        document.getElementById('vezesFeita').innerText = `Este teste já foi iniciado ${contagem} vez(es), e foi terminado ${contagemTerminados} vez(es).`
        document.getElementById('media').innerHTML = `A média das notas é <b>${(somaDasNotas/contagemTerminados).toFixed(2)} / ${valorTotalProva}</b>`
        
    }).catch(function(error){
        AstNotif.dialog("Erro", error.message, {fa: "exclamation-circle", positive: "OK", negative: "", iconSize: 48});
    })
}

function detalheUsuario(email) {
    provaRef.child('ids/' + chaveTeste + '/usuarios/' + email).once('value').then(snapshot => {
        let dadosSessoes = snapshot.val()
        abrirModal(
            `<a href="${dadosSessoes.dados.foto}" target="_blank"><img src="${dadosSessoes.dados.foto}" style="border-radius: 10px; width: 60px; height: 60px;"></a>&nbsp;${dadosSessoes.dados.nome} (${dadosSessoes.dados.email})`,
            `<h2 class="subtitulo">Sessões de ${dadosSessoes.dados.nome}</h2><br><div id="sessoesUsuario"></div>`
        )
        let sessoesUsuario = document.getElementById('sessoesUsuario')
        let counter = 0
        sessoesUsuario.innerHTML = '<br>Sessões abertas por este usuário:</b>'
        for (const key in dadosSessoes.sessoes) {
            if (dadosSessoes.sessoes.hasOwnProperty(key)) {
                const sessaoKey = dadosSessoes.sessoes[key];
                ++counter
                sessoesUsuario.innerHTML += `<a id="${sessaoKey.sessaoKey}" onclick="abrirSessaoNoUsuario(this.id)" class="botaoPadrao">${counter}º Sessão</a><div style="border-radius: 10px; box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19); padding: 6px; display: none; animation-name: animatetop; animation-duration: 1s;" id="divSessao${sessaoKey.sessaoKey}"></div><br>`
                
            }
        }
    }).catch(function(error) {
        AstNotif.dialog(
            'Erro', 
            error.message,
            {positive: "OK", negative: ""}
        )
    })
}
var inicio
var fim
function abrirSessaoNoUsuario(sessaoDoUsuario, fecha=false) {
    if (fecha == true) {
        document.getElementById(`divSessao${sessaoDoUsuario}`).style.display = 'none'
    } else {
        let divSessao = document.getElementById(`divSessao${sessaoDoUsuario}`)
        divSessao.innerHTML = ''
        divSessao.style.display = 'block'
        provaRef.child('ids/' + chaveTeste + '/sessoes/' + sessaoDoUsuario).once('value').then(sessao => {
            let sessaoUser = sessao.val()
            let userTerminou
            if (sessaoUser.terminada == true) {
                userTerminou = 'SIM'
            } else {
                userTerminou = 'NÃO'
            }
            let datetime = {
                dma: sessaoUser.time.apiTime.datetime.slice(0, 10),
                hora: sessaoUser.time.apiTime.datetime.slice(11, 19)
            }
            divSessao.style.backgroundColor = 'lightgray'
            divSessao.innerHTML += `<button style="background-color: transparent; border: transparent;" onclick="abrirSessaoNoUsuario('${sessaoDoUsuario}', true)">
            <span class="material-icons md-18 deleta">
            close
            </span>
            </button><br>
            <b>Nome digitado na prova:</b> ${sessaoUser.nomeDigitado}
            <br> O usuário terminou esta sessão? <b>${userTerminou}</b><br>
            <b>Data/Hora de início: </b>${datetime.dma} às ${datetime.hora}<br>
            
            `
            if (sessaoUser.terminada == true) {
                let datetime = {
                    dma: sessaoUser.timeEnd.apiTime.datetime.slice(0, 10),
                    hora: sessaoUser.timeEnd.apiTime.datetime.slice(11, 19)
                }
                divSessao.innerHTML += `<b>Data/Hora do fim:</b> ${datetime.dma} às ${datetime.hora}<br>
                NOTA: <b>${sessaoUser.resultados.nota.toFixed(2)}</b>/${sessaoUser.resultados.totalDaProva} (Nota sem arredondar: ${sessaoUser.resultados.nota})  
                `
            }
            inicio = sessaoUser.time.apiTime
            fim = sessaoUser.timeEnd.apiTime
            divSessao.innerHTML += `
                <a class="detalhesAvancados" onclick="detalhesAvancados()">Acessar informações avançadas</a>
                <a class="detalhesAvancados" onclick="acessarProva('${sessaoDoUsuario}')">Visualizar a prova do usuário</a>
            `
        })
    }
    
}

function acessarProva(sessao) {
    window.open(`provainfo#${sessao}@${chaveTeste}`, '_blank')
}
function detalhesAvancados() {
    AstNotif.dialog("Detalhes avançados da sessão", `
        <p><b>Início da prova</b></p>
        IP do usuário: ${inicio.client_ip}<br>
         Fuso horário: ${inicio.timezone} <br>  Data e hora (UTC): ${inicio.utc_datetime} <br> <br>
        <p><b>Fim da prova</b></p>
        IP do usuário: ${fim.client_ip} <br>
        Fuso horário: ${fim.timezone} <br>
        Data e hora (UTC): ${fim.utc_datetime}
    `, {fa: "exclamation-circle", positive: "OK", negative: "", iconSize: 48});
}

function editaTeste() {
    window.location = '/editorprova#' + chaveTeste
}

function excluiTeste(deleta=false) {
    let contasExcluir = firebase.database().ref('ServidorResende/contas')
    let storageExcluir = firebase.storage().ref('provaonline/ids/' + chaveTeste)
    
    if (deleta == true) {
        provaRef.child('ids/' + chaveTeste + '/usuarios').once('value').then(listaUsers => {
            let listaUsuarios = listaUsers.val()
            for (const email in listaUsuarios) {
                if (listaUsuarios.hasOwnProperty(email)) {
                    const user = listaUsuarios[email];
                    
                    contasExcluir.child(email + '/sessoes/provas/' + chaveTeste).remove().then(function() {
                        var excluiRef = contaRef.child('testes/' + chaveTeste + '/')
                        excluiRef.remove().then(function() {

                            
                        }).catch(function(error) {
                            abrirModal('Erro', 'Mensagem de erro:<br>' + error.message, 'red')
                            console.error(error)
                        })
                        storageExcluir.delete().then(function(t) {
                            console.log(t)
                        }).catch(function(error) {
                            abrirModal('Erro', 'Mensagem de erro:<br>' + error.message, 'red')
                            console.error(error)
                        })

                        excluiRef = provaRef.child('ids/' + chaveTeste).remove().then(function() {
                            abrirModal('Aviso', '<h2 class="subtitulo">Sua prova/teste foi deletado com sucesso</h2>')
                        }).catch(function(error) {
                            abrirModal('Erro', 'Mensagem de erro:<br>' + error.message, 'red')
                            console.error(error)
                        })
                    }).catch(function(error) {
                        console.log(error)
                    })
                }
            }
        }).catch(function(error) {
            abrirModal('Erro', 'Mensagem de erro:<br>' + error.message, 'red')
            console.error(error)
        })
        
        
        
    } else {
        abrirModal('Aviso', '<h2 class="subtitulo">Você está prestes a apagar um Teste/prova</h2><br>A prova ficará indisponível para ser feita, <b>e TODOS OS DADOS REFERENTES A PROVA SERÃO APAGADOS.</b><a href="#" class="botaoPadrao" onclick="excluiTeste(deleta=true)">Excluir o teste</a>', 'red')
    }
}

function modalcriaTeste() {
    abrirModal(
        'Criando um teste/prova',
        `<h2 class="subtitulo">Olá ${user.displayName}. Você está logado com ${user.email}.</h2><br><b>Preencha os campos abaixo para a criação do teste</b><br><br><div id="areaId" style="background-color: lightgray; width: 100%; height: 50px; padding: 5px;">ID Exclusivo do Teste: <button id="geraId" onclick="geraId()">Gerar ID</button><input type="text" name="idNovoTeste" id="idNovoTeste" placeholder="ou personalize..." onkeyup="verificaLink(this.value)"><label id="statuslink"></label><br><a href="" id="linkPreview"></a></div><div id="areaConteudo" style="background-color: lightgray; width: 100%; height: fit-content; padding: 5px; margin-top: 3px;">Assunto do Teste: <input type="text" name="assuntoNovoTeste" id="assuntoNovoTeste" placeholder="Digite o assunto do seu teste" size="30" maxlength="40"><br><br>Descrição do Teste:<br> <textarea type="text" name="descricaoNovoTeste" id="descricaoNovoTeste" placeholder="Digite uma descrição do seu teste" cols="50" rows="3" maxlength="300"></textarea></div><br><a href="#" class="botaoPadrao" onclick="criaTeste()">Criar teste e ir para edição</a>`
    )
}
var idLink
function verificaLink(id) {
    idLink = id
    var statuslink = document.getElementById('statuslink')
    var linkPreview = document.getElementById('linkPreview')
    provaRef.child('ids/' + id).once('value').then(snapshot => {
        if (snapshot.exists() == true) {
            statuslink.style.color = 'red'
            statuslink.innerText = ' ID indisponível'
            linkPreview.style.visibility = 'hidden'
        } else {
            statuslink.style.color = 'green'
            statuslink.innerText = ' ID disponível'
            linkPreview.innerText = 'resende.web.app/teste' + '#' + id
            linkPreview.href = 'resende.web.app/teste' + '#' + id
            linkPreview.style.visibility = 'visible'
        }
    })
}

function geraId() {
    var idNovoTeste = document.getElementById('idNovoTeste')
    var idGerado = Math.floor(Math.random() * 0xFFFFFF).toString(20)
    idNovoTeste.value = idGerado
    verificaLink(idNovoTeste.value)

}
function criaTeste() {
    var assuntoNovoTeste = document.getElementById('assuntoNovoTeste')
    var descricaoNovoTeste = document.getElementById('descricaoNovoTeste')
    provaRef.child('ids/' + idLink).once('value').then(snapshot => {
        if (snapshot.exists() == true) {
            statuslink.style.color = 'red'
            statuslink.innerText = ' ID indisponível'
            linkPreview.innerText = 'Parece que alguém pegou este link primeiro que você. Escolha outro!'
        } else {
            contaRef.child('testes/' + idLink).set({
                teste: assuntoNovoTeste.value
            }, function(error) {
                if (error) {
                    alert('Erro ' + error.message)
                } else {
                    provaRef.child('ids/' + idLink).set({
                        criador: user.email,
                        assunto: assuntoNovoTeste.value,
                        descricao: descricaoNovoTeste.value,
                        questoes: [{
                            answer: [''],
                            label: '',
                            options: [{checked: false, label:'Altere o texto'},{checked: false, label:'Altere o texto'},{checked: false, label:'Altere o texto'},{checked: false, label:'Altere o texto'}],
                            type: 'radio',
                            value: 1
                        }],
                        configuracoesProva: {
                            modo: 'modoLoginServidor',
                            perguntaNome: true,
                            whitelist: false
                        }
                    }, function(error) {
                        if (error) {
                            alert('Erro ' + error.message)
                        } else {
                            window.location = '/editorprova#' + idLink
                        }
                    })
                }
            })
        }
    })
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