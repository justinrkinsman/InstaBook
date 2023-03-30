const mongoose = require('mongoose')
const { DateTime } = require('luxon')

const Schema = mongoose.Schema

const NotificationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    accepted_friend_requests: { type: Schema.Types.ObjectId, ref: 'User' },
    received_friend_requests: { type: Schema.Types.ObjectId, ref: 'User' },
    likes: { type: String },
    comments: { type: String },
    timestamp: { type: String, required: true },
    db_timestamp: { type: Date, required: true },
})

NotificationSchema.virtual("formatted_timestamp").get(function () {
    return DateTime.formJSDate(this.timestamp).toFormat("MMMM d yyyy", " h:mm a")
})

module.exports = mongoose.model("Notification", NotificationSchema)