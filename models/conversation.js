const { DateTime } = require('luxon')
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ConversationSchema = new Schema({
    user_1: { type: Schema.Types.ObjectId, ref: "User", required: true },
    user_2: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message_body: { type: String, required: true, minLength: 1 },
    timestamp: { type: String, required: true },
    db_timestamp: { type: Date, required: true },
    //image: { type: Schema.Types.ObjectId, ref: 'Image' }
})

ConversationSchema.virtual("formatted_timestamp").get(function () {
    return DateTime.formJSDate(this.timestamp).toFormat("MMMM d yyyy", " h:mm a")
})

module.exports = mongoose.model("Conversation", ConversationSchema)