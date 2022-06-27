const firebase = require('firebase/app')
require('firebase/auth') 
require('firebase/firestore')
require('firebase/storage')



// app configuration object.
const firebaseConfig = {
    apiKey: "AIzaSyCIDvGdcbN9H0FWfwrDvxFBniYxLosirLQ",
    authDomain: "e-commerce-app-7430f.firebaseapp.com",
    projectId: "e-commerce-app-7430f",
    storageBucket: "e-commerce-app-7430f.appspot.com",
    messagingSenderId: "288674218275",
    appId: "1:288674218275:web:358e5ed8b9dc87b8b64c96"

}
  

// initializing the firebase app.
try {
    firebase.initializeApp( firebaseConfig )
}
catch( err )
{
    if(!/already exists/.test( err.message )) {
        console.log(`firebase initialization error occurred: ${ err.stack }`)
    }
}



let firebaseAuth = firebase.auth()
let fireStore = firebase.firestore()
let firebaseStorage = firebase.storage()
let timestamp = firebase.firestore.FieldValue.serverTimestamp()


module.exports = { firebaseAuth, fireStore, firebaseStorage }
