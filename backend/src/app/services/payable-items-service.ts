import "reflect-metadata";
import { Service, Inject } from "typedi";
import { DatabaseService } from '../../common/services/database-service';
import * as HttpStatus from 'http-status-codes';
import appUtilities from "../utils/app-utils";
import { CustomErrorModel } from '../../common/models/custom-error-model';
import { CustomInject } from '../../common/injector/custom-injector';
import { PayableItemsResponseModel } from "../models/payable-items-response-model";
import { ResponseModel } from "../../common/models/response-model";

const appConstants = require('../constants/constant');
const appResponses = require('../../common/constants/app-responses');
const payableItemsModel = require('../models/mongoose/payable-items');
const shortListModel = require('../models/mongoose/short-list');

@Service()
export class PayableItemsService {

    @Inject()
    private _databaseService: DatabaseService;

    @Inject()
    _appUtilities: appUtilities;

    @CustomInject(CustomErrorModel)
    private _customError: CustomErrorModel;

    public async getData(query: any): Promise<any> {

        try {
            let params: any = {};

            if(query.itemId){
                params['itemId'] = { "$regex": "^" + query.itemId};
            }

            if(query.keyword){
                params["description"] = { "$regex": query.keyword , "$options": "i"};
            }

            const allData = await payableItemsModel.find(params).sort({"itemId":1})

            const idPrefixes = await this.getIdPrefixes(payableItemsModel);

            if (allData) {
                return {
                    result:allData,
                    idPrefixes
                };
            }
            else {
                return undefined;
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    public async getIdPrefixes(model: any) {
        try {
            let data = await model.find();
            if(data) {
                const unique = [ ... new Set(data.map((item: any) => {
                    return item.itemId.slice(0,2)
                }))];                
                return await Promise.all(unique.map(async (id: any) => {
                    return {
                        itemId: id,
                        description: data.filter((el: any) => el.itemId === id)[0]?.description 
                        ||
                        (await this.getItemById({id}))?.description
                        ,
                    }
                }));
            }
        } catch (error) {
            console.log(error);
            return {hasErrors: false, error};
        }
    }


    public async savePayableItems(workbook: any) {
        try {
            var sheet_name_list = workbook.SheetNames;
            const data = this.transformData(sheet_name_list , workbook);
            if(data) {
                const filteredData = [].concat.apply([], data).filter((element: any) => element!== null);
                if(filteredData && filteredData.length) {
                    await this._databaseService.addManyItems(payableItemsModel , this.getPayableItems(filteredData));
                    return {
                        hasErrors: false,
                        message: "Data successfully Imported"
                    }
                }
            }
        } catch (error) {
            console.log(error);
            return {hasErrors: false, error};
        }
    }

    public getPayableItems(filteredData: any) {
        return filteredData.map((item: any , i: number)=>{
            let data: any = {
                itemId: item.ID,
                description: item.Description,
            };
            if(item.ID &&item.ID.length === 10) {
                data = {...data,
                    unit: item.Unit,
                    price: item.Price || 0,
                    amount: item.Amount || 0
                }
            }
            return data;
        });
    }

    public async getItemById(params: any) {
        try {
            const response = await this._databaseService.getSingleItem(payableItemsModel ,{
                itemId: params.id
            });
            if(response) {
                return response;
            }            
        } catch (error) {
            return {
                success:false,
                error,
            }
        }
    }

    public transformData(sheet_name_list: any, workbook: any) {
        try {
            return sheet_name_list.map((y: any)=> {
                var worksheet = workbook.Sheets[y];
                var headers: any = {};
                var data: any = [];
    
                Object.keys(worksheet).forEach((z: any)=> {
                    var tt = 0;
                    for (var i = 0; i < z.length; i++) {
                        if (!isNaN(z[i])) {
                            tt = i;
                            break;
                        }
                    };
                    var col = z.substring(0,tt);
                    var row = parseInt(z.substring(tt));
                    var value = worksheet[z].v;
            
                    if(row == 1 && value) {
                        headers[col] = value;
                    }
            
                    if(!data[row]) data[row]={};
                    data[row][headers[col]] = value;
                })
                data.shift();
                data.shift();
                return data
            });                  
        } catch (error) {
            return false;
        }
    }

    public async updateData(query: any, payload: any) {
        return await this._databaseService.updateItem(payableItemsModel, query, payload);
    }

    public async getCount() {
        return await this._databaseService.getDocumentCount(payableItemsModel,{});
    }
    
}
