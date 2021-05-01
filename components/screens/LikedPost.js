import { Spinner } from 'native-base'
import React, { useContext, useEffect, useState } from 'react'
import { Dimensions, ScrollView, StyleSheet } from 'react-native'
import firebase from "../../firebase"
import { UserContext } from "../context/UserContext"
import PostImgView from "../utils/PostImgView"

const LikedPost = () => {
    const [user, setUser] = useContext(UserContext)
    const [posts, setPosts] = useState()
    const [setted, setSetted] = useState(false)

    useEffect(() => {
        if (user) {
            if (setted == false) {
                firebase
                    .firestore()
                    .collection("posts")
                    .where("likes", "array-contains", user.uid)
                    // .orderBy("timestmap")
                    .get()
                    .then(snapshot => {
                        const allPosts = []
                        snapshot.docs.forEach(doc => allPosts.push(doc.data()))
                        setPosts(allPosts.reverse())
                        setSetted(true)
                    })
            }
        }
    })

    if (!user || !posts) {
        return <Spinner />
    }

    return (
        <ScrollView>
            {
                setted ?
                    posts.map(post => <PostImgView key={post.id} post={post} />)
                    :
                    <></>
            }
        </ScrollView>
    )
}

export default LikedPost

const styles = StyleSheet.create({
    postImg: {
        width: Dimensions.get("window").width - 10,
        borderRadius: 10,
        height: 500
    }
})
