const { DateTime } = require('luxon')
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const MessageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    body: { type: String, required: true},
    //convo: { type: Schema.Types.ObjectId, ref: 'Conversation' },
    timestamp: { type: String, required: true },
    db_timestamp: { type: Date, required: true },
});

const ConversationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    messages: [MessageSchema],
    //image: { type: Schema.Types.ObjectId, ref: 'Image' }
})

ConversationSchema.virtual("formatted_timestamp").get(function () {
    return DateTime.formJSDate(this.timestamp).toFormat("MMMM d yyyy", " h:mm a")
})

const Conversation = mongoose.model('Conversation', ConversationSchema)
const Message = mongoose.model('Message', MessageSchema)

module.exports = {Conversation, Message}