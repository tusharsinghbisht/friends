import React, { useState, useEffect } from 'react'
import { Alert, Dimensions, Image, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { AntDesign, FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons"
import { Button, Spinner, Text } from 'native-base'
import firebase from "../../firebase"
import * as ImagePicker from "expo-image-picker"
import { ScrollView } from 'react-native-gesture-handler'
import { navigate } from "../../RootNavigation"
import { saveNotification, sendPushNotification } from "../utils/SendNotification"

const RoomUser = ({ id, creator, closeModal, user }) => {
    const [roomUser, setRoomUser] = useState()

    useEffect(() => {
        const unsubscribe = firebase.firestore().collection("user").doc(id).onSnapshot(snapshot => setRoomUser(snapshot.data()))

        return unsubscribe
    })

    const switchScreen = () => {
        closeModal(false)
        navigate("Home")
        if (id == user.uid) {
            navigate("Profile")
        } else {
            navigate("UserProfile", roomUser)
        }
    }

    if (!roomUser) {
        return <Spinner color="blue" />
    } else {
        return (
            <TouchableOpacity activeOpacity={0.8} onPress={switchScreen} style={styles.roomUser}>
                <Image source={{ uri: roomUser.photo }} style={styles.roomUserPhoto} />
                <Text style={styles.roomUserName}>{roomUser.name} {id == creator && "(Admin)"}</Text>
            </TouchableOpacity>
        )
    }
}

const EditRoom = ({ room, goBack, setRoom, user }) => {
    const [roomModal, setRoomModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [roomName, setRoomName] = useState(room ? room.name : "")
    const [memberModal, setMemberModal] = useState(false)
    const [memberSearchList, setMemberSearchList] = useState([])
    const [memberModalLoading, setMemberModalLoading] = useState(false)

    const changeRoomName = () => {
        if (roomName.trim() !== "") {
            setLoading(true)
            firebase.firestore().collection("chatrooms").doc(room.id).update({ name: roomName })
                .then(() => {
                    firebase.firestore().collection("chatrooms").doc(room.id).get().then(findRoom => {
                        setRoom(findRoom.data())
                        setLoading(false)
                        setRoomModal(false)
                    })
                })
        }
    }

    const deleteRoom = () => {
        setRoomModal(false)
        firebase.firestore().collection("chatrooms").doc(room.id).delete().then(() => goBack())
    }

    const pickImage = async (mode) => {
        setLoading(true)
        let result;
        let options = { allowsEditing: true }
        if (mode == "camera") {
            result = await ImagePicker.launchCameraAsync(options)
        } else {
            result = await ImagePicker.launchImageLibraryAsync(options)
        }

        if (!result.cancelled) {
            const ref = firebase.storage().ref(`chatrooms/${room.id}`)
            const blob = await (await (await fetch(result.uri)).blob())
            const put = await ref.put(blob)
            const url = await ref.getDownloadURL()
            await firebase.firestore().collection("chatrooms").doc(room.id).update({
                icon: url
            })
            const findRoom = await firebase.firestore().collection("chatrooms").doc(room.id).get()
            setRoom(findRoom.data())
        }
        setLoading(false)
    }

    const askForChangeImage = () => {
        Alert.alert("Select Image", "", [
            {
                text: "Use Camera",
                onPress: () => pickImage("camera")
            },
            {
                text: "Choose from library",
                onPress: () => pickImage("library")
            },
            {
                text: "Cancel"
            }
        ])
    }

    const addRoomUser = (_user) => {
        setMemberModalLoading(true)
        firebase.firestore().collection("chatrooms").doc(room.id).update({ users: firebase.firestore.FieldValue.arrayUnion(_user.uid) }).then(() => {
            firebase.firestore().collection("chatrooms").doc(room.id).get().then(findRoom => {
                setRoom(findRoom.data())
                setMemberModal(false)
                setMemberModalLoading(false)
                saveNotification({
                    to: _user.uid,
                    from: user.uid,
                    title: "New Chat Room",
                    message: `You are added to ${room.name} by ${user.name}`,
                    photo: room.icon,
                    docID: null
                })
                if (_user.pushToken) {
                    sendPushNotification(
                        _user.pushToken,
                        "New Chat Room",
                        `You are added to ${room.name} by ${user.name}`,
                        {}
                    )
                }
                Alert.alert("Done!", "A New User is Added")
            })
        })
    }

    const searchForUsers = (searchTerm) => {
        if (!searchTerm.trim() == "") {
            firebase.firestore()
                .collection("user")
                .where("nameLower", ">=", searchTerm.toLowerCase())
                .where("nameLower", "<=", searchTerm.toLowerCase() + '\uf8ff')
                .get()
                .then(querySnapshot => {
                    setMemberSearchList(querySnapshot.docs.map(doc => doc.data()))
                })
        }
    }

    const exitRoom = () => {
        firebase.firestore().collection("chatrooms").doc(room.id).update({
            users: firebase.firestore.FieldValue.arrayRemove(user.uid)
        }).then(() => {
            setRoomModal(false)
            navigate("Messages")
        })
    }

    return (
        <View>
            <Modal
                visible={memberModal}
                animationType="slide"
            >
                {
                    memberModalLoading ?
                        <Spinner />
                        :
                        <>
                            <FontAwesome
                                name="times"
                                size={30}
                                style={styles.closeBtn}
                                onPress={() => {
                                    setMemberModal(false)
                                    setRoomModal(true)
                                }
                                }
                            />
                            <Text style={styles.memberModalHead}>Add Member</Text>

                            <TextInput
                                style={styles.memberModalSearch}
                                placeholder="Search for users..."
                                onChangeText={txt => searchForUsers(txt)}
                            />

                            {
                                memberSearchList.map(_user => (
                                    user.uid == _user.uid || room.users.includes(_user.uid) ?
                                        <View key={_user.uid} />
                                        :
                                        <TouchableOpacity activeOpacity={0.7} style={styles.memberModalListItem} key={_user.uid} onPress={() => addRoomUser(_user)}>
                                            <Image source={{ uri: _user.photo }} style={styles.memberModalListItemImage} />
                                            <Text>{_user.name}</Text>
                                        </TouchableOpacity>
                                ))
                            }
                        </>
                }
            </Modal>

            <Modal
                visible={roomModal}
                animationType="slide"
            >
                <ScrollView>

                    <View style={styles.modalContent}>
                        {
                            !loading ?
                                <>
                                    <FontAwesome name="times" size={30} style={styles.closeBtn} onPress={() => setRoomModal(false)} />
                                    {
                                        user.uid == room.creator ?
                                        <MaterialIcons name="delete" size={30} style={styles.deleteBtn} onPress={deleteRoom} />
                                        :
                                        <Ionicons name="exit" size={30} style={styles.deleteBtn} onPress={exitRoom} />
                                            
                                    }
                                    <TouchableOpacity onPress={askForChangeImage}>
                                        {
                                            room.icon ?
                                                <Image source={{ uri: room.icon }} style={styles.roomIcon} />
                                                :
                                                <Image source={require("../../assets/chatroom.png")} style={styles.roomIcon} />
                                        }
                                    </TouchableOpacity>
                                    <View style={styles.nameBox}>
                                        <TextInput
                                            style={styles.nameInput}
                                            placeholder="Enter room name"
                                            value={roomName}
                                            onChangeText={txt => setRoomName(txt)}
                                        />
                                        <Button danger onPress={changeRoomName} style={styles.nameBtn}>
                                            <AntDesign name="check" size={25} color="white" />
                                        </Button>
                                    </View>
                                    <Button onPress={() => {
                                        setRoomModal(false)
                                        setMemberModal(true)
                                    }} block success>
                                        <Text>Add Member</Text>
                                    </Button>

                                    {
                                        room.users.map(id => <RoomUser user={user} closeModal={setRoomModal} key={id} creator={room.creator} id={id} />)
                                    }
                                </>

                                :
                                <Spinner />
                        }

                    </View>
                </ScrollView>
            </Modal>

            <Button onPress={() => setRoomModal(true)} transparent>
                <MaterialIcons name="more-vert" size={25} style={{ margin: 10 }} color="black" />
            </Button>
        </View>
    )
}

export default EditRoom

const styles = StyleSheet.create({
    closeBtn: {
        position: "absolute",
        top: 0,
        right: 0,
        margin: 10
    },
    deleteBtn: {
        position: "absolute",
        top: 0,
        left: 0,
        margin: 10
    },
    modalContent: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    roomIcon: {
        width: 150,
        height: 150,
        borderRadius: 200 / 2,
        borderWidth: 1,
        borderColor: "black"
    },
    nameBox: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 12
    },
    nameInput: {
        borderBottomColor: "#00000020",
        borderBottomWidth: 2,
        height: 30,
        margin: 10,
        width: 300
    },
    nameBtn: {
        padding: 10
    },
    roomUser: {
        display: 'flex',
        flexDirection: "row",
        alignItems: 'center',
        marginVertical: 5,
        backgroundColor: "#f4f4f4",
        width: Dimensions.get("window").width
    },
    roomUserPhoto: {
        width: 70,
        height: 70,
        borderRadius: 70 / 2,
        margin: 4
    },
    memberModalHead: {
        fontSize: 25,
        margin: 5,
        fontFamily: "Oswald",
        borderBottomWidth: 2,
        borderBottomColor: "black"
    },
    memberModalSearch: {
        width: Dimensions.get("window").width,
        borderBottomWidth: 0.5,
        height: 30,
        borderBottomColor: "gray",
        margin: 5
    },
    memberModalListItemImage: {
        width: 70,
        height: 70,
        borderRadius: 70 / 2,
        margin: 3
    },
    memberModalListItem: {
        width: Dimensions.get("window").width - 10,
        backgroundColor: "#f5f5f5",
        margin: 7,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    }
})
