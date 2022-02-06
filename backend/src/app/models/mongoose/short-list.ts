import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const shortListModel = new Schema({
    userName: {type: String},
    itemId: {type: String, unique: true , required : true, dropDups: true},
    price: {type: Number},          // duplicated - for faster access time
    description: {type: String},    // duplicated - for faster access time
    unit: {type: String},           // duplicated - for faster access time
    amount: {type: Number },
    remarks: {type: String , default: '' },
    paid: {type: Number , default: 0},
    planned: {type: Number , default: 0},
    createdAt: {type: Date, default:Date.now()},
    attachedFile: {},
    topic: {type: String},
});
let ShortList: any;
module.exports = ShortList = mongoose.model('ShortList', shortListModel);
