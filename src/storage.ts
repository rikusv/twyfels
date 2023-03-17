import { uploadBytesResumable, getDownloadURL, type StorageReference } from "firebase/storage"
import { error, updateProgress, removeProgress } from "./stores"


export const getStorageUrl = async (fileRef: StorageReference, file?: File): Promise<string> => {
    let url: string = ""
    await getDownloadURL(fileRef)
        .then((r) => {
            url = r
        })
        .catch(async (err) => {
            if (err.code !== 'storage/object-not-found') {
                error.set(err.message)
                throw err
            } else {
                if (file) {
                    await uploadFile(fileRef, file)
                    url = await getStorageUrl(fileRef)
                }
            }
        })
    return url
}

export const uploadFile = async (fileRef: StorageReference, file: File): Promise<string> => {
    const uploadTask = uploadBytesResumable(fileRef, file)
    const waiter = new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
            (snapshot) => {
                const progressPercentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                updateProgress(fileRef.name, progressPercentage)
            },
            (err) => {
                error.set(err.message)
                removeProgress(fileRef.name)
                reject(err)
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    removeProgress(fileRef.name)
                    resolve(downloadURL)
                });
            }
        );
    })
    return waiter

}
