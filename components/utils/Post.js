import React, { useState, useEffect } from 'react'
import { AntDesign, FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons"
import { StyleSheet, View, Image, Dimensions, Modal, ScrollView, TextInput, Alert, TouchableOpacity } from 'react-native'
import { Card, CardItem, Thumbnail, Text, Button, Left, Body, Right, Spinner, H2 } from 'native-base';
import { navigate } from "../../RootNavigation"
import firebase from "../../firebase"
import { saveNotification, sendPushNotification } from './SendNotification';
import { SliderBox } from "react-native-image-slider-box"

const Comment = ({ data, user, closeModal }) => {
    const [comment, setComment] = useState(data)
    const [commentUser, setCommentUser] = useState()

    useEffect(() => {
        if (!commentUser) {
            firebase.firestore().collection("user").doc(comment.user).get()
                .then(user => setCommentUser(user.data()))
        }
    })

    const switchScreen = () => {
        if (commentUser || user) {
            closeModal(false)
            if (user.uid == commentUser.uid) {
                navigate("Home")
                navigate("Profile")
            } else {
                navigate("Home")
                navigate("UserProfile", commentUser)
            }
        }
    }

    if (!commentUser) {
        return <Spinner />
    }

    return (
        <TouchableOpacity onPress={switchScreen} style={styles.comment}>
            <View style={styles.commentView}>
                <Image style={styles.commentPhoto} source={{ uri: commentUser.photo }} />
                <View style={styles.commentText}>
                    <Text style={styles.commentName}>{commentUser.name}</Text>
                    <Text style={styles.commentValue}>{comment.value}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}


const Post = ({ postData, user, onRefresh }) => {
    const [post, setPost] = useState(postData)
    const [postUser, setPostUser] = useState()
    const [liked, setLiked] = useState()
    const [commentVisible, setCommentVisible] = useState(false)
    const [commentValue, setCommentValue] = useState("")
    const [commentLoading, setCommentLoading] = useState(false)
    const [comments, setComments] = useState([])

    useEffect(() => {
        if (!postUser) {
            if (post.likes.includes(user.uid)) {
                setLiked(true)
            } else {
                setLiked(false)
            }
            firebase.firestore().collection("user").doc(post.user).get()
                .then(user => {
                    setPostUser(user.data())
                    setComments(post.comments)
                })
        }
    })

    const createID = () => {
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    const comment = () => {
        if (commentValue.trim() !== "") {
            setCommentLoading(true)
            const comment = {
                id: createID(),
                user: user.uid,
                time: new Date(),
                value: commentValue
            }

            firebase.firestore().collection("posts").doc(post.id).update({
                comments: firebase.firestore.FieldValue.arrayUnion(comment)
            }).then(() => {
                firebase.firestore().collection("posts").doc(post.id).get().then(new_post => {
                    setPost(new_post.data())
                    setComments(new_post.data().comments)
                    setCommentLoading(false)
                    setCommentValue("")

                    if (postUser.uid !== user.uid) {
                        saveNotification({
                            to: postUser.uid,
                            from: user.uid,
                            title: "New Comment",
                            message: `${user.name} commented '${comment.value}' on your post.`,
                            photo: post.images[0],
                            docID: post.id
                        })
                        if (postUser.pushToken) {
                            sendPushNotification(postUser.pushToken, "New Comment", `${user.name} commented '${comment.value}' on your post.`, {})
                        }
                    }
                })
            })
        } else {
            Alert.alert("Warning", "Enter Something...")
        }
    }

    const unlike = () => {
        setLiked(false)

        if (post.likes.includes(user.uid)) {
            const ref = firebase.firestore().collection("posts").doc(post.id)
            ref.update({
                likes: firebase.firestore.FieldValue.arrayRemove(user.uid)
            })
                .then(() => {
                    ref.get()
                        .then(new_post => setPost(new_post.data()))
                })
        }
    }

    const like = () => {
        setLiked(true)
        const ref = firebase.firestore().collection("posts").doc(post.id)

        if (!post.likes.includes(user.uid)) {
            ref.update({
                likes: firebase.firestore.FieldValue.arrayUnion(user.uid)
            })
                .then(() => {
                    ref.get()
                        .then(new_post => {
                            setPost(new_post.data())

                            if (postUser.uid !== user.uid) {
                                saveNotification({
                                    to: postUser.uid,
                                    from: user.uid,
                                    title: "New Like", message: `${user.name} liked your post.`,
                                    photo: post.images[0],
                                    docID: post.id
                                })
                                if (postUser.pushToken) {
                                    sendPushNotification(postUser.pushToken, "New Like", `${user.name} liked your post.`, {})
                                }
                            }
                        })
                })
        }
    }

    const deletePost = () => {
        if (user.uid == postUser.uid) {
            //delete
            firebase.firestore().collection("posts").doc(post.id).delete()
                .then(() => {
                    setPost(null)
                })
        }
    }

    const askForDeletePost = () => {
        Alert.alert("Are You Sure!", "Do You want to delete this.", [
            {
                text: "Yes",
                onPress: () => deletePost()
            }, {
                text: "No"
            }
        ])
    }

    const switchScreen = () => {
        if (user || postUser) {
            if (postUser.uid == user.uid) {
                navigate("Profile")
            } else {
                navigate("Home")
                navigate("UserProfile", postUser)
            }
        }
    }

    if (!postUser || !post) {
        return (
            <View style={styles.loadBox}>
                <Spinner />
            </View>
        )
    }

    return (
        <View style={styles.post}>
            <Modal
                animationType="slide"
                visible={commentVisible}
            >
                <H2 style={styles.modalHeading}>Comments</H2>
                <View>
                    {
                        !commentLoading ?
                            <View style={styles.modalInputBox}>
                                <TextInput
                                    placeholder="Enter..."
                                    style={styles.modalInput}
                                    multiline={true}
                                    onChangeText={txt => setCommentValue(txt)}
                                    value={commentValue}
                                />
                                <Button style={styles.modalInputBtn} onPress={comment}>
                                    <Ionicons name="send" size={25} color="white" />
                                </Button>
                            </View>
                            :
                            <Spinner />
                    }
                </View>
                <ScrollView>
                    {
                        comments.map(comment => (
                            <Comment
                                key={comment.id}
                                user={user}
                                data={comment}
                                closeModal={setCommentVisible}
                            />
                        ))
                    }
                </ScrollView>
                <Button onPress={() => setCommentVisible(false)} transparent style={styles.modalCloseBtn}>
                    <FontAwesome name="times" size={30} />
                </Button>
            </Modal>

            <Card style={{ margin: 0 }}>
                <CardItem style={styles.cardItem}>
                    <Left>
                        <TouchableOpacity onPress={switchScreen}>
                            <Thumbnail source={{ uri: postUser.photo }} />
                        </TouchableOpacity>
                        <Body>
                            <Text>{postUser.name}</Text>
                            <Text note style={styles.timeBox}>{post.timestamp.toDate().toString().substr(0, 21)}</Text>
                        </Body>
                    </Left>
                    {
                        user.uid == postUser.uid &&
                        <Right>
                            <TouchableOpacity onPress={askForDeletePost} transparent>
                                <MaterialIcons name="delete" size={30} />
                            </TouchableOpacity>
                        </Right>
                    }
                </CardItem>
                {
                    post.images !== null &&
                    <CardItem cardBody>
                        <SliderBox
                            images={post.images}
                            sliderBoxWidth={200}
                            sliderBoxHeight={500}
                            ImageComponentStyle={styles.postImg}
                        />
                    </CardItem>
                }
                {
                    post.desc !== "" &&
                    <CardItem>
                        <Text>{post.desc}</Text>
                    </CardItem>
                }
                <CardItem>
                    <Left>
                        {
                            liked ?
                                <Button transparent onPress={unlike}>
                                    <MaterialIcons name="favorite" size={30} color="red" />
                                    <Text style={{ color: "red" }}>{ post.likes.length} likes</Text>
                                </Button>
                                :
                                <Button transparent onPress={like}>
                                    <MaterialIcons name="favorite-border" size={30} color="red" />
                                    <Text style={{ color: "red" }}>{post.likes.length} likes</Text>
                                </Button>
                        }
                        <Button transparent onPress={() => setCommentVisible(true)}>
                            <FontAwesome name="comments" size={30} color="#0062ff" />
                            <Text style={{ color: "#0062ff" }}>{post.comments.length} comments</Text>
                        </Button>
                    </Left>
                </CardItem>
            </Card>
        </View>
    )
}

export default Post

const styles = StyleSheet.create({
    timeBox: {
        fontSize: 12,
        width: 200,
    },
    loadBox: {
        backgroundColor: "white",
        width: Dimensions.get("window").width,
        margin: 0,
        borderRadius: 2,
        height: 200,
        display: 'flex',
        alignItems: "center",
        justifyContent: "center"
    },
    post: {
        marginVertical: 10,
        margin: 0,
        padding: 0
    },
    postImg: {
        width: Dimensions.get("window").width - 15,
        height: 500,
        flex: 1,
        alignItems: "center",
        borderRadius: 15,
        backgroundColor: "white"
    },
    modalHeading: {
        padding: 12,
        fontFamily: "Oswald",
        borderBottomColor: "black",
        borderBottomWidth: 3
    },
    modalCloseBtn: {
        position: "absolute",
        top: 0,
        right: 0,
        padding: 10
    },
    modalInputBox: {
        display: "flex",
        flexDirection: "row",
        margin: 10
    },
    modalInput: {
        borderWidth: StyleSheet.hairlineWidth,
        width: Dimensions.get("window").width - 65,
        paddingHorizontal: 10
    },
    modalInputBtn: {
        backgroundColor: "blue",
        padding: 10
    },
    comment: {
        display: "flex",
        borderColor: "#13121280",
        borderBottomWidth: 1.5,
        padding: 5,
        // borderRadius: 7,
        margin: 10,
        backgroundColor: "#f3f3f3"
    },
    commentView: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        margin: 5
        // justifyContent: "center"
    },
    commentName: {
        fontSize: 12,
        padding: 7,
    },
    commentPhoto: {
        width: 50,
        height: 50,
        borderRadius: 70 / 2
    },
    commentValue: {
        fontFamily: "Raleway",
        paddingHorizontal: 7
    },
    cardItem: {
        borderRadius: 10
    }
})
