import { initializeApp } from "firebase/app"
import {
    getFirestore,
    collection,
    onSnapshot,
    getDocs,
    getDoc,
    doc,
    setDoc,
    updateDoc
} from 'firebase/firestore'
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
const anunciantesRef = collection(db, "anunciantes")
const anunciantes = []
const app = express()

onSnapshot(anunciantesRef, querySnapshot => {
    anunciantes.length = 0
    querySnapshot.forEach(doc => anunciantes.push(doc.data()))
})

const port = process.env.PORT || 3333

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

app.use(cors())

app.get("/", (req, res) => {
    if (anunciantes.length > 0) {
        anunciantes.forEach(ad => delete ad.range)
        res.send(anunciantes)
    } else {
        getDocs(anunciantesRef).then(querySnapshot => {
            anunciantes.length = 0
            querySnapshot.forEach(doc => anunciantes.push(doc.data()))
            anunciantes.forEach(ad => delete ad.range)
            res.send(anunciantes)
        })
    }
})

app.post('/post', function (req, res) {
    const postQuery = req.query
    const docRef = doc(db, 'statistics', postQuery.id)
    getDoc(docRef)
        .then(snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.data()
                if (data.hasOwnProperty(postQuery.type))
                    data[postQuery.type] = data[postQuery.type] + 1
                else data[postQuery.type] = 1
                updateDoc(docRef, data)
                    .then(() => {
                        const day = new Date().toLocaleDateString().replace(/\//g, '-')
                        const ref = doc(db, `statistics/${postQuery.id}/byDay`, day)
                        const dataDay = { clicks: 0, views: 0, prints: 0 }
                        dataDay[postQuery.type] = dataDay[postQuery.type] + 1
                        updateDoc(ref, dataDay)
                    })
                    .catch(err => console.log(err))
            } else {
                const data = { clicks: 0, views: 0, prints: 0 }
                data[postQuery.type] = data[postQuery.type] + 1
                setDoc(docRef, data)
                    .then(() => {
                        const day = new Date().toLocaleDateString().replace(/\//g, '-')
                        const ref = doc(db, `statistics/${postQuery.id}/byDay`, day)
                        const dataDay = { clicks: 0, views: 0, prints: 0 }
                        dataDay[postQuery.type] = dataDay[postQuery.type] + 1
                        setDoc(ref, dataDay)
                    })
                    .catch(err => console.log(err))
            }
        })
    res.send('Data updated on Firebase')
})