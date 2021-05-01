import "react-native-gesture-handler"
import React, { useState, useEffect } from 'react'
import { ActivityIndicator, LogBox } from "react-native"
import Navigation from "./Navigation"
import * as Font from "expo-font"
import { Ionicons } from "@expo/vector-icons"
import { UserProvider } from "./components/context/UserContext"

const App = () => {
  const [fontLoaded, setFontLoaded] = useState(false)

  useEffect(() => {
    LogBox.ignoreLogs(["Can't perform a React state"])
    const fetchFonts = async () => {
      await Font.loadAsync({
        "Dancing-Script": require("./assets/fonts/DancingScript-Medium.ttf"),
        "Raleway": require("./assets/fonts/Raleway-Regular.ttf"),
        "Oswald": require("./assets/fonts/Oswald-Regular.ttf"),
        Roboto: require("native-base/Fonts/Roboto.ttf"),
        Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
        ...Ionicons.font,
      })
      setFontLoaded(true)
    }
    fetchFonts()
  })

  if (!fontLoaded) {
    return <ActivityIndicator color="red" size="large" style={{ flex: 1 }} />

  }

  return (
    <UserProvider>
      <Navigation />
    </UserProvider>
  )
}

export default App

