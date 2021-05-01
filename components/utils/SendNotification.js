import firebase from "../../firebase"

const createID = () => {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

export const sendPushNotification = async (expoPushToken, title, body, data) => {
    if (expoPushToken) {
        const message = {
            to: expoPushToken,
            sound: "default",
            title: title,
            body: body,
            data: {},
        };

        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });
    }
}

export const saveNotification = ({ to, from, title, message, photo, docID }) => {
    const id = createID()
    firebase.firestore().collection("notifications").doc(id).set({
        id: id,
        to: to,
        from: from,
        title: title,
        message: message,
        photo: photo,
        seen: false,
        docID: docID,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
}

export const setNotificationToSeen = (id) => {
    firebase.firestore().collection("notifications").doc(id).update({
        seen: true
    })
}

export const deleteNotification = (id, callback) => {
    firebase.firestore().collection("notifications").doc(id).delete()
    .then(() => callback())
}
