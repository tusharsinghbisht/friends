import { Header } from '@react-navigation/stack'
import React from 'react'
import { Image, StyleSheet } from 'react-native'
import { AntDesign, MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons"
import { Footer, FooterTab, Button, Text } from "native-base"
import { navigate } from '../../RootNavigation'
import { useContext } from 'react'
import { UserContext } from '../context/UserContext'

const BottomNav = () => {
  const SIZE_OF_ICON = 27
  const COLOR_OF_ICON = "white"

  const [user, setUser] = useContext(UserContext)

  return (
    <Footer style={styles.main}>
      <FooterTab style={styles.main}>
        <Button vertical onPress={() => navigate("Home")}>
          <AntDesign name="home" size={SIZE_OF_ICON} color={COLOR_OF_ICON} />
        </Button>

        <Button vertical onPress={() => navigate("Search")}>
          <AntDesign name="search1" size={SIZE_OF_ICON} color={COLOR_OF_ICON} />
        </Button>

        <Button vertical onPress={() => navigate("AddPost")}>
          <AntDesign name="pluscircle" size={SIZE_OF_ICON + 10} color={COLOR_OF_ICON} />
        </Button>

        <Button vertical onPress={() => navigate("Messages")}>
          <FontAwesome name="paper-plane" size={SIZE_OF_ICON} color={COLOR_OF_ICON} />
        </Button>

        <Button vertical onPress={() => navigate("Profile")}>
          {
            user ?
              <Image source={{ uri: user.photo }} style={styles.profileIcon} />
              :
              <MaterialCommunityIcons name="face-profile" size={SIZE_OF_ICON} color={COLOR_OF_ICON} />
          }
        </Button>
      </FooterTab>
    </Footer>
  )
}

export default BottomNav

const styles = StyleSheet.create({
  main: {
    backgroundColor: "#ed9121"
  },
  profileIcon: {
    borderRadius: 100,
    width: 27,
    height: 27,
    borderColor: "white",
    borderWidth: 1
  }
})
