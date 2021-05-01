import { Entypo, FontAwesome } from '@expo/vector-icons'
import { Button, Spinner, Text } from 'native-base'
import React, { useState, useContext } from 'react'
import { Alert, Modal, StyleSheet, View } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import firebase from "../../firebase"
import { UserContext } from "../context/UserContext"

const CreateChatRoom = () => {
    const [user, setUser] = useContext(UserContext)
    const [modalVisible, setModalVisible] = useState(false)
    const [roomName, setRoomName] = useState("")
    const [loading, setLoading] = useState(false)

    const createID = () => {
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    const createRoom = () => {
        if (roomName.trim() !== "") {
            setLoading(true)
            const id = createID()
            const date = new Date()
            firebase.firestore().collection("chatrooms").doc(id).set({
                id: id,
                name: roomName,
                creator: user.uid,
                createdAt: date,
                users: [user.uid],
                icon: null,
                lastMessage: date
            })
                .then(() => {
                    setRoomName("")
                    setLoading(false)
                    setModalVisible(false)
                    Alert.alert("Success!", "New room is created.")
                })
        }
    }

    return (
        <View>
            <Modal
                visible={modalVisible}
                animationType="slide"
            >
                <FontAwesome
                    name="times"
                    onPress={() => setModalVisible(false)}
                    style={styles.cancelBtn}
                    size={30}
                />

                <View style={styles.modalMain}>
                    {
                        loading ? 
                            <Spinner />
                            :
                            <View>
                                <Text style={styles.head}>Create Chatroom</Text>
                                <View style={styles.inputBox}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter room name..."
                                        onChangeText={txt => setRoomName(txt)}
                                    />
                                    <Button danger block style={styles.btn} onPress={createRoom}>
                                        <Text>Done</Text>
                                    </Button>
                                </View>
                            </View>
                    }
                </View>
            </Modal>

            <Button transparent onPress={() => setModalVisible(true)}>
                <Entypo
                    name="plus"
                    size={30}
                    style={{ marginHorizontal: 5 }}
                />
            </Button>
        </View>
    )
}

export default CreateChatRoom

const styles = StyleSheet.create({
    cancelBtn: {
        margin: 5,
        position: "absolute",
        top: 0,
        right: 0
    },
    modalMain: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 20
    },
    head: {
        fontSize: 26,
        fontWeight: "bold",
        borderBottomColor: "black",
        borderBottomWidth: 2
    },
    input: {
        borderColor: "black",
        borderRadius: 10,
        borderWidth: 2,
        height: 45,
        width: 200,
        textAlign: "center"
    },
    btn: {
        width: 100,
        borderRadius: 10,
        marginHorizontal: 4
    },
    inputBox: {
        margin: 10,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    }
})