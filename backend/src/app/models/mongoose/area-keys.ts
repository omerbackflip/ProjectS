import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const areaModel = new Schema({
    itemId: {type: String, unique: true,},
    description: {type: String},
    subItems:[{
        itemId: '',
        description:'',
    }]
});
let AreaKeys: any;
module.exports = AreaKeys = mongoose.model('AreaKeys', areaModel);
