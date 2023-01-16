const { DateTime } = require('luxon')
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const PostSchema = new Schema({
    body: { type: String, required: true, minLength: 1 },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    likes: { type: Number },
    timestamp: { type: String, required: true },
    db_timestamp: { type: Date, required: true }
    //image: {type: }
})

PostSchema.virtual("formatted_timestamp").get(function () {
    return DateTime.formJSDate(this.timestamp).toFormat("MMMM d yyyy", " h:mm a")
})

module.exports = mongoose.model("Post", PostSchema)