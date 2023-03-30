const mongoose = require('mongoose')

const Schema = mongoose.Schema

const UserSchema = new Schema({
    username: { type: String, required: true, minLength: 1 },
    first_name: { type: String, required: true, minLength: 1 },
    last_name: { type: String, required: true, minLength: 1 },
    password: { type: String, required: true, minLength: 8 },
    friends_list: { 
        current_friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        sent_requests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        received_requests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    favorites: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    notifications: [{ type: Schema.Types.ObjectId, ref: 'User'}]
    //profile_pic: {type: }
    //feed: [{type: }]
})

module.exports = mongoose.model("User", UserSchema)