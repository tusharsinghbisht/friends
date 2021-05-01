import React, { useContext, useEffect, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Badge, Text } from 'native-base'
import { Entypo } from '@expo/vector-icons'
import firebase from "../../firebase"
import { UserContext } from '../context/UserContext'
import { navigate } from '../../RootNavigation'

const NotificationBtn = () => {
    const [user, setUser] = useContext(UserContext)
    const [notiLen, setNotiLen] = useState(null)

    useEffect(() => {
        if (user) {
            const unsubscribe = firebase
                .firestore()
                .collection("notifications")
                .where("to", "==", user.uid)
                .where("seen", "==", false)
                .onSnapshot(snapshot => setNotiLen(snapshot.docs.length))

            return unsubscribe
        }
    })

    if (notiLen == null) {
        return (
            <View style={{ position: "relative" }}>
                <Entypo
                    onPress={() => navigate("Notifications")}
                    name="bell"
                    size={30}
                    style={{ paddingHorizontal: 15 }}
                />
                <Badge style={{ position: "absolute", top: 0, right: 0, zIndex: 1 }}>
                    <Text>0</Text>
                </Badge>
            </View>
        )
    }

    return (
        <TouchableOpacity style={{ position: "relative" }} onPress={() => navigate("Notifications")} >
            <Entypo
                name="bell"
                size={30}
                style={{ paddingHorizontal: 15 }}
            />
            <Badge style={{ position: "absolute", top: 0, right: 0, zIndex: 1 }}>
                <Text>{notiLen}</Text>
            </Badge>
        </TouchableOpacity>
    )
}

export default NotificationBtn

