const credentials = {
    appId: 3642,
    authKey: "SaMmaYN6pvMKmdZ",
    authSecret: "XQ3qR2te73SDx6g",
  };

//const MULTIPARTY_SERVER_ENDPOINT = 'wss://janus.connectycube.com:8989';

const DEFAULT_CONFIG = {
    endpoints: {
      api: 'api.connectycube.com',
      chat: 'chat.connectycube.com'
    },
    videochat: {
      alwaysRelayCalls: false,
      answerTimeInterval: 60,
      dialingTimeInterval: 5,
      disconnectTimeInterval: 30,
      statsReportTimeInterval: false,
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302'
        },
        {
          urls: 'stun:turn.connectycube.com'
        },
        {
          urls: 'turn:turn.connectycube.com:5349?transport=udp',
          username: 'connectycube',
          credential: '4c29501ca9207b7fb9c4b4b6b04faeb1'
        },
        {
          urls: 'turn:turn.connectycube.com:5349?transport=tcp',
          username: 'connectycube',
          credential: '4c29501ca9207b7fb9c4b4b6b04faeb1'
        }
      ]
    },
    debug: { mode: 0 }
}
  
  
ConnectyCube.init(credentials, DEFAULT_CONFIG)

function pegaDadosParaCriar() {
    document.getElementById('carregandoCriando').style.display = 'inline-block'
    let email = document.getElementById('emailNovoUser').value
    let senha = document.getElementById('senhaNovoUser1').value
    let senhaConfirma = document.getElementById('senhaNovoUser2').value
    let nome = document.getElementById('nomeNovoUser').value
    if (senha === senhaConfirma) {
        criaUsuario(senha, email, nome)
    } else {
        document.getElementById('carregandoCriando').style.display = 'none'
        document.getElementById('warn').style.display = 'inline-block'
    }
}

function criaUsuario(senha, email, nome) {

    const userProfile = {
        password: senha,
        email: email,
        full_name: nome,
      };

    ConnectyCube.createSession()
    .then((session) => {
        console.log(session)
        // JS SDK v2+
        ConnectyCube.users
        .signup(userProfile)
        .then((user) => {
            console.log(user)
            $('#criaUsuario').modal('hide')
            $('#aviso').toast('show')
        })
        .catch((error) => {
            console.log(error)
            if (error.code == 422) {
                alert('Esse email já está cadastrado. Tente novamente.')
            }
        });
    })
    .catch((error) => {
        console.log(error)
    });
      
}

function buscaIdUsuario(email) {
    const searchParams = { email: email };

    // JS SDK v2+
    ConnectyCube.users
    .get(searchParams)
    .then((result) => {
        console.log(result)
    })
    .catch((error) => {
        console.log(error)
    });

}

function incluiUser() {
    
}


function iniciarSessao() {
    const calleesIds = [56, 76, 34]; // User's ids
    const sessionType = ConnectyCube.videochat.CallType.VIDEO; // AUDIO is also possible
    const additionalOptions = {};
    const session = ConnectyCube.videochat.createNewSession(calleesIds, sessionType, additionalOptions);


    const extension = {};
    session.call(extension, (error) => {
        console.log(error)
    })
    
    const mediaParams = {
        audio: true,
        video: true,
        options: {
          muted: true,
          mirror: true,
        },
      };
      
      // JS SDK v2+
      session
        .getUserMedia(mediaParams)
        .then((localStream) => {
            session.attachMediaStream("videoLocal", localStream);
        })
        .catch((error) => {
            console.log(error)
        });
      
}

// Escutando por uma call
ConnectyCube.videochat.onCallListener = function (session, extension) {
    // here show some UI with 2 buttons - accept & reject, and by accept -> run the following code:
    //const extension = {};
    session.accept(extension);
};

// Não Respondeu minha call
ConnectyCube.videochat.onUserNotAnswerListener = function (session, userId) {};

//Aceitou minha call
ConnectyCube.videochat.onAcceptCallListener = function (session, userId, extension) {};

// Rejeitou minha call
ConnectyCube.videochat.onRejectCallListener = function (session, userId, extension) {};



ConnectyCube.videochat.onRemoteStreamListener = function (session, userID, remoteStream) {
    // attach the remote stream to DOM element
    session.attachMediaStream("videoRemoto", remoteStream);
  };
  