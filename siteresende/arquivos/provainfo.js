var usuario
var sessao
var prova
var provaRef = firebase.database().ref('ServidorResende/provaonline/ids')

function libera(user) {
    usuario = user
    verificaUser(sessao, prova)
    
}

document.addEventListener("DOMContentLoaded", function() {
    if (location.hash) {
        sessaoEprova = location.hash.substring(1)
        sessao = sessaoEprova.slice(0, sessaoEprova.indexOf('@'))
        prova = sessaoEprova.slice(sessaoEprova.indexOf('@') + 1, sessaoEprova.length)
        
        
        console.log(sessao)
        console.log(prova)
    }
})

function verificaUser(session, test) {
    let emailFormatado = usuario.email.replaceAll('@', '-').replaceAll('.', '_')
    provaRef.child(test).once('value').then(snapshot => {
        try {
            if (snapshot.val().usuarios[emailFormatado].dados.email == usuario.email) {
                provaRef = provaRef.child(prova)
                console.log('here')
                abreProva(true)
            } else if(snapshot.val().criador == usuario.email) {
                provaRef = provaRef.child(prova)
                console.log('here')
                abreProva(true, true)
            } else {
                abreProva(false)
            }
        } catch (error) {
            console.log(error)
        }
        
    }).catch(function(error) {
        AstNotif.dialog("Erro", error.message, {fa: "exclamation-circle", positive: "OK", negative: "", iconSize: 48});
        console.log(error)
    })
}

function abreProva(libera, criador=false) {
    if (libera == false) {
        AstNotif.dialog("Acesso negado", 'Você não possui acesso à esta prova pois não é o criador, ou não é o usuário que realizou este teste. Tente fazer login com outra conta.', {fa: "exclamation-circle", positive: "OK", negative: "", iconSize: 48});
    } else if(libera == true && criador == false) {
        carregaProva()
    } else {
        carregaProva()
    }
}

function carregaProva() {
    carregando(true)
    let divTermina = document.getElementById('divTermina')
    
    document.getElementById('coluna1').style.visibility = 'visible'
    document.getElementById('coluna2').style.visibility = 'visible'
    provaRef.child('sessoes/' + sessao + '/nomeDigitado').once('value').then(nome => {
        document.getElementById('perguntaNome').innerText = nome.val()
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
                            <input type="${tipo}" name="opcao${i}" id="opcao${opt}@${i}" class="opcaoField" placeholder="Digite sua resposta aqui..." onchange="opcao('${opcao.value}', this.id, this.type)" disabled>
                            `
                            if (opcao.correta == true) {
                                document.getElementById(`divOpcoesQst${i}`).innerHTML += `
                                <span class="material-icons md-18 correta">
                                    check
                                </span>
                            `
                            } else {
                                document.getElementById(`divOpcoesQst${i}`).innerHTML += `
                                <span class="material-icons md-18 incorreta">
                                    close
                                </span>
                            `
                            }
                            
                            provaRef.child('sessoes/' + sessao + '/questoes/' + i + '/options/' + opt).once('value').then(option => {
                                if (option.val().answer != undefined) {
                                    document.getElementById(`opcao${opt}@${i}`).value = option.val().answer
                                }
                            })
                        } else {
                            if (opcao.correta == true) {
                                document.getElementById(`divOpcoesQst${i}`).innerHTML += `
                                <span class="material-icons md-18 correta">
                                    check
                                </span>
                            `
                            } else if(questao.type != 'file') {
                                document.getElementById(`divOpcoesQst${i}`).innerHTML += `
                                <span class="material-icons md-18 incorreta">
                                    close
                                </span>
                            `
                            }
                            document.getElementById(`divOpcoesQst${i}`).innerHTML += `
                            <input type="${tipo}" name="opcao${i}" id="opcao${opt}@${i}" value="${opcao.label}" class="opcaoField" placeholder="Indique a resposta aqui..." onchange="opcao(this.value, this.id, this.type, this.checked)" disabled>&nbsp; <label for="opcao${opt}@${i}">${opcao.label}</label>
                            <br>
                            <div id="upload${opt}@${i}" style="display: none;"></div>
                            `
                           
                            if (tipo != 'radio') {
                                provaRef.child('sessoes/' + sessao + '/questoes/' + i + '/options/' + opt).once('value').then(option => {
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
                                provaRef.child('sessoes/' + sessao + '/questoes/' + i + '/answer').once('value').then(radAns => {
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
}

function carregando(finish=false) {
    if (finish == true) {
        document.getElementById('carregando').remove()
    } else {
        document.getElementById('carregando').visibility = 'visible'
    }
}