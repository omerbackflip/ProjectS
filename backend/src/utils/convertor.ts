import convert from 'xml-js';
var nestedProperty = require("nested-property");
import { Service } from "typedi";

@Service()
export class Convertor {
    getXmlToJson = (xml: string) => {
        var options = { compact: true, ignoreComment: true, spaces: 4 };
        return JSON.parse(convert.xml2json(xml, options));
    }
    getXmlToJsonWithKeyNameUpdate = (xml: string) => {
        var options = {
            compact: true, ignoreComment: true, spaces: 4, elementNameFn: function (val: any) {
                return val.replace(/\./g, "_");
            }
        };
        return JSON.parse(convert.xml2json(xml, options));
    }

    getJsonToXml = (json: string) => {
        var options = { compact: true, ignoreComment: true, spaces: 4 };
        return convert.json2xml(json, options);
    }

    hasPropery = (object: any, property: string) => {
        return nestedProperty.has(object, property);
    }

    getJsonByProperty = (object: any, property: string) => {
        return nestedProperty.get(object, property);
    }

    setJsonByProperty = (object: any, property: string, value: any) => {
        return nestedProperty.set(object, property, value);
    }
}