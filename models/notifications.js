const mongoose = require('mongoose')

const Schema = mongoose.Schema

const NotificationSchema = new Schema({
    likes: { type: Schema.Types.ObjectId, ref: "User", required: true },
    received_friend_requests: {},
    accepted_friend_requests: {},
    comments: {}
})

module.exports = mongoose.model("Notification", NotificationSchema)