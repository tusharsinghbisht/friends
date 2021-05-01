import { Button, H2, Text, View } from 'native-base'
import React, { useState, useContext } from 'react'
import { Alert, Dimensions, Modal, StyleSheet, TouchableOpacity } from 'react-native'
import firebase from "../../firebase"
import { UserContext } from '../context/UserContext'
import { AntDesign, MaterialIcons, FontAwesome5 } from "@expo/vector-icons"
import { navigate } from '../../RootNavigation'

const Settings = () => {
    const [user, setUser] = useContext(UserContext)
    const [modalVisible, setModalVisible] = useState(false)

    const btns = [
        {
            text: "Edit Profile",
            onPress: () => {
                setModalVisible(false)
                navigate("EditProfile")
            }
        },
        {
            text: "Liked Post",
            onPress: () => {
                setModalVisible(false)
                navigate("LikedPost")
            }
        },
        {
            text: "Lock Profile",
            onPress: () => lockProfile()
        },
        {
            text: "About",
            onPress: () => {
                setModalVisible(false)
                navigate("About")
            }
        }
    ]

    const lockProfile = () => {
        if (user) {
            const ref = firebase.firestore().collection("user").doc(user.uid)
            if (user.locked) {
                ref.update({ locked: false })
                    .then(() => {
                        Alert.alert("Success", "Your Profile is unlocked.")
                        setModalVisible(false)
                    })
            } else {
                ref.update({ locked: true })
                    .then(() => {
                        Alert.alert("Success", "Your profile is locked now")
                        setModalVisible(false)
                    })
            }
        }
    }

    const logout = () => {
        firebase.auth().signOut().then(() => {
            Alert.alert("Logged out", "You are now logged out")
        })
    }

    return (
        <View>
            <Button transparent onPress={() => setModalVisible(true)}>
                <AntDesign name="setting" style={{ margin: 10 }} color="black" size={30} />
            </Button>

            <Modal
                animationType="slide"
                visible={modalVisible}
            >
                <FontAwesome5 style={styles.closeBtn} onPress={() => setModalVisible(false)} name="times" color="black" size={30} />
                <H2 style={styles.head}>Settings</H2>

                <View style={styles.btns}>
                    {
                        btns.map(btn => (
                            <TouchableOpacity onPress={btn.onPress} style={styles.btn} key={btn.text} transparent>
                                <MaterialIcons style={styles.btnIcon} name="double-arrow" />
                                <Text style={styles.btnTxt}>{btn.text}</Text>
                            </TouchableOpacity>
                        ))
                    }
                </View>

                <Button block onPress={logout} style={styles.logoutBtn}>
                    <AntDesign name="logout" size={25} color="white"  />
                    <Text>Logout</Text>
                </Button>
            </Modal>
        </View>

    )
}

export default Settings

const styles = StyleSheet.create({
    head: {
        textTransform: "uppercase",
        textAlign: "center",
        padding: 10,
        backgroundColor: "#00beff",
        color: "white",
        fontFamily: "Raleway"
    },
    closeBtn: {
        position: "absolute",
        top: 0,
        left: 0,
        margin: 10,
        color: "white",
        zIndex: 1
    },
    logoutBtn: {
        position: "absolute",
        width: Dimensions.get("window").width,
        bottom: 0,
        padding: 10,
        backgroundColor: "#332e2e54"
    },
    btns: {
        margin:10
    },
    btn: {
        margin: 10,
        display: "flex",
        flexDirection: 'row',
        alignItems: "center"
    },
    btnIcon: {
        color: "#006bffd4",
        fontSize: 25,
        padding: 10
    },
    btnTxt: {
        color: '#006bffd4',
        fontFamily: "Oswald",
        textTransform: "capitalize",
        fontSize: 20,
        textAlign: 'left'
    }
})