const mongoose = require('mongoose')

const Schema = mongoose.Schema

const NotificationSchema = new Schema({
    user: { type: Schema.Types.ObjectedId, ref: "User"},
    likes: { type: Schema.Types.ObjectId, ref: "User" },
    accepted_friend_requests: {type: Schema.Types.ObjectId, ref: "User"},
    comments: {type: Schema.Types.ObjectId, ref: "User"}
})

module.exports = mongoose.model("Notification", NotificationSchema)