import React, { useState } from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import firebase from "../../firebase"
import * as GoogleSignIn from "expo-google-app-auth"
import { Button, Spinner } from 'native-base'
import { AntDesign } from "@expo/vector-icons"

const Login = () => {
    const ANDROID_CLIENT_ID = "504927310725-rstrnh15sae10tbj0dbas84j68e3c6ni.apps.googleusercontent.com"

    const [loading, setLoading] = useState(false)

    const signIn = async () => {
        try {
            setLoading(true)
            const result = await GoogleSignIn.logInAsync({
                androidStandaloneAppClientId: ANDROID_CLIENT_ID,
                androidClientId: ANDROID_CLIENT_ID,
                scopes: ["profile", "email"],
                behavior: "web"
            })
            if (result.type == "success") {
                const googleCredential = firebase.auth.GoogleAuthProvider.credential(result.idToken);
                const { user } = await firebase.auth().signInWithCredential(googleCredential)
                let ref = firebase.firestore().collection("user").doc(user.uid)
                ref.get().then(findUser => {
                    if (!findUser.exists) {
                        ref.set({
                            uid: user.uid,
                            name: user.displayName,
                            nameLower: user.displayName.toLowerCase(),
                            email: user.email,
                            photo: user.photoURL,
                            following: [],
                            followers: []
                        })
                    }
                })
                alert("You logged in as " + user.email);
            } else {
                setLoading(false)
                alert("Operation cancelled!")
            }
        } catch (e) {
            console.log(e)
            setLoading(false)
            alert("An Error Occured!")
        }
    }

    if (loading) {
        return (
            <View style={styles.main}>
                <Spinner color="red" />
            </View>
        )
    }

    return (
        <View style={styles.main}>
            <View style={styles.circle} />
            <View style={styles.circle2} />
            <Text style={styles.txt}>Login to Friends..</Text>
            <Button style={styles.btn} onPress={signIn} large transparent block danger >
                <AntDesign name="google" size={30} color="white" style={{ padding: 10 }} />
                <Text style={styles.btnTxt}>SIGN IN</Text>
            </Button>
        </View>
    )
}

export default Login

const styles = StyleSheet.create({
    circle: {
        width: Dimensions.get("window").width-40,
        height: Dimensions.get("window").width-40,
        position: "absolute",
        backgroundColor: "#ffb700d4",
        top: -100,
        left: 100,
        borderRadius: 1000 / 2,
    },
    circle2: {
        width: Dimensions.get("window").width+20,
        height: Dimensions.get("window").width+20,
        position: "absolute",
        backgroundColor: "#ff650075",
        top: -100,
        right: 100,
        borderRadius: 1000 / 2,
    },
    main: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    txt: {
        fontSize: 40,
        fontFamily: "Dancing-Script",
        color: '#ff4100'
    },
    btn: {
        margin: 20,
        alignItems: "center",
        justifyContent: 'center',
        padding: 20,
        backgroundColor: "#ff5900c9"
    },
    btnTxt: {
        fontSize: 20,
        fontWeight: "bold",
        color: 'white'
    }
})
