import type { Writable } from 'svelte/store'
import type { CollectionReference } from 'firebase/firestore'
import { deleteDoc, doc, query, getDocs, setDoc, onSnapshot, where, writeBatch } from 'firebase/firestore'
import f3 from 'family-chart/dist/family-chart.js'


export interface PersonData {
    name?: string
    surname?: string
    birthday?: string
    avatar?: string
    gender?: "M" | "F"
}

export interface PersonRels {
    mother: string | null
    father: string | null
    spouses: string[]
    children: string[]
}

export interface IPerson {
    id: string
    data: PersonData
    rels: PersonRels
}

export class Person {
    id: string
    data: PersonData
    rels: PersonRels

    constructor(id: string, data?: PersonData, rels?: PersonRels) {
        this.id = id
        this.data = data || {}
        if (!rels) rels = {mother: "", father: "", children: [], spouses: []}
        if (!rels.mother) rels.mother = ""
        if (!rels.father) rels.father = ""
        if (!rels.children) rels.children = []
        if (!rels.spouses) rels.spouses = []
        this.rels = rels
    }

    static fromObj(obj: IPerson): Person {
        return new Person(obj.id, obj.data, obj.rels)
    }

    get obj(): IPerson {
        return {
            id: this.id,
            data: this.data,
            rels: this.rels
        }
    }
}

export interface PersonDataUpdate extends PersonData {
    id: string
    type: "data"
}

export interface RelationshipUpdate {
    id: string
    type: "relationship"
    setMother?: string | null
    setFather?: string | null
    addSpouse?: string
    removeSpouse?: string
    addChild?: string
    removeChild?: string
}

export class Tree {
    collectionRef: CollectionReference
    $data: Writable<Person[]>
    data: Person[] = []
    error: any

    constructor(collectionRef: CollectionReference, prop: Writable<Person[]>, error: any) {
        this.collectionRef = collectionRef
        this.$data = prop
        this.error = error
    }

    async getData() {
        const q = query(this.collectionRef)
        onSnapshot(
            q,
            (snapshot) => {
                const data: Person[] = []
                snapshot.forEach((doc) => {
                    const personObj = doc.data()
                    data.push(new Person(personObj.id, personObj.data, personObj.rels))
                })
                this.data = data
                this.$data.set(data)
            },
            (err) => this.error.set(err)
        )
    }

    render(container: Element) {
        const data = this.data.map(d => d.obj)
        this.data.forEach((person) => (person.data.avatar = `./images/${person.id}.jpg`))
        const store = f3.createStore({
            data,
            node_separation: 250,
            level_separation: 150
        }),
            view = f3.d3AnimationView({
                store,
                cont: container
            }),
            Card = f3.elements.Card({
                store,
                svg: view.svg,
                card_dim: {
                    w: 220,
                    h: 70,
                    text_x: 75,
                    text_y: 15,
                    img_w: 60,
                    img_h: 60,
                    img_x: 5,
                    img_y: 5
                },
                card_display: [
                    (d: Person) => `${d.data.name || ''} ${d.data.surname || ''}`,
                    (d: Person) => `${d.data.birthday || ''}`
                ],
                mini_tree: true,
                link_break: false
            })

        view.setCard(Card)
        store.setOnUpdate((props) => view.update(props || {}))
        store.update.tree({ initial: true })
    }

    get ids(): string[] {
        return this.data.map((person) => person.id)
    }

    idExists(id: string): boolean {
        return this.ids.indexOf(id) > -1
    }

    async getOrCreatePerson(id: string): Promise<Person> {
        if (id === '') throw Error("Person ID cannot be empty")
        let person: Person
        const q = query(this.collectionRef, where('id', '==', id))
        const querySnapshot = await getDocs(q)
        if (querySnapshot.docs.length > 1) {
            const message = `Oops, more than 1 person with id ${id}`
            this.error.set(message)
            throw Error(message)
        } else if (querySnapshot.docs.length === 0) {
            const docRef = doc(this.collectionRef.firestore, this.collectionRef.path, id)
            person = new Person(id)
            await setDoc(docRef, person.obj, { merge: true })
        } else {
            const personObj = querySnapshot.docs[0].data()
            person = new Person(id, personObj.data, personObj.rels)
        }
        return person
    }

    async deletePerson(id: string) {
        const docRef = doc(this.collectionRef.firestore, this.collectionRef.path, id)
        await deleteDoc(docRef)
    }

    async updatePersons(persons: Person[]) {
        const batch = writeBatch(this.collectionRef.firestore)
        persons.forEach((person) => {
            const docRef = doc(this.collectionRef.firestore, this.collectionRef.path, person.id)
            batch.set(docRef, person.obj)
        })
        await batch.commit()
    }

    updatePersonData(id: string, personData: PersonData) {
        this.getOrCreatePerson(id).then((person => {
            person.data = { ...person.data, ...personData }
            this.updatePersons([person])
        }))
    }

    async setParent(id: string, parentId: string | null, parentType: 'mother' | 'father') {
        const updates: Person[] = []
        const child = await this.getOrCreatePerson(id)
        if (child.rels[parentType]) {
            const currentParentId = child.rels[parentType] as string
            const currentParent = await this.getOrCreatePerson(currentParentId)
            currentParent.rels.mother = null
            updates.push(currentParent)
        }
        if (parentId) {
            child.rels.mother = parentId
            const newParent = await this.getOrCreatePerson(parentId)
            if (newParent.rels.children?.indexOf(id) === -1) {
                newParent.rels.children.push(id)
                updates.push(newParent)
            }
        } else {
            delete child.rels[parentType]
        }

        updates.push(child)
        this.updatePersons(updates)
    }

    setMother(id: string, motherId: string | null) {
        this.setParent(id, motherId, 'mother')
    }

    setFather(id: string, fatherId: string | null) {
        this.setParent(id, fatherId, 'father')
    }

    async updateSpouse(spouses: [string, string], operation: 'add' | 'remove') {
        const spouseOne = await this.getOrCreatePerson(spouses[0])
        const spouseTwo = await this.getOrCreatePerson(spouses[1])
        const pairs = [[spouseOne, spouseTwo], [spouseTwo, spouseOne]]
        const updates: Person[] = []
        pairs.forEach(async ([spouse1, spouse2]) => {
            if (!spouse1.rels.spouses) {
                spouse1.rels.spouses = []
            }
            if (operation === 'add') {
                if (spouse1.rels.spouses.indexOf(spouse2.id) === -1) {
                    spouse1.rels.spouses.push(spouse2.id)
                }
            } else if (operation === 'remove') {
                const spouseIndex = spouse1.rels.spouses.indexOf(spouse2.id)
                if (spouseIndex !== -1) {
                    spouse1.rels.spouses.splice(spouseIndex, 1)
                }
            }
            updates.push(spouse1)
        })
        this.updatePersons(updates)
    }

    addSpouse(spouses: [string, string]) {
        debugger
        this.updateSpouse(spouses, 'add')
    }

    removeSpouse(spouses: [string, string]) {
        this.updateSpouse(spouses, 'remove')
    }

    async addChild(id: string, childId: string) {
        const parent = await this.getOrCreatePerson(id)
        const parentType = parent.data.gender === 'F' ? 'mother' : 'father'
        this.setParent(childId, id, parentType)
    }

    async removeChild(id: string, childId: string) {
        const parent = await this.getOrCreatePerson(id)
        const parentType = parent.data.gender === 'F' ? 'mother' : 'father'
        this.setParent(childId, null, parentType)
    }

}
