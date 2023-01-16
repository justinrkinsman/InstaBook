const { DateTime } = require('luxon')
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const CommentSchema = new Schema({
    body: { type: String, required: true, minLength: 1 },
    timestamp: { type: String, required: true },
    db_timestamp: { type: Date, required: true},
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    likes: { type: Number }
})

CommentSchema.virtual("formatted_timestamp").get(function () {
    return DateTime.fromJSDate(this.timestamp).toFormat("MMMM d yyyy", " h:mm a")
})

module.exports = mongoose.model("Comment", CommentSchema)