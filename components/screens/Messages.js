import { Text, Spinner } from 'native-base'
import React, { useEffect, useState, useContext } from 'react'
import { StyleSheet, View, ScrollView, Image, TouchableOpacity } from 'react-native'
import firebase from "../../firebase"
import { UserContext } from "../context/UserContext"

const Messages = ({ navigation }) => {
    const [user, setUser] = useContext(UserContext)
    const [rooms, setRoom] = useState()

    useEffect(() => {
        if (user) {
            const unsubscribe = firebase.firestore().collection("chatrooms").where("users", "array-contains", user.uid).orderBy("lastMessage").onSnapshot(snapshot => {
                setRoom(snapshot.docs.reverse().map(doc => doc.data()))
            })

            return unsubscribe
        }
    }, [rooms])

    if (!user) {
        return <Spinner />
    }

    return (
        <ScrollView>
            {
                rooms && rooms.map(room => (
                    <TouchableOpacity onPress={() => navigation.navigate("Chat", room)} activeOpacity={0.8} key={room.id} style={styles.room}>
                        {
                            room.icon !== null ?
                                <Image source={{ uri: room.icon }} style={styles.roomImg} />
                                :
                                <Image source={require("../../assets/chatroom.png")} style={styles.roomImg} />
                        }
                        <Text style={styles.roomName}>{room.name}</Text>
                    </TouchableOpacity>
                ))
            }
        </ScrollView>
    )
}

export default Messages

const styles = StyleSheet.create({
    addBtn: {
        margin: 8,
        backgroundColor: "#0027ff96"
    },
    room: {
        backgroundColor: "#00000070",
        margin: 8,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 20,
        padding: 5
    },
    roomImg: {
        width: 70,
        height: 70,
        borderRadius: 70 / 2,
    },
    roomName: {
        color: "white",
        marginHorizontal: 3,
        fontFamily: "Oswald"
    }
})
