import { Spinner } from 'native-base'
import React, { useEffect, useState, useContext } from 'react'
import { StyleSheet, ScrollView } from 'react-native'
import firebase from "../../firebase"
import { navigate } from '../../RootNavigation'
import { UserContext } from '../context/UserContext'
import Post from "../utils/Post"

const PostView = ({ route }) => {
    const id = route.params 
    const [user , setUser] = useContext(UserContext)
    const [setted, setSetted] = useState(false)
    const [post, setPost] = useState()

    useEffect(() => {
        if (setted == false) {
            firebase.firestore().collection("posts").doc(id).get()
                .then(findPost => {
                    setPost(findPost.data())
                })
        }
    })

    if (!post || !user) {
        return <Spinner />
    }



    return (
        <ScrollView>
            <Post postData={post} user={user} onRefresh={() => navigate("Home")} />
        </ScrollView>
    )
}

export default PostView

const styles = StyleSheet.create({})
