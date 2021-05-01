import React, { useState, useEffect, useContext, useRef } from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, LogBox, ScrollView, TextInput, Dimensions, Keyboard, Alert } from "react-native"
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons"
import EditRoom from "../utils/EditRoom"
import firebase from "../../firebase"
import { UserContext } from "../context/UserContext"
import { Button, Spinner } from "native-base"
import { sendPushNotification } from "../utils/SendNotification"
import * as DocumentPicker from "expo-document-picker"
import { Video } from "expo-av"
import { Linking } from "expo"
import Clipboard from "expo-clipboard"

const ChatIcon = ({ icon, name, goBack }) => {
    if (icon) {
        return (
            <View style={styles.iconBox}>
                <TouchableOpacity onPress={goBack}>
                    <AntDesign
                        name="arrowleft"
                        style={{ margin: 5 }}
                        size={25}
                    />
                </TouchableOpacity>
                <Image
                    style={styles.icon}
                    source={{ uri: icon }}
                />
                <Text style={styles.iconTxt}>{name}</Text>
            </View>
        )
    }
    else {
        return (
            <View style={styles.iconBox}>
                <TouchableOpacity onPress={goBack}>
                    <AntDesign
                        name="arrowleft"
                        style={{ margin: 5 }}
                        size={25}
                    />
                </TouchableOpacity>
                <Image
                    style={styles.icon}
                    source={require("../../assets/chatroom.png")}
                />
                <Text style={styles.iconTxt}>{name}</Text>
            </View>
        )
    }
}

const MessageMedia = ({ message }) => {
    const { fileName, file } = message

    if (file && fileName) {
        if (
            fileName.endsWith(".png") ||
            fileName.endsWith(".jpg") ||
            fileName.endsWith(".jpeg") ||
            fileName.endsWith(".webp")
        ) {
            return <Image source={{ uri: file }} style={{ width: 300, height: 200, borderWidth: 1, borderColor: "#00000070", borderRadius: 4 }} />
        }

        else if (
            fileName.endsWith(".mp4") ||
            fileName.endsWith(".avi") ||
            fileName.endsWith(".webm") ||
            fileName.endsWith(".mkv")
        ) {

            return (
                <Video
                    // ref={video}
                    style={{ width: 300, height: 200, borderWidth: 1, borderColor: "#00000070", borderRadius: 4 }}
                    source={{
                        uri: file,
                    }}
                    useNativeControls
                    resizeMode="contain"
                    isLooping
                // onPlaybackStatusUpdate={status => setStatus(() => status)}
                />
            )
        }


        return (
            <View style={{ borderRadius: 7, backgroundColor: "gray", padding: 8, display: "flex", flexDirection: "row" }}>
                <Text style={{ color: "white" }}>{fileName.slice(0, 22)}...</Text>
                <Ionicons onPress={() => Linking.openURL(file)} size={23} color="white" name="download" style={{ marginLeft: 20 }} />
            </View>
        )
    }
    else {
        return (
            <></>
        )
    }
}


