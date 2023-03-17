import { initializeApp } from "firebase/app"
import { getFirestore, collection, onSnapshot, getDocs } from 'firebase/firestore'
import express from 'express'
import cors from 'cors'

const config = {
    apiKey: "AIzaSyA2UrVcfcR3_co-0SRvggAfritNB832t-4",
    authDomain: "send-mail-news.firebaseapp.com",
    projectId: "send-mail-news",
    storageBucket: "send-mail-news.appspot.com",
    messagingSenderId: "735458348101",
    appId: "1:735458348101:web:f9b766555f1f8427fee72c"
}

const firebaseApp = initializeApp(config)
const db = getFirestore(firebaseApp)
const ref = collection(db, "anunciantes")
const anunciantes = []
const app = express()
let receiveFirebaseData = false

onSnapshot(ref, querySnapshot => {
    anunciantes.length = 0
    querySnapshot.forEach(doc => anunciantes.push(doc.data()))
    receiveFirebaseData = true
})

const port = process.env.PORT || 3333

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

app.use(cors())

app.get("/", (req, res) => {
    if (receiveFirebaseData) {
        res.send(anunciantes)
    } else {
        getDocs(citiesRef).then(querySnapshot => {
            anunciantes.length = 0
            querySnapshot.forEach(doc => anunciantes.push(doc.data()))
            receiveFirebaseData = true
            res.send(anunciantes)
        })
    }
})