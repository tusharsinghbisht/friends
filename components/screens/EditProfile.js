import { Text, Spinner, Content, Form, Item, Input, Picker, Icon, Textarea, Button } from 'native-base'
import React, { useEffect, useState, useContext } from 'react'
import { ScrollView, StyleSheet, View, TextInput, LogBox, Alert } from 'react-native'
import { UserContext } from '../context/UserContext'
import firebase from "../../firebase"
import DateTimePickerModal from "react-native-modal-datetime-picker";

const EditProfile = () => {
    const [user, setUser] = useContext(UserContext)
    const [bio, setBio] = useState(user.bio ? user.bio : "")
    const [address, setAddress] = useState(user.address ? user.address : "")
    const [gender, setGender] = useState(user.gender ? user.gender : "")
    const [country, setCountry] = useState(user.country ? user.country : "")
    const [state, setState] = useState(user.state ? user.state : "")
    const [DOB, setDOB] = useState(user.DOB ? user.DOB : null)
    const [showDOBPicker, setShowDOBPicker] = useState(false)

    const country_list = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Anguilla", "Antigua &amp; Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia &amp; Herzegovina", "Botswana", "Brazil", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Cape Verde", "Cayman Islands", "Chad", "Chile", "China", "Colombia", "Congo", "Cook Islands", "Costa Rica", "Cote D Ivoire", "Croatia", "Cruise Ship", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France", "French Polynesia", "French West Indies", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Kyrgyz Republic", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Namibia", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russia", "Rwanda", "Saint Pierre &amp; Miquelon", "Samoa", "San Marino", "Satellite", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", "St Kitts &amp; Nevis", "St Lucia", "St Vincent", "St. Lucia", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor L'Este", "Togo", "Tonga", "Trinidad &amp; Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks &amp; Caicos", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "Uruguay", "Uzbekistan", "Venezuela", "Vietnam", "Virgin Islands (US)", "Yemen", "Zambia", "Zimbabwe"];

    useEffect(() => LogBox.ignoreLogs(["TypeError: _reactNative.NativeModules"]))

    const submit = () => {
        firebase.firestore().collection("user").doc(user.uid).update({
            bio, address, gender, country, state, DOB
        })
        .then(() => Alert.alert("Success", "Changes were saved"))
    }

    if (!user) {
        <Spinner />
    }

    return (
        <ScrollView>
            <Content>
                <Form style={{ marginTop: 10 }}>

                    <Textarea
                        style={styles.textarea}
                        onChangeText={txt => setBio(txt)}
                        placeholder="Your Bio..."
                        value={bio}
                    />

                    <Item style={styles.item}>
                        <Picker
                            mode="dropdown"
                            iosIcon={<Icon name="arrow-down" />}
                            style={{ width: undefined }}
                            placeholder="Select your Gender"
                            placeholderStyle={{ color: "#bfc6ea" }}
                            placeholderIconColor="#007aff"
                            selectedValue={gender}
                            onValueChange={val => setGender(val)}
                        >
                            <Picker.Item label="Gender" value="" />
                            <Picker.Item label="Male" value="Male" />
                            <Picker.Item label="Female" value="Female" />
                            <Picker.Item label="Other" value="Other" />
                        </Picker>
                    </Item>

                    <Item style={styles.item}>
                        <Picker
                            mode="dialog"
                            iosIcon={<Icon name="arrow-down" />}
                            style={{ width: undefined }}
                            placeholder="Select your Country"
                            placeholderStyle={{ color: "#bfc6ea" }}
                            placeholderIconColor="#007aff"
                            selectedValue={country}
                            onValueChange={val => setCountry(val)}
                        >
                            <Picker.Item label="Country" value="" />
                            {
                                country_list.map(country => <Picker.Item key={country} label={country} value={country} />)
                            }
                        </Picker>
                    </Item>

                    <Item style={styles.item}>
                        <Input
                            onChangeText={txt => setState(txt)}
                            placeholder="Your State..."
                            value={state}
                        />
                    </Item>

                    <Textarea
                        style={styles.textarea}
                        onChangeText={txt => setAddress(txt)}
                        placeholder="Address.."
                        value={address}
                    />

                    <View style={styles.DOBPicker}>
                        <Button success onPress={() => setShowDOBPicker(true)}>
                            <Text>Select DOB</Text>
                        </Button>
                        <Text style={styles.DOBTxt}>{ DOB ? DOB : "Not selected" }</Text>
                        <DateTimePickerModal
                            maximumDate={new Date()}
                            isVisible={showDOBPicker}
                            mode="date"
                            onConfirm={
                                date => {
                                    setDOB(date.toString().substr(4,11))
                                    setShowDOBPicker(false)
                                }
                            }
                            onCancel={() => setShowDOBPicker(false)}
                        />
                    </View>

                    <Button onPress={submit} danger style={{ margin: 10 }} block>
                        <Text>Done</Text>
                    </Button>
                </Form>
            </Content>
        </ScrollView>
    )
}

export default EditProfile

const styles = StyleSheet.create({
    item: {
        marginVertical: 10
    },
    textarea: {
        margin: 10,
        padding: 5,
        borderColor: "#9e9b9b29",
        borderBottomWidth: 1
    },
    DOBPicker: {
        margin: 10,
        display: "flex",
        flexDirection: "row"
    },
    DOBTxt: {
        marginHorizontal: 10,
        color: "gray"
    }
})
