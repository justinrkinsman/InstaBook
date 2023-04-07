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
    notifications: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    convos: [{ type: Schema.Types.ObjectId, ref: 'Conversation' }]
    //profile_pic: {type: }
    //feed: [{type: }]
})

/* define the Message schema
const MessageSchema = new Schema({
  content: String,
  sender: { type: Schema.Types.ObjectId, ref: 'User' }
});

// define the Convos schema with the nested Message array
const ConvosSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  messages: [MessageSchema]
});

// modify your existing schema definition to include the new "convos" field
const YourSchema = new Schema({
  // your existing fields here
  convos: [ConvosSchema]
});
*/

module.exports = mongoose.model("User", UserSchema)