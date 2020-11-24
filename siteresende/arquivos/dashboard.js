
  
      /**
       * initApp handles setting up UI event listeners and registering Firebase auth listeners:
       *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
       *    out, and that is where we update the UI.
       */
      function initApp() {
        // Listening for auth state changes.
        // [START authstatelistener]
        firebase.auth().onAuthStateChanged(function(user) {
          // [START_EXCLUDE silent]
          //document.getElementById('quickstart-verify-email').disabled = true;
          // [END_EXCLUDE]
          if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            var providerData = user.providerData;
            if (emailVerified == false) {
                window.location.href = './'
            } else if (emailVerified == true) {
                dbref = firebase.database().ref('/ServidorResende/seguranca/')
                dbref.on('child_added', function (data) {
                    security = data.val()
                    securityPass = window.prompt('Senha de segurança')
                    if (securityPass == security) {
                        checkVerifica() 
                        checkVideo()
                        checkSenha()
                        tiraLoader()
                    } else {
                        window.location.href = './'
                    }
                })
            }
            // [START_EXCLUDE]
            //document.getElementById('quickstart-sign-in-status').textContent = "Olá " + email + ', você está logado';
            //document.getElementById('quickstart-sign-in').textContent = 'Sair';
            //document.getElementById('quickstart-account-details').textCo	ntent = JSON.stringify(user, null, '  ');
            if (!emailVerified) {
              //document.getElementById('quickstart-verify-email').disabled = false;
            }
            // [END_EXCLUDE]
          } else {
            // User is signed out.
            window.location.href = './'
            // [START_EXCLUDE]
            //document.getElementById('quickstart-sign-in-status').textContent = 'Você não está logado';
            //document.getElementById('quickstart-sign-in').textContent = 'Fazer login';
            //document.getElementById('quickstart-account-details').textContent = 'null';
            // [END_EXCLUDE]
          }
          // [START_EXCLUDE silent]
          //document.getElementById('quickstart-sign-in').disabled = false;
          // [END_EXCLUDE]
        });
        // [END authstatelistener]
  
        //document.getElementById('quickstart-sign-in').addEventListener('click', toggleSignIn, false);
        //document.getElementById('quickstart-sign-up').addEventListener('click', handleSignUp, false);
        //document.getElementById('quickstart-verify-email').addEventListener('click', sendEmailVerification, false);
        //document.getElementById('quickstart-password-reset').addEventListener('click', sendPasswordReset, false);
      }
  
      window.onload = function() {
          initApp();
      };
  
      function salvadadosuser(emai, nomeDoUser){
        // get firebase database reference...
        var db_ref = firebase.database().ref('/ServidorResende/contas/' + emai + '/');
        db_ref.child('email').set(emai.replaceAll('@', '-').replaceAll('.', '_'));
        db_ref.child('nome').set(nomeDoUser)
      }