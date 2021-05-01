import { Spinner } from 'native-base'
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { useContext } from 'react'
import { Button, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import firebase from "../../firebase"
import { UserContext } from "../context/UserContext"
import Post from '../utils/Post'
import * as Notifications from "expo-notifications"
import Constants from "expo-constants"

const Home = ({ navigation }) => {
    const [user, setUser] = useContext(UserContext)
    const [posts, setPosts] = useState([])
    const [refreshing, setRefreshing] = useState(false)
    const [postSetted, setPostSetted] = useState(false)
    
    useEffect(() => {
        if (user) {
            if (!user.pushToken) {
                registerForPushNotificationsAsync()
            }

            
            
            if (postSetted == false) {
                const unsubscribe =
                    firebase.firestore().collection("posts").where("user", "in", [user.uid, ...user.following]).orderBy("timestamp").onSnapshot(querySnapshot => {
                        const all_docs = querySnapshot.docs.reverse()
                        setPosts(all_docs.map(doc => doc.data()));
                        setPostSetted(true)
                    })
                return unsubscribe
            }
        }
    })

    const fetchPost = () => {
        firebase.firestore().collection("posts").where("user", "in", [user.uid, ...user.following]).orderBy("timestamp").get().then(querySnapshot => {
            const all_docs = querySnapshot.docs.reverse()
            setPosts(all_docs.map(doc => doc.data()));
        })
    }

    const registerForPushNotificationsAsync = async () => {
        let token;
        if (Constants.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }
            token = (await Notifications.getExpoPushTokenAsync()).data;
            firebase.firestore().collection("user").doc(user.uid).update({ pushToken: token })
        } else {
            alert('Must use physical device for Push Notifications');
        }

        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        return token
    }

    const onRefresh = () => {
        setRefreshing(true)
        fetchPost()
        setRefreshing(false)
    }

    if (!user) {
        return <Spinner />
    }

    return (
        <ScrollView style={{ backgroundColor: "#ffffff61" }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            <View>
                {
                    posts.map(post => (
                        <Post key={post.id} postData={post} user={user} onRefresh={onRefresh} />
                    ))
                }
            </View>
        </ScrollView>
    )
}

export default Home

const styles = StyleSheet.create({})
