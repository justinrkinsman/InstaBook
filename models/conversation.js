const { DateTime } = require('luxon')
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const MessageSchema = new Schema({
    content: String,
    sender: { type: Schema.Types.ObjectId, ref: 'User' }
});

const ConversationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    messages: [MessageSchema],
    timestamp: { type: String, required: true },
    db_timestamp: { type: Date, required: true },
    //image: { type: Schema.Types.ObjectId, ref: 'Image' }
})

ConversationSchema.virtual("formatted_timestamp").get(function () {
    return DateTime.formJSDate(this.timestamp).toFormat("MMMM d yyyy", " h:mm a")
})

const Conversation = mongoose.model('Conversation', ConversationSchema)
const Message = mongoose.model('Message', MessageSchema)

module.exports = {Conversation, Message}

// to import const {Conversation, Message} = require('./conversation.js)