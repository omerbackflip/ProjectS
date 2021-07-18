import { Service } from 'typedi';
import { Convertor } from './convertor';
const appConstants = require('../common/constants/application-constants');

const maskDeep = require('mask-deep');

@Service()
export default class Utilities {

    constructor(private convertor: Convertor) { }

    public findValueOfProperty(obj: any, propertyName: any) {
        let reg = new RegExp(propertyName, "i"); // "i" to make it case insensitive
        return Object.keys(obj).reduce((result, key) => {
            if (reg.test(key)) result.push(obj[key]);
            return result;
        }, [])[0];
    }

    //Check if the string is json / It can be parsed or not.
    public IsJsonString(str: any) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

}
