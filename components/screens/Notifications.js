import { Button, Spinner } from 'native-base'
import React, { useEffect, useState } from 'react'
import { useContext } from 'react'
import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity, Alert } from 'react-native'
import { UserContext } from '../context/UserContext'
import { navigate } from "../../RootNavigation"
import firebase from "../../firebase"
import { deleteNotification, saveNotification, setNotificationToSeen } from '../utils/SendNotification'
import { FontAwesome, Foundation } from '@expo/vector-icons'

const NotiAction = ({ noti, user, notiUser }) => {
    const btnAction = () => {
        if (noti.docID != null) {
            navigate("PostView", noti.docID)
        } else {
            if (noti.photo == "followRequest") {
                if (user.followers.includes(noti.from) == false) {
                    firebase.firestore().collection("user").doc(user.uid).update({
                        followers: firebase.firestore.FieldValue.arrayUnion(noti.from)
                    }).then(() => {
                        firebase.firestore().collection("user").doc(noti.from).update({
                            following: firebase.firestore.FieldValue.arrayUnion(user.uid)
                        })

                        deleteNotification(noti.id)
                        Alert.alert("Done", "You have a new follower now.")
                        saveNotification({
                            to: notiUser.uid,
                            from: user.uid,
                            title: "Request Accepted",
                            message: `${user.name} excepted your request`,
                            docID: null,
                            photo: "followRequestExcepted"
                        })

                    })
                }
            }
        }
    }

    if (noti || user) {
        if (noti.photo == null) {
            return (
                <TouchableOpacity style={styles.notiPost} onPress={btnAction}>
                    <Image style={styles.notiPost} source={require("../../assets/no-img.jpg")} />
                </TouchableOpacity>
            )
        }
        else if (noti.photo == "follower") {
            return (
                <TouchableOpacity style={styles.notiPost} onPress={btnAction}>
                    <Image style={styles.notiPost} source={require("../../assets/follower.png")} />
                </TouchableOpacity>
            )
        }

        else if (noti.photo == "followRequest") {
            return (
                <Button style={styles.checkBtn} onPress={btnAction}>
                    <Foundation name="check" size={30} color="white" />
                </Button>
            )
        }
        else {
            return (
                <TouchableOpacity style={styles.notiPost} onPress={btnAction}>
                    <Image style={styles.notiPost} source={{ uri: noti.photo }} />
                </TouchableOpacity>
            )
        }
    } else {
        return <></>
    }

}

const NotiBox = ({ noti, user, fetchNotis }) => {
    const [notiUser, setNotiUser] = useState()
    const [setted, setSetted] = useState(false)

    useEffect(() => {
        if (setted == false) {
            firebase
                .firestore()
                .collection("user")
                .doc(noti.from)
                .get()
                .then(findUser => {
                    setNotiUser(findUser.data())
                    if (noti.seen == false) {
                        setNotificationToSeen(noti.id)
                        setSetted(true)
                    }
                })
        }
    })

    const switchScreen = () => {
        if (notiUser && user) {
            navigate("Home")
            if (notiUser.uid == user.uid) {
                navigate("Profile")
            } else {
                navigate("UserProfile", notiUser)
            }
        }
    }

    const askForDelete = () => {
        Alert.alert("Are you sure ?", "Do you want to delete this notification.", [
            {
                text: "Yes",
                onPress: () => deleteNotification(noti.id, fetchNotis)
            },
            {
                text: "No"
            }
        ])
    }

    if (!notiUser) {
        return <Spinner color="red" />
    }

    return (
        <TouchableOpacity onLongPress={askForDelete} onPress={switchScreen} style={styles.noti}>
            <TouchableOpacity onPress={switchScreen}>
                <Image source={{ uri: notiUser.photo }} style={styles.notiPhoto} />
            </TouchableOpacity>
            <View>
                <Text style={styles.notiText}>{noti.message}</Text>
                <Text style={styles.notiDate}>{noti.timestamp.toDate().toString()}</Text>
            </View>
            <NotiAction noti={noti} user={user} notiUser={notiUser} />
        </TouchableOpacity>
    )
}

const Notifications = () => {
    const [user, setUser] = useContext(UserContext)
    const [notis, setNotis] = useState()
    const [notisettd, setNotisettd] = useState(false)

    useEffect(() => {
        if (user) {
            if (notisettd == false) {
                firebase
                    .firestore()
                    .collection("notifications")
                    .where("to", "==", user.uid)
                    .orderBy("timestamp")
                    .onSnapshot(snapshot => {
                        const all_docs = snapshot.docs.reverse()
                        setNotis(all_docs.map(doc => doc.data()))
                        setNotisettd(true)
                    })
            }
        }
    })

    const fetchNotis = () => {
        firebase
            .firestore()
            .collection("notifications")
            .where("to", "==", user.uid)
            .orderBy("timestamp")
            .get()
            .then(querySnapshot => {
                const allNotis = []
                querySnapshot.docs.forEach(doc => allNotis.push(doc.data()))
                setNotis(allNotis.reverse())
            })
    }

    if (!user || !notis) {
        return <Spinner />
    }

    return (
        <ScrollView>
            {
                notis.map(noti => <NotiBox key={noti.id} noti={noti} user={user} fetchNotis={fetchNotis} />)
            }
        </ScrollView>
    )
}

export default Notifications

const styles = StyleSheet.create({
    noti: {
        display: "flex",
        flexDirection: "row",
        margin: 10,
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 10,
        position: "relative"
    },
    notiPhoto: {
        borderRadius: 50 / 2,
        width: 50,
        height: 50,
        margin: 7
    },
    notiText: {
        width: 200
    },
    notiPost: {
        width: 50,
        height: 50,
        position: "absolute",
        right: 0,
        marginHorizontal: 5
    },
    notiDate: {
        color: "gray",
        fontSize: 10
    },
    checkBtn: {
        width: 50,
        height: 50,
        position: "absolute",
        right: 0,
        marginHorizontal: 5,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 50 / 2,
        margin: 10,
        backgroundColor: "red"
    }
})
