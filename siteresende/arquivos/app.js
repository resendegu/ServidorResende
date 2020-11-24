var usuario
firebase.auth().onAuthStateChanged((user) => {
    usuario = user
    if (user) {
        try {
            check(true)
        } catch (error) {
            console.log(error)
        }
        
        document.getElementById('profilePic').src = user.photoURL
        if (user.photoURL == 'null') {
            document.getElementById('profilePic').src = './images/profile_placeholder.png'
        }
    } else {
        try {
            check(false)
        } catch (error) {
            console.log(error)
        }
    }
})