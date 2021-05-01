import { Spinner } from 'native-base'
import React from 'react'
import { Dimensions, StyleSheet, Image, TouchableOpacity, View } from 'react-native'
import { navigate } from '../../RootNavigation'

const PostImgView = ({ post }) => {
    if (!post) {
        return <Spinner />
    }
    return (
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigate("PostView", post.id)}>
            <Image source={{ uri: post.images[0] }} style={styles.postImg} />
        </TouchableOpacity>
    )
}

export default PostImgView

const styles = StyleSheet.create({
    postImg: {
        width: Dimensions.get("window").width - 30,
        borderRadius: 10,
        height: 500,
        margin: 10
    }
})
