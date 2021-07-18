import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const payableItemsModel = new Schema({
    itemId: {type: String, unique: true, required : true, dropDups: true},
    price: {type: Number},
    description: {type: String},
    unit: {type: String},
    amount: {type: Number },
    remarks: {type: String },
    createdAt: {type: Date, default: Date.now()}
});
let PayableItems: any;
payableItemsModel.index({ itemId: 1, createdAt: 1 });
module.exports = PayableItems = mongoose.model('PayableItems', payableItemsModel);
