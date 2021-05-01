import { FontAwesome, Entypo } from '@expo/vector-icons'
import { H2 } from 'native-base'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const AboutUser = ({ user }) => {
    return (
        <View style={styles.about}>
            <Text style={styles.aboutHead}>About</Text>
            <Text style={styles.aboutBio}>{user.bio ? user.bio : "-No Bio available-"}</Text>


            <View style={styles.aboutInfo}>
                <FontAwesome name="transgender" style={styles.aboutIcon} />
                <Text style={styles.aboutTxt}>
                    Gender: {user.gender ? user.gender : "-No Gender available-"}
                </Text>
            </View>
            <View style={styles.aboutInfo}>
                <FontAwesome name="birthday-cake" style={styles.aboutIcon} />
                <Text style={styles.aboutTxt}>
                    Date of Birth: {user.DOB ? user.DOB : "-No DOB available"}
                </Text>
            </View>
            <View style={styles.aboutInfo}>
                <Entypo name="location" style={styles.aboutIcon} />
                <Text style={styles.aboutTxt}>
                    Country: {user.country ? user.country : "-No country available-"}
                </Text>
            </View>
            <View style={styles.aboutInfo}>
                <Entypo name="address" style={styles.aboutIcon} />
                <Text style={styles.aboutTxt}>
                    Address: {user.address ? user.address : "-No address available-"}
                </Text>
            </View>
        </View>
    )
}

export default AboutUser

const styles = StyleSheet.create({
    about: {
        margin: 10
    },
    aboutHead: {
        fontFamily: "Oswald",
        fontSize: 30
    },
    aboutBio: {
        fontFamily: "Raleway",
        paddingVertical: 10,
        borderBottomColor: "black",
        borderBottomWidth: 2
    },
    aboutInfo: {
        flex: 1,
        flexDirection: "row",
        paddingVertical: 10,
        color: "gray",
    },
    aboutIcon: {
        color: "gray",
        fontSize: 25,
        paddingHorizontal: 5
    },
    aboutTxt: {
        color: "gray",
        fontFamily: "Raleway",
        width: 300
    }
})
