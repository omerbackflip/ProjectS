import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const shortListModel = new Schema({
    userName: {type: String},
    itemId: {type: String, unique: true , required : true, dropDups: true},
    price: {type: Number},
    description: {type: String},
    unit: {type: String},
    amount: {type: Number },
    remarks: {type: String , default: '' },
    paid: {type: Number , default: 0},
    planned: {type: Number , default: 0},
    createdAt: {type: Date, default:Date.now()},
    attachedFile: {},
});
let ShortList: any;
module.exports = ShortList = mongoose.model('ShortList', shortListModel);
