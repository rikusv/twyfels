
import { type Writable, writable } from 'svelte/store'
import { error, firestore, firebaseStorage } from './stores'
import { addDoc, deleteDoc, collection, doc, query, setDoc, onSnapshot, WriteBatch } from 'firebase/firestore'
import { ref } from "firebase/storage"
import { getStorageUrl } from './storage' 

export interface TimelineDate {
    year: number
    month: number
    day: number
}

export interface TimelineText {
    headline: string
    text: string
}

export interface TimelineMedia {
    url: string
    caption: string
    thumbnail: string
    title: string
}

export interface TimelineBackground {
    url?: string
    color: string
}

export interface TimelineEventData {
    start_date: TimelineDate
    end_date: TimelineDate
    text: TimelineText
    media: TimelineMedia
    group: string
    background: TimelineBackground
}

export const timelineEventData = (): TimelineEventData => ({
    start_date: {
        year: 2000,
        month: 1,
        day: 1
    },
    text: {
        headline: "",
        text: ""
    },
    end_date: {
        year: 0,
        month: 0,
        day: 0
    },
    media: {
        url: "",
        caption: "",
        thumbnail: "",
        title: ""
    },
    group: "",
    background: {
        color: ""
    }
})


export class TimelineEvent {
    data: TimelineEventData
    id: string | undefined
    mediaFiles: FileList| null = null
    mediaThumbnailFiles: FileList | null = null
    constructor(data: TimelineEventData, id?: string) {
        this.data = data
        this.id = id
    }

    async save() {
        if (this.mediaFiles && this.mediaFiles.length) {
            const name = this.mediaFiles[0].name.split(/(\\|\/)/g).pop()
            const fileRef = ref(firebaseStorage, `images/${name}`)
            this.data.media.url = await getStorageUrl(fileRef, this.mediaFiles[0])
        }
        if (this.mediaThumbnailFiles && this.mediaThumbnailFiles.length) {
            const name = this.mediaThumbnailFiles[0].name.split(/(\\|\/)/g).pop()
            const fileRef = ref(firebaseStorage, `images/${name}`)
            this.data.media.thumbnail = await getStorageUrl(fileRef, this.mediaThumbnailFiles[0])
        }
        if (this.id) {
            const docRef = doc(firestore, 'timeline', this.id)
            await setDoc(docRef, this.data, { merge: true })
        } else {
            const docRef = await addDoc(collection(firestore, 'timeline'), this.data)
            this.id = docRef.id
        }
    }

    async delete() {
        if (this.id) {
            const docRef = doc(firestore, 'timeline', this.id)
            await deleteDoc(docRef)
        } else {
            throw Error('Can only delete event with ID')
        }
    }

    get dataCopy(): TimelineEventData {
        return { ...this.data }
    }
}

export class TimelineEvents {
    listening: boolean = false
    _events: Writable<TimelineEvent[]> = writable()
    constructor() { }
    get events(): Writable<TimelineEvent[]> {
        if (!this.listening) {
            const q = query(collection(firestore, 'timeline'))
            onSnapshot(
                q,
                (snapshot) => {
                    const data: TimelineEvent[] = []
                    snapshot.forEach((doc) => {
                        const docData = doc.data() as TimelineEventData
                        data.push(new TimelineEvent(docData, doc.id))
                    })
                    this._events.set(data)
                },
                (err) => error.set(err.message)
            )
        }
        return this._events
    }
}