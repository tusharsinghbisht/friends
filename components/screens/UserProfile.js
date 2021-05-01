import { Button, H1, Tabs, Tab, TabHeading } from 'native-base'
import React, { useContext, useState, useEffect } from 'react'
import { Alert, StyleSheet, Text, Image, View, TouchableOpacity, ScrollView } from 'react-native'
import { UserContext } from '../context/UserContext'
import FollowModal from "../utils/FollowModal"
import firebase from "../../firebase"
import Post from '../utils/Post'
import { saveNotification, sendPushNotification } from '../utils/SendNotification'
import AboutUser from '../utils/AboutUser'
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import PostImgView from "../utils/PostImgView"

const UserProfile = ({ route, navigation }) => {
    const [user, setUser] = useContext(UserContext)
    const [currentUser, setCurrentUser] = useState(route.params)
    const [followingModal, setFollowingModal] = useState(false)
    const [followersModal, setFollowersModal] = useState(false)
    const [posts, setPosts] = useState([])
    const [postSetted, setPostSetted] = useState(false)

    useEffect(() => {
        if (!currentUser) {
            navigation.navigate("Home")
            Alert.alert("Error", "User Not Available")
        } else {
            if (user.uid == currentUser.uid) {
                navigation.navigate("Profile")
            } else {
                navigation.setOptions({
                    title: currentUser.name
                })
                if (postSetted == false) {
                    firebase.firestore().collection("posts").where("user", "==", currentUser.uid).orderBy("timestamp").get().then(findPosts => {
                        const allPosts = []
                        findPosts.docs.forEach(doc => {
                            allPosts.push(doc.data())
                        })
                        setPosts(allPosts.reverse())
                        setPostSetted(true)
                    })
                }
            }
        }
    })


    const follow = () => {
        if (user.following.includes(currentUser.uid)) {
            //unfollow
            firebase.firestore().collection("user").doc(user.uid).update({
                following: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
            })
                .then(() => {
                    firebase.firestore().collection("user").doc(currentUser.uid).update({
                        followers: firebase.firestore.FieldValue.arrayRemove(user.uid)
                    })
                        .then(() => {
                            firebase.firestore().collection("user").doc(currentUser.uid).get()
                                .then(snapshot => {
                                    setCurrentUser(snapshot.data())
                                })
                        })
                })
        } else {
            //follow

            if (currentUser.locked) {
                saveNotification({
                    to: currentUser.uid,
                    from: user.uid,
                    photo: "followRequest",
                    docID: null,
                    title: "Following Request",
                    message: `${currentUser.name} want to follow you`
                })

                if (currentUser.pushToken) {
                    sendPushNotification(currentUser.pushToken, "Following Request", `${user.name} want to follow you`, {})
                }
                Alert.alert("Done", "Following request sent.")
            } else {

                firebase.firestore().collection("user").doc(user.uid).update({
                    following: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
                })
                    .then(() => {
                        firebase.firestore().collection("user").doc(currentUser.uid).update({
                            followers: firebase.firestore.FieldValue.arrayUnion(user.uid)
                        })
                            .then(() => {
                                firebase.firestore().collection("user").doc(currentUser.uid).get()
                                    .then(snapshot => {
                                        setCurrentUser(snapshot.data())


                                        saveNotification({
                                            to: currentUser.uid,
                                            from: user.uid,
                                            title: "New Follower",
                                            message: `You have a new follower ${user.name}.`,
                                            photo: "follower",
                                            docID: null
                                        })
                                        if (currentUser.pushToken) {
                                            sendPushNotification(currentUser.pushToken, "New Follower", `You have a new follower ${user.name}.`, {})
                                        }
                                    })
                            })
                    })
            }

        }
    }

    return (
        <ScrollView>
            <View style={styles.center}>
                <Image style={styles.photo} source={{ uri: currentUser.photo }} />
                <View>
                    <H1 style={styles.name}>{currentUser.name}</H1>
                    {
                        currentUser.followers.includes(user.uid) ?
                            <Button onPress={follow} block style={styles.unfollowBtn}>
                                <Text style={styles.followBtnText}>Unfollow</Text>
                            </Button>
                            :
                            <Button onPress={follow} block style={styles.followBtn}>
                                <Text style={styles.followBtnText}>Follow</Text>
                            </Button>
                    }
                </View>
            </View>

            {
                !currentUser.locked || currentUser.followers.includes(user.uid) ?
                    <View style={styles.followInfo}>

                        <TouchableOpacity onPress={() => setFollowersModal(true)} style={styles.followInfoInner}>
                            <FollowModal
                                heading="Followers"
                                users={currentUser.followers}
                                visible={followersModal}
                                setVisible={setFollowersModal}
                            />
                            <Text>
                                followers {currentUser.followers.length}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setFollowingModal(true)} style={styles.followInfoInner}>
                            <FollowModal
                                heading="Following"
                                users={currentUser.following}
                                visible={followingModal}
                                setVisible={setFollowingModal}
                            />
                            <Text>
                                following {currentUser.following.length}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    :
                    <></>
            }

            {
                !currentUser.locked || currentUser.followers.includes(user.uid) ?

                    <Tabs tabBarActiveTextColor="blue">
                        <Tab
                            heading={
                                <TabHeading style={{ backgroundColor: "white" }}>
                                    <Ionicons name="apps-sharp" color="black" size={30} />
                                </TabHeading>
                            }
                        >
                            {
                                postSetted ?
                                    posts.map(post => <PostImgView key={post.id} post={post} />)
                                    :
                                    <></>
                            }
                        </Tab>
                        <Tab
                            heading={
                                <TabHeading style={{ backgroundColor: "white" }}>
                                    <MaterialCommunityIcons name="face-profile" color="black" size={30} />
                                </TabHeading>
                            }
                        >
                            <AboutUser user={currentUser} />
                        </Tab>
                    </Tabs>
                    :
                    <View style={styles.lockView}>
                        <AntDesign name="lock" size={50} color="black" />
                        <Text>This Profile Is locked.</Text>
                    </View>
            }
        </ScrollView>
    )
}

export default UserProfile

const styles = StyleSheet.create({
    center: {
        alignItems: 'center'
    },
    name: {
        fontFamily: "Raleway"
    },
    photo: {
        padding: 10,
        width: 150,
        height: 150,
        borderRadius: 100
    },
    followInfo: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    followInfoInner: {
        padding: 10
    },
    followBtn: {
        margin: 10,
        backgroundColor: "#0048ff"
    },
    unfollowBtn: {
        margin: 10,
        backgroundColor: "red"
    },
    followBtnText: {
        color: "white",
        textTransform: "uppercase",
        margin: 10
    },
    lockView: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 50
    }
})
