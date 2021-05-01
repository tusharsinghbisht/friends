import React, { useState, useEffect } from 'react'
import { Image, View } from 'react-native'
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { navigate, navigationRef } from "./RootNavigation"
import Home from "./components/screens/Home"
import Profile from "./components/screens/Profile"
import AddPost from "./components/screens/AddPost"
import BottomNav from './components/utils/BottomNav'
import Messages from './components/screens/Messages'
import Notifications from './components/screens/Notifications'
import Login from './components/utils/Login'
import firebase from "./firebase"
import { Spinner, Text } from 'native-base'
import Settings from "./components/utils/Settings"
import Search from './components/screens/Search'
import UserProfile from "./components/screens/UserProfile"
import NotificationBtn from './components/utils/NotificationBtn'
import PostView from './components/screens/PostView'
import EditProfile from "./components/screens/EditProfile"
import LikedPost from './components/screens/LikedPost'
import About from './components/screens/About'
import CreateChatRoom from './components/utils/CreateChatRoom'
import Chat from "./components/screens/Chat"

const Navigation = () => {
    const Stack = createStackNavigator();
    const [user, setUser] = useState()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        firebase.auth().onAuthStateChanged(user => {
            setUser(user)
            setLoading(false)
        })
    })

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Image style={{ width: 120, height: 120 }} source={require("./assets/icon.png")} />
                <Spinner color="#43kl3h" size="large" />
                <Text style={{ fontFamily: "Raleway", position: "absolute", bottom: 100, fontSize: 23 }}>
                    Made In India
                </Text>
            </View>
        )
    } else {
        if (!user) {
            return <Login />
        }

        return (
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator
                    screenOptions={{
                        headerStyle: {
                            borderBottomColor: "#ed9121",
                            borderBottomWidth: 2
                        }
                    }}>

                    <Stack.Screen
                        name="Home"
                        component={Home}
                        options={{
                            title: "Friends",
                            headerTitleAlign: "center",
                            headerTitleStyle: {
                                fontFamily: "Dancing-Script",
                                fontSize: 30,
                            },
                            headerLeft: () => <NotificationBtn />
                        }}
                    />

                    <Stack.Screen
                        name="Profile"
                        component={Profile}
                        options={{
                            title: "Profile",
                            headerTitleAlign: "center",
                            headerRight: () => <Settings />
                        }}
                    />

                    <Stack.Screen
                        name="AddPost"
                        component={AddPost}
                        options={{
                            title: "Create a Post",
                            headerTitleAlign: "center"
                        }}
                    />

                    <Stack.Screen
                        name="Search"
                        component={Search}
                        options={{
                            title: "Search For Friends",
                            headerTitleAlign: "center"
                        }}
                    />


                    <Stack.Screen
                        name="UserProfile"
                        component={UserProfile}
                        options={{
                            title: "User Profile",
                            headerTitleAlign: "center"
                        }}
                    />

                    <Stack.Screen
                        name="Messages"
                        component={Messages}
                        options={{
                            title: "Messages",
                            headerTitleAlign: "center",
                            headerRight: () => <CreateChatRoom />
                        }}
                    />

                    <Stack.Screen
                        name="Chat"
                        component={Chat}
                        options={{
                            title: "Chat",
                        }}
                    />

                    <Stack.Screen
                        name="Notifications"
                        component={Notifications}
                        options={{
                            title: "Notifications",
                            headerTitleAlign: "center"
                        }}
                    />

                    <Stack.Screen
                        name="PostView"
                        component={PostView}
                        options={{
                            title: "Post"
                        }}
                    />

                    <Stack.Screen
                        name="EditProfile"
                        component={EditProfile}
                        options={{
                            title: "Edit Profile",
                            headerTitleAlign: "center"
                        }}
                    />

                    <Stack.Screen
                        name="LikedPost"
                        component={LikedPost}
                        options={{
                            title: "Liked Posts",
                            headerTitleAlign: "center"
                        }}
                    />

                    <Stack.Screen
                        name="About"
                        component={About}
                        options={{
                            title: "About",
                            headerTitleAlign: "center"
                        }}
                    />

                </Stack.Navigator>
                <BottomNav />
            </NavigationContainer>
        )
    }

}

export default Navigation

