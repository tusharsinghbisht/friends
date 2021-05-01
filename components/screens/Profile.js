import React, { useState, useContext, useEffect } from 'react'
import { Button, H1, Spinner, Tabs, Tab, TabHeading, Text, H2 } from 'native-base'
import { Alert, Dimensions, Image, Modal, ScrollView, StyleSheet, View } from 'react-native'
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler'
import { UserContext } from "../context/UserContext"
import * as ImagePicker from "expo-image-picker"
import firebase from "../../firebase"
import { Entypo, FontAwesome, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import FollowModal from '../utils/FollowModal'
import Post from '../utils/Post'
import AboutUser from '../utils/AboutUser'
import PostImgView from '../utils/PostImgView'

const Profile = () => {
    const [user, setUser] = useContext(UserContext)
    const [modal, setModal] = useState(false)
    const [nameInput, setNameInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [followingModal, setFollowingModal] = useState(false)
    const [followersModal, setFollowersModal] = useState(false)
    const [posts, setPosts] = useState([])
    const [postSetted, setPostSetted] = useState(false)

    useEffect(() => {
        if (user) {
            if (postSetted == false) {
                firebase.firestore().collection("posts").where("user", "==", user.uid).orderBy("timestamp").get()
                    .then(findPosts => {
                        const allPosts = []
                        findPosts.docs.forEach(doc => {
                            allPosts.push(doc.data())
                        })
                        setPosts(allPosts.reverse())
                        setPostSetted(true)
                    })
            }
        }
    })

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
            const ref = firebase.storage().ref(`user-photos/${user.uid}`)
            const blob = await (await (await fetch(result.uri)).blob())
            const put = await ref.put(blob)
            const url = await ref.getDownloadURL()
            await firebase.firestore().collection("user").doc(user.uid).update({
                photo: url
            })
            const findUser = await firebase.firestore().collection("user").doc(user.uid).get()
            setUser(findUser.data())
        }
        setLoading(false)
    }

    const selectMode = () => {
        Alert.alert("Choose Image", "Please select a image", [
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

    const changeName = async () => {
        if (nameInput.trim() !== "") {
            await firebase.firestore().collection("user").doc(user.uid).update({
                name: nameInput,
                nameLower: nameInput.toLowerCase()
            })
            setNameInput("")
            setModal(false)
        }
    }

    if (!user) {
        return <Spinner />
    }
    return (
        <ScrollView>
            <View style={styles.center}>
                <Modal
                    animationType="slide"
                    visible={modal}
                >
                    <View style={styles.modal}>
                        <TextInput value={nameInput} onChangeText={txt => setNameInput(txt)} placeholder="Enter Name.." style={styles.input} />

                        <Button onPress={changeName} style={styles.modalBtn2} success block>
                            <Text style={{ color: "white" }}>OK</Text>
                        </Button>

                        <Button onPress={() => setModal(false)} transparent style={styles.modalBtn}>
                            <FontAwesome name="times" size={30} />
                        </Button>
                    </View>
                </Modal>

                {
                    loading ?
                        <Spinner color="#448495" />
                        :
                        <TouchableOpacity onLongPress={selectMode}>
                            <Image style={styles.photo} source={{ uri: user.photo }} />
                        </TouchableOpacity>

                }
                <TouchableOpacity onLongPress={() => setModal(true)}>
                    <H1 style={styles.name}>{user.name}</H1>
                </TouchableOpacity>
                <View style={styles.followInfo}>

                    <TouchableOpacity onPress={() => setFollowersModal(true)} style={styles.followInfoInner}>
                        <FollowModal
                            heading="Followers"
                            users={user.followers}
                            visible={followersModal}
                            setVisible={setFollowersModal}
                        />
                        <Text>
                            followers {user.followers.length}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setFollowingModal(true)} style={styles.followInfoInner}>
                        <FollowModal
                            heading="Following"
                            users={user.following}
                            visible={followingModal}
                            setVisible={setFollowingModal}
                        />
                        <Text>
                            following {user.following.length}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
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
                    <AboutUser user={user} />
                </Tab>
            </Tabs>
        </ScrollView>
    )
}

export default Profile

const styles = StyleSheet.create({
    modal: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height
    },
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
    modalBtn: {
        position: "absolute",
        top: 0,
        right: 0,
        margin: 10,
    },
    modalBtn2: {
        margin: 20,
        marginHorizontal: 30,
    },
    input: {
        fontSize: 20,
        height: 50,
        width: Dimensions.get("window").width - 100,
        borderBottomColor: "#1514143d",
        borderBottomWidth: 2,
        padding: 10
    },
    followInfo: {
        display: "flex",
        flexDirection: "row"
    },
    followInfoInner: {
        padding: 10
    }
})
