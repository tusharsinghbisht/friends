import { FontAwesome } from '@expo/vector-icons'
import { Button, H2, Spinner } from 'native-base'
import React from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, Image, ScrollView } from 'react-native'
import { navigate } from "../../RootNavigation"
import firebase from "../../firebase"
import { useContext } from 'react'
import { UserContext } from '../context/UserContext'

class User extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
            user: null
        }
    }

    async setUser () {
        const findUser = await firebase.firestore().collection("user").doc(this.props.uid).get()
        this.setState({ user: findUser.data() })
    }

    componentDidMount() {
        this.setUser()
    }  


    render() {
        return (
            this.state.user ?
                <TouchableOpacity onPress={() => this.props.switchScreen(this.state.user)} style={styles.profile}>
                    <Image source={{ uri: this.state.user.photo }} style={styles.profileImg} />
                    <Text style={styles.profileName}>{this.state.user.name}</Text>
                </TouchableOpacity>
                :
                <Spinner />
        )
    }
}

const FollowModal = ({ users, heading, visible, setVisible }) => {
    const [user, setUser] = useContext(UserContext)

    const switchScreen = (user_) => {
        if (user) {
            setVisible(false)
            if (user.uid == user_.uid) {
                navigate("Profile")
            } else {
                navigate("Home")
                navigate("UserProfile", user_)
            }
        }
    }

    return (
        <Modal
            animationType="slide"
            visible={visible}
        >
            <H2 style={styles.heading}>{heading}</H2>
            <ScrollView>
                {
                    users.map(uid => (
                        <User uid={uid} key={uid} switchScreen={switchScreen} />
                    ))
                }
            </ScrollView>
            <Button onPress={() => setVisible(false)} transparent style={styles.closeBtn}>
                <FontAwesome name="times" size={30} />
            </Button>
        </Modal>
    )
}

export default FollowModal

const styles = StyleSheet.create({
    heading: {
        padding: 12,
        fontFamily: "Oswald",
        borderBottomColor: "black",
        borderBottomWidth: 3
    },
    closeBtn: {
        position: "absolute",
        top: 0,
        right: 0,
        padding: 10
    },
    profile: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        borderColor: "#13121280",
        borderWidth: 1.5,
        padding: 5,
        borderRadius: 7,
        margin: 10,
        backgroundColor: "#f3f3f3"
    },
    profileImg: {
        width: 50,
        height: 50,
        borderColor: "#13121280",
        borderWidth: 1,
        borderRadius: 100,
    },
    profileName: {
        paddingHorizontal: 10
    }
})