const Chat = ({ navigation, route }) => {
    const [user, setUser] = useContext(UserContext)
    const [room, setRoom] = useState(route.params)
    const [messages, setMessages] = useState([])
    const [text, setText] = useState("")
    const scrollViewRef = useRef()
    const [loading, setLoading] = useState(false)
    const [reply, setReply] = useState(null)

    useEffect(() => {
        LogBox.ignoreLogs(["Non-serializable values were found in the navigation state"])
        if (room && user) {
            navigation.setOptions({
                title: null,
                headerRight: () => <EditRoom user={user} room={room} goBack={navigation.goBack} setRoom={setRoom} />,
                headerLeft: () => <ChatIcon goBack={navigation.goBack} icon={room.icon} name={room.name} />
            })

            const unsubscribe = firebase
                .firestore()
                .collection("chatrooms")
                .doc(room.id)
                .collection("messages")
                .orderBy("timestamp")
                .onSnapshot(snapshot => setMessages(snapshot.docs.map(doc => doc.data())))

            return unsubscribe
        }
    }, [room])


    const createID = () => {
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    const notify = (txt) => {
        firebase.firestore().collection("user").get().then(snapshot => {
            snapshot.docs.map(doc => {
                const data = doc.data()
                if (data.uid !== user.uid) {
                    sendPushNotification(data.pushToken, `Message on ${room.name}`, `${user.name} send a message: ${txt}`)
                }
            })
        })
    }

    const updateChats = (time) => {
        firebase.firestore().collection("chatrooms").doc(room.id).update({
            lastMessage: time
        })
    }

    const send = () => {
        if (text.trim() !== "") {
            setText("")
            setReply(null)
            Keyboard.dismiss()
            const id = createID()
            const now = new Date()
            firebase.firestore().collection("chatrooms").doc(room.id).collection("messages").doc(id).set({
                id: id,
                text: text,
                user: user.uid,
                userPhoto: user.photo,
                timestamp: now,
                file: null,
                fileName: null,
                reply: reply
            })
            updateChats(now)
            notify(text)
        }
    }

    const addFile = async () => {
        setLoading(true)
        const result = await DocumentPicker.getDocumentAsync()

        if (result.type == "success" && result.size < 10000000000) {
            const blob = await (await (await fetch(result.uri)).blob())
            const ref = firebase.storage().ref(`messages/${createID()}`)

            ref.put(blob).then(() => {
                ref.getDownloadURL().then(url => {
                    setText("")
                    setReply(null)
                    Keyboard.dismiss()
                    const id = createID()
                    const now = new Date()
                    firebase.firestore().collection("chatrooms").doc(room.id).collection("messages").doc(id).set({
                        id: id,
                        text: text,
                        user: user.uid,
                        userPhoto: user.photo,
                        timestamp: now,
                        file: url,
                        fileName: result.name,
                        reply: reply
                    })
                    updateChats(now)
                    notify(text)
                    setLoading(false)
                })
            })
        } else {
            Alert.alert("Please select a valid file\nMax Size: 10MB")
            setLoading(false)
        }
    }

    const deleteMessage = (msg) => {
        if (user.uid == msg.user) {
            firebase.firestore().collection("chatrooms").doc(room.id).collection("messages").doc(msg.id).delete()
        } else {
            Alert.alert("Error", "You can't delete this")
        }
    }

    const messageAlert = (msg) => {
        Alert.alert("Actions", "", [
            {
                text: "Cancel"
            },
            {
                text: "Reply Message",
                onPress: () => setReply(msg)
            },
            {
                text: "More",
                onPress: () => Alert.alert("More actions", "", [
                    {
                        text: "Cancel"
                    },
                    {
                        text: "Delete Message",
                        onPress: () => deleteMessage(msg)
                    },
                    {
                        text: "Copy text",
                        onPress: () => {
                            Clipboard.setString(msg.text)
                            Alert.alert("Done", "Text copied to clipboard")
                        }
                    },
                ])
            },
        ])
    }

    if (loading) {
        return <Spinner />
    }

    return (
        <View>
            <View style={styles.chatInputMain}>
                <View style={styles.chatInputBox}>
                    <TouchableOpacity style={styles.chatBtn} onPress={addFile}>
                        <Ionicons name="add" size={30} color="white" />
                    </TouchableOpacity>
                    <TextInput
                        placeholder="Enter..."
                        multiline={true}
                        value={text}
                        style={styles.chatInput}
                        onChangeText={txt => setText(txt)}
                        onFocus={() => scrollViewRef.current.scrollToEnd({ animated: true })}
                    />
                    <TouchableOpacity style={styles.chatBtn} onPress={send}>
                        <Ionicons name="send" size={30} color="white" />
                    </TouchableOpacity>
                </View>
                {
                    reply &&
                    <View style={{ position: "relative", backgroundColor: "#00000080", margin: 3, padding: 12, borderRadius: 10 }}>
                        <FontAwesome name="times" color="white" onPress={() => setReply(null)} size={20} style={{ position: "absolute", top: 0, right: 0, margin: 3 }} />
                        <Image source={{ uri: reply.userPhoto }} style={{ width: 40, height: 40, borderRadius: 40 / 2, position: "absolute", right: 0, margin: 3, bottom: 0 }} />

                        <Text style={{ color: "white", fontSize: 12 }}>Replying to:</Text>
                        <Text style={{ color: "white", fontSize: 18 }}>{reply.text}</Text>
                        {
                            reply.file !== null ?
                                reply.fileName.endsWith(".png") || reply.fileName.endsWith(".jpg") || reply.fileName.endsWith(".jpeg") || reply.fileName.endsWith(".webp")
                                    ?
                                    <Image source={{ uri: reply.file }} style={{ width: 40, height: 40 }} />
                                    :
                                    <Image source={require("../../assets/file.png")} style={{ width: 40, height: 40 }} />
                                :
                                <></>
                        }
                    </View>
                }
            </View>

            <ScrollView
                ref={scrollViewRef}
                keyboardShouldPersistTaps="always"
                onContentSizeChange={() => { scrollViewRef.current.scrollToEnd({ animated: true }) }}
                style={styles.messagesContainer}
            >
                {
                    messages.map(msg => (
                        <TouchableOpacity onLongPress={() => messageAlert(msg)} activeOpacity={0.5} key={msg.id} style={msg.user == user.uid ? styles.messageRight : styles.messageLeft}>
                            <Image
                                source={{ uri: msg.userPhoto }}
                                style={msg.user == user.uid ? {} : styles.messageUser}
                            />
                            {
                                msg.reply !== null ?
                                    <View style={{ backgroundColor: "#00000020", position: "relative", padding: 5, borderRadius: 4, minWidth: 200, maxWidth: 320, minHeight: msg.reply.file ? 50 : 10, maxHeight: 50 }}>
                                        <Text>{msg.reply.text}</Text>
                                        {
                                            msg.reply.file !== null ?
                                                msg.reply.fileName.endsWith(".png") || msg.reply.fileName.endsWith(".jpg") || msg.reply.fileName.endsWith(".jpeg") || msg.reply.fileName.endsWith(".webp")
                                                    ?
                                                    <Image source={{ uri: msg.reply.file }} style={{ width: 45, height: 45, position: "absolute", right: 0,margin: 3 }} />
                                                    :
                                                    <Image source={require("../../assets/file.png")} style={{ width: 45, height: 45, position: "absolute", right: 0, margin: 3 }} />
                                                :
                                                <></>
                                        }
                                    </View>
                                    :
                                    <></>
                            }
                            <MessageMedia message={msg} />
                            <Text style={styles.messageTxt} >{msg.text}</Text>
                            <Text style={{ color: "gray", textAlign: "right", fontSize: 11 }}>{ msg.timestamp.toDate().toString().slice(16, 21) }</Text>
                        </TouchableOpacity>
                    ))
                }
            </ScrollView>

        </View>
    )
}

export default Chat

const styles = StyleSheet.create({
    iconBox: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    icon: {
        borderRadius: 40 / 2,
        width: 40,
        height: 40,
        marginLeft: 10
    },
    iconTxt: {
        paddingHorizontal: 3,
        fontSize: 20,
        fontFamily: "Oswald"
    },
    chatInputBox: {
        display: "flex",
        flexDirection: "row",
        backgroundColor: "#79787899",
        alignItems: "center",
        justifyContent: 'center',
        padding: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    chatInput: {
        width: Dimensions.get("window").width - 80,
        backgroundColor: 'white',
        borderRadius: 20,
        height: 50,
        padding: 5,
    },
    chatBtn: {
        marginHorizontal: 5
    },
    messagesContainer: {
        height: Dimensions.get("window").height - 200
    },
    messageLeft: {
        minWidth: 100,
        maxWidth: 350,
        backgroundColor: "#cecece",
        margin: 10,
        marginVertical: 20,
        padding: 10,
        borderRadius: 10,
        borderBottomLeftRadius: 0,
        position: "relative",
        alignSelf: "flex-start"
    },
    messageRight: {
        minWidth: 100,
        maxWidth: 350,
        backgroundColor: "white",
        margin: 20,
        padding: 10,
        borderRadius: 10,
        borderBottomRightRadius: 0,
        position: "relative",
        alignSelf: "flex-end"
    },
    messageUser: {
        width: 40,
        height: 40,
        borderRadius: 40 / 2,
        position: "absolute",
        bottom: -30,
        left: -10,
    },
    messageTxt: {
        fontSize: 15.5
    }
})