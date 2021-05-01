import { Button, Text } from 'native-base'
import React from 'react'
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Linking } from "expo"

const About = () => {
    return (
        <ScrollView>
            <TouchableOpacity onPress={() => Linking.openURL("https://google.com")} style={styles.btn}>
                <Text style={styles.btnTxt}>About App</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => Linking.openURL("https://google.com")} style={styles.btn}>
                <Text style={styles.btnTxt}>Privacy policy</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => Linking.openURL("https://google.com")} style={styles.btn}>
                <Text style={styles.btnTxt}>Terms and Condition</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => Linking.openURL("https://google.com")} style={styles.btn}>
                <Text style={styles.btnTxt}>Developer</Text>
            </TouchableOpacity>
        </ScrollView>
    )
}

export default About

const styles = StyleSheet.create({
    btn: {
        margin: 14,
        padding: 5
    },
    btnTxt: {
        color: "#0027ff",
        textTransform: "capitalize",
        fontFamily: "Raleway"
    }
})
