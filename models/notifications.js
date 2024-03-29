const mongoose = require('mongoose')
const { DateTime } = require('luxon')

const Schema = mongoose.Schema

const NotificationSchema = new Schema({
    this_user: { type: Schema.Types.ObjectId, ref: 'User' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    accepted_friend_requests: { type: Boolean },
    received_friend_requests: { type: Boolean },
    likes: { type: Boolean },
    comments: { type: Boolean },
    messages: { type: Boolean },
    timestamp: { type: String, required: true },
    db_timestamp: { type: Date, required: true },
})

NotificationSchema.virtual("formatted_timestamp").get(function () {
    return DateTime.formJSDate(this.timestamp).toFormat("MMMM d yyyy", " h:mm a")
})

module.exports = mongoose.model("Notification", NotificationSchema)