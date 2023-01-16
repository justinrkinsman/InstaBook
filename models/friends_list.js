const mongoose = require('mongoose')

const Schema = mongoose.Schema

const FriendsSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    current_friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    sent_requests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    received_requests: [{ type: Schema.Types.ObjectId, ref: 'User' }]
})

module.exports = mongoose.model("Friends_List", FriendsSchema)