import React, { createContext, useEffect, useState } from 'react'
import firebase from "../../firebase"

export const UserContext = createContext()

export const UserProvider = (props) => {
    const [user, setUser] = useState()

    const fetchUser = async (user) => {
        if(user) {
            const findUser = await firebase.firestore().collection("user").doc(user.uid).get()
            setUser(findUser.data())
        }
    }

    useEffect(() => {
        firebase.auth().onAuthStateChanged(user => {
           fetchUser(user)
        })
    })

    return (
        <UserContext.Provider value={[user, setUser]}>
            {props.children}
        </UserContext.Provider>
    )
}
