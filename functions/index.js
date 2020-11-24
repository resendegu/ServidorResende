/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Note: You will edit this file in the follow up codelab about the Cloud Functions for Firebase.
// Import the Firebase SDK for Google Cloud Functions.
const functions = require('firebase-functions');
// Import and initialize the Firebase Admin SDK.
const admin = require('firebase-admin');
const { snapshotConstructor } = require('firebase-functions/lib/providers/firestore');
admin.initializeApp();
// TODO(DEVELOPER): Import the Cloud Functions for Firebase and the Firebase Admin modules here.

// TODO(DEVELOPER): Write the addWelcomeMessages Function here.
// Adds a message that welcomes new users into the chat.
exports.addWelcomeMessages = functions.auth.user().onCreate(async (user) => {
    console.log('A new user signed in for the first time.');
    const fullName = user.displayName || 'Anônimo';
  
    // Saves the new welcome message into the database
    // which then displays it in the FriendlyChat clients.
    await admin.firestore().collection('messages').add({
      name: 'Resende Bot',
      profilePicUrl: '/images/firebase-logo.png', // Firebase logo
      text: `${fullName} entrou pela primeira vez no servidor Resende. Seja bem-vindo!`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('Welcome message written to database.');
  });

exports.verificadorDeAcesso = functions.https.onRequest((request, response) => {
  let dados = JSON.parse(request.body)
  admin.database().ref(`learnup/usuarios/${dados.email}/admin`).once('value').then(snapshot => {
    if(snapshot.exists() && snapshot.val() == dados.uid) {
      response.status(200).send(snapshot.val())
    } else {
      response.status(403).send('Você não possui permissões para acesso')
    }
  })
})