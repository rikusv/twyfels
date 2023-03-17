import { writable, type Writable } from 'svelte/store'
import { TimelineEvents } from './timeline'
import { type FirebaseApp, initializeApp } from 'firebase/app'
import { type Firestore, collection, getFirestore } from 'firebase/firestore'
import { type FirebaseStorage, getStorage } from 'firebase/storage'
import type { User } from 'firebase/auth'

export const user: Writable<User> = writable()
export const token = writable()

const firebaseConfig = {
    apiKey: 'AIzaSyAlGAh1gGOr7CDaL6gHT1Sb-MTlyx2f0Wg',
    authDomain: 'twyfels.firebaseapp.com',
    projectId: 'twyfels',
    storageBucket: 'twyfels.appspot.com',
    messagingSenderId: '675334253316',
    appId: '1:675334253316:web:a0716bda902a016af5be51'
}
export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig)
export const firestore: Firestore = getFirestore(firebaseApp)
export const firebaseStorage: FirebaseStorage = getStorage(firebaseApp)

export const error: Writable<string | null> = writable(null)

interface Progress {
    name: string
    percentage: number
}
export const progress: Writable<Progress[]> = writable([])
export const updateProgress = (name: string, percentage: number) => {
    progress.update((p) => {
        const matches = p.filter((obj) => obj.name === name)
        if (matches.length) {
            matches[0].percentage = percentage
        } else {
            p.push({ name, percentage })
        }
        return p
    })
}

export const removeProgress = (name: string) => {
    progress.update((p) => {
        let deleteIndex = -1
        p.forEach((obj, i) => {
            if (obj.name === name) {
                deleteIndex = i
            }
        })
        if (deleteIndex != -1) {
            p.splice(deleteIndex, 1)
        }
        return p
    })
}

export const timelineEvents = new TimelineEvents()
