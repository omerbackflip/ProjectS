import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userModel = new Schema({
    firstName: { type: String },
    lastName: { type: String },
    userName: {type: String , unique: true},
    password: { type: String },
    discount: {type: Number},
    rootUser: { type: Boolean, default: false },
    createdAt: {type: Date, default:Date.now()}
});
let User: any;
module.exports = User = mongoose.model('User', userModel);
