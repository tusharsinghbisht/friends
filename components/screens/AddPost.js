import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons'
import { Button, Spinner, Textarea } from 'native-base'
import React from 'react'
import { useState } from 'react'
import { StyleSheet, Text, Alert, ScrollView, Image, View, Dimensions } from 'react-native'
import * as ImagePicker from "expo-image-picker"
import firebase from "../../firebase"
import { useContext } from 'react'
import { UserContext } from "../context/UserContext"

const AddPost = () => {
    const [user, setUser] = useContext(UserContext)
    const [images, setImages] = useState([])
    const [descInput, setDescInput] = useState("")
    const [loading, setLoading] = useState(false)

    const pickImage = async (mode) => {
        if (images.length >= 5) {
            Alert.alert("Warning", "Images already selected")
        } else {
            let result;
            let options = {}
            if (mode == "camera") {
                result = await ImagePicker.launchCameraAsync(options)
            } else {
                result = await ImagePicker.launchImageLibraryAsync(options)
            }

            if (!result.cancelled) {
                setLoading(true)
                const blob = await (await (await fetch(result.uri)).blob())
                const ref = firebase.storage().ref(`posts/${createID()}`)

                ref.put(blob).then(() => {
                    ref.getDownloadURL().then(url => {
                        setImages([...images, url])
                        setLoading(false)
                    })
                })
            }
        }
    }

    const selectMode = () => {
        Alert.alert("Choose Images", "", [
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

    const createID = () => {
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    const removeImg = (image) => {
        const allImgs = []
        images.forEach(img => {
            if (img !== image) {
                allImgs.push(img)
            }
        })
        setImages(allImgs)
    }

    const submitPost = () => {
        if (images.length == 0) {
            Alert.alert("Warning", "Please add a image first")
        } else {
            setLoading(true)

            if (images.length !== 0) {
                const postID = createID()
                firebase.firestore().collection("posts").doc(postID).set({
                    id: postID,
                    user: user.uid,
                    desc: descInput,
                    likes: [],
                    comments: [],
                    images: images,
                    timestamp: new Date()
                })
                    .then(() => {
                        setLoading(false)
                        setDescInput("")
                        setImages([])
                        Alert.alert("Success!", "Post is posted")
                    })

            }
        }
    }

    if (!user || loading) {
        return <Spinner />
    }

    return (
        <ScrollView>
            <Textarea
                placeholder="Write something..."
                style={styles.textInput}
                value={descInput}
                onChangeText={txt => setDescInput(txt)}
            />
            {
                images.length !== 0 ?
                    images.map(img => (
                        <View key={img} style={styles.allSelectedImages}>
                            <FontAwesome name="times" onPress={() => removeImg(img)} size={30} style={styles.cancelBtn} />
                            <Image source={{ uri: img }} style={styles.selectedImage} />
                        </View>
                    ))
                    :
                    <></>

            }
            {
                images.length >= 5 ?
                    <></>
                    :
                    <Button block style={styles.btn} onPress={selectMode}>
                        <MaterialCommunityIcons style={styles.btnIcon} name="image-plus" size={25} />
                        <Text style={styles.btnTxt}>Add Image</Text>
                    </Button>
            }
            <Button block style={styles.btn2} onPress={submitPost} success>
                <Text style={styles.btnTxt}>Submit</Text>
            </Button>
        </ScrollView>
    )
}

export default AddPost

const styles = StyleSheet.create({
    btn: {
        backgroundColor: "#008eff",
        margin: 10
    },
    btn2: {
        backgroundColor: "red",
        margin: 10
    },
    btnTxt: {
        textTransform: "uppercase",
        fontSize: 15,
        color: "white"
    },
    btnIcon: {
        color: "white",
        paddingHorizontal: 10
    },
    center: {
        textAlign: 'center',
        padding: 10
    },
    textInput: {
        margin: 10,
        borderBottomWidth: 2,
        height: 100,
        backgroundColor: "white"
    },
    infoText: {
        color: "red",
        textAlign: "center",
    },
    allSelectedImages: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderColor: "blue",
        borderWidth: 1,
        shadowColor: "black",
        shadowRadius: 10,
        margin: 10
    },
    selectedImage: {
        width: Dimensions.get("window").width - 50,
        height: Dimensions.get("window").height - 200,
    },
    cancelBtn: {
        position: "absolute",
        top: 0,
        left: 0,
        color: "white",
        zIndex: 10,
        padding: 10,
        borderBottomRightRadius: 7,
        backgroundColor: "blue"
    }
})
