import * as firebase from "firebase"
import "firebase/auth"
import "firebase/firestore"
import "firebase/storage"

const firebaseConfig = {
    apiKey: "AIzaSyCNI40iHvzh7CyxRc1pPdz-aE4tKumzWAU",
    authDomain: "shopozo-746ba.firebaseapp.com",
    projectId: "shopozo-746ba",
    storageBucket: "shopozo-746ba.appspot.com",
    messagingSenderId: "504927310725",
    appId: "1:504927310725:web:05f84ad60f0045c844eaec",
    databaseURL: "https://shopozo-746ba-default-rtdb.firebaseio.com/"
};

firebase.initializeApp(firebaseConfig)

export default firebase