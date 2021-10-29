import "reflect-metadata";
import { Service, Inject } from "typedi";
import { DatabaseService } from '../../common/services/database-service';
import appUtilities from "../utils/app-utils";
import { CustomErrorModel } from '../../common/models/custom-error-model';
import { CustomInject } from '../../common/injector/custom-injector';

const payableItemsModel = require('../models/mongoose/payable-items');
const shortListModel = require('../models/mongoose/short-list');
const areaModel = require('../models/mongoose/area-keys');

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

            let allData = await payableItemsModel.find(params).sort({"itemId":1})
            allData = await Promise.all(allData.map(async (data:any) => {
                if(await shortListModel.exists({
                    itemId: data.itemId,
                    userName: query.userName
                })) {
                    const item = await shortListModel.findOne({
                        itemId: data.itemId,
                        userName: query.userName
                    });

                    let tempData = data.toObject();
                    tempData.added = true;
                    tempData.amount = item.amount;
                    return tempData;
                } else {
                    return data;
                }
            }));
            const idPrefixes = await this._databaseService.getManyItems(areaModel,{});
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

    public async getIdPrefixes(model: any, userName? : any) {
        try {
            let data: any;
            if(userName){
               data = await model.find({
                   userName
               })
            } else {
                data = await model.find();                
            }
            if(data) {
                const unique = [ ... new Set(data.map((item: any) => {
                    return item.itemId.slice(0,2)
                }))];                
                return await Promise.all(unique.map(async (id: any) => {
                    return {
                        itemId: id,
                        description: (await this.getItemById({id}))?.description ,
                        subItems: userName ?
                            await this.getSubItems(id,data)  
                            : data.filter((el: any) => el.itemId?.slice(0,2) === id && el.itemId.length !== 2 && el.itemId.length !== 10 ),
                    }
                }));
            }
        } catch (error) {
            console.log(error);
            return {hasErrors: false, error};
        }
    }

    public async getSubItems(id: any, data: any) {
        const subArea = [...new Set(data.map((item: any) => {
            if(item.itemId?.slice(0,2) === id) {
                return item.itemId?.slice(0,5);
            }
        }))];
        return await Promise.all(subArea.map( async (id: number) => {
            if(id) {
                return await payableItemsModel.findOne({itemId: id});
            }
        }));
    }


    public async savePayableItems(workbook: any) {
        try {
            var sheet_name_list = workbook.SheetNames;
            const data = this.transformData(sheet_name_list , workbook);
            if(data) {
                const filteredData = [].concat.apply([], data).filter((element: any) => element!== null);
                if(filteredData && filteredData.length) {
                    await this.deletePayableItems();
                    await this._databaseService.addManyItems(payableItemsModel , this.getPayableItems(filteredData));
                    const idPrefixes: any = await this.getIdPrefixes(payableItemsModel);
                    await this._databaseService.addManyItems(areaModel , idPrefixes);
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

    public async deletePayableItems() {
        await shortListModel.remove({});
        await areaModel.remove({});
        return await payableItemsModel.remove({});
    }
    
}
