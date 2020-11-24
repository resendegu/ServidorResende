var LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a'
function initApp() {
    let naoLogado = document.getElementById('naoLogado')
    let logado = document.getElementById('logado')
      firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        document.getElementById('carregamento').remove()
        // User is signed in.
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        var providerData = user.providerData;
        AstNotif.toast(`Olá ${displayName}. Você está logado! :D`);
        document.getElementById('nomeLogado').innerText = displayName
        logado.style.display = 'block'
        naoLogado.remove()
      } else {
        document.getElementById('carregamento').remove()
        // User is signed out.
        naoLogado.style.display = 'block'
        AstNotif.notify("Autenticação", "Olá, não identificamos seu login. <a href='./login' style='color: white; text-decoration: underlined;'>Clique aqui</a> para se cadastrar ou logar.", "<i>De Servidor Resende</i>", {'length': -1});
      }
    });
  }
  