import { AntDesign } from '@expo/vector-icons'
import { Button, Spinner } from 'native-base'
import React from 'react'
import { useContext } from 'react'
import { useState } from 'react'
import { Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import firebase from "../../firebase"
import { navigate } from '../../RootNavigation'
import { UserContext } from "../context/UserContext"

const Search = () => {
    const [user, setUser] = useContext(UserContext)
    const [searchResults, setSearchResults] = useState([])
    const [infoText, setInfoText] = useState("Type to search")

    const searchForUsers = (searchTerm) => {
        if (!searchTerm.trim() == "") {
            firebase.firestore()
                .collection("user")
                .where("nameLower", ">=", searchTerm.toLowerCase())
                .where("nameLower", "<=", searchTerm.toLowerCase() + '\uf8ff')
                .get()
                .then(querySnapshot => {
                    if (querySnapshot.docs.length == 0) {
                        setInfoText("Nothing Can be found")
                    } else {
                        const allsearchresult = []
                        querySnapshot.docs.forEach(doc => {
                            allsearchresult.push(doc.data())
                        })
                        setSearchResults(allsearchresult)
                    }
                })
        }
    }

    const switchScreen = (user) => {
        navigate("Home")
        navigate("UserProfile", user)
    }

    if (!user) {
        return <Spinner />
    }

    return (
        <View>
            <View style={styles.searchBox}>
                <TextInput
                    placeholder="Search by name.."
                    style={styles.searchInput}
                    onChangeText={txt => searchForUsers(txt)}
                />
            </View>

            {
                searchResults.length == 0 ?
                    <Text style={styles.center}>{infoText}</Text>
                    :
                    <ScrollView style={styles.searchResults}>
                        {
                            searchResults.map(res => (
                                res.uid == user.uid ?
                                    <View key={user.uid}></View>
                                    :
                                    <TouchableOpacity key={res.uid} onPress={() => switchScreen(res)} style={styles.searchResultCard}>
                                        <Image source={{ uri: res.photo }} style={styles.searchResultImage} />
                                        <Text style={styles.searchResultName}>{res.name}</Text>
                                    </TouchableOpacity>

                            ))
                        }
                    </ScrollView>
            }
        </View>
    )
}

export default Search

const styles = StyleSheet.create({
    searchBox: {
        display: "flex",
        flexDirection: "row",
        margin: 7,
        backgroundColor: "gray",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 7
    },
    searchInput: {
        color: "black",
        padding: 10,
        backgroundColor: "white",
        margin: 7,
        borderRadius: 5,
        width: Dimensions.get("window").width - 50,
    },
    searchBtn: {
        padding: 10,
        margin: 7
    },
    center: {
        textAlign: "center",
        color: "gray",
        padding: 10,
    },
    searchResults: {
        overflow: 'scroll',
        height: 600
    },
    searchResultCard: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        borderColor: "gray",
        borderBottomWidth: 2,
        margin: 10,
        backgroundColor: 'white',
        borderRadius: 10
    },
    searchResultImage: {
        margin: 10,
        width: 70,
        height: 70,
        borderRadius: 100
    },
    searchResultName: {
        fontFamily: "Raleway"
    }
})
