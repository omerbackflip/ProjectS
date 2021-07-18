import { Service, Inject } from 'typedi';
const adminConstants = require('../constants/constant');
const { Parser } = require('json2csv');

@Service()
export default class AppUtilities {

    //Function to get Mongoose Model by Collection Name

    public getModelByCollectionName(collectionName: string) {
        switch (collectionName) {
            case 'todos': {
                return require('../../common/models/mongoose/todos');
            }
            default: {
                return '';
            }
        }

    }

    // Function to get fields for transforming before exporting to csv

    public getTransformationFields(fields: any[]) {
        return fields.filter(item => adminConstants.csvTransformationFields.includes(item.type));
    }


    //Custom Transformer to be applied for the given transformer types

    public customTransformer(data: any, fields: any[]) {

        fields.forEach(field => {

            if (data && data[field.value] && Date.parse(data[field.value]))
                data[field.value] = this.customDate(data[field.value]);

            if (data && data[field.value] && typeof data[field.value] === 'object') {
                data[field.value] = this.customJSON(data[field.value]);
            }

        })

        return data;
    }

    //Function to get easliy readable date

    public customDate(_date: any) {
        return _date
            ? `${new Date(_date).toLocaleDateString()}, ${new Date(
                _date,
            ).toLocaleTimeString()}`
            : '';
    }

    //Function to get easliy readable json

    public customJSON(json: any) {
        return json
            ? (Object.keys(json).map((key) => {
                return `${key} : ${json[key]}`
            })).toString()
            : '';
    }


    public async customJson2Csv(filteredJsonData: any, fields: any, transformationFields: any) {

        const json2csvParser = new Parser({
            fields,
            transforms: transformationFields ? [(item: any) => this.customTransformer(item, transformationFields)] : [],
        });

        return await json2csvParser.parse(filteredJsonData);
    }
    public getExtension(filename: any) {
        var i = filename.lastIndexOf('.');
        return (i < 0) ? '' : filename.substr(i);
    }
}
