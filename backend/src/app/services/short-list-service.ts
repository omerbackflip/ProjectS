import "reflect-metadata";
import { Service, Inject } from "typedi";
import { DatabaseService } from '../../common/services/database-service';
import * as HttpStatus from 'http-status-codes';
import appUtilities from "../utils/app-utils";
import { CustomErrorModel } from '../../common/models/custom-error-model';
import { CustomInject } from '../../common/injector/custom-injector';
import { ResponseModel } from "../../common/models/response-model";
import { PayableItemsService } from "./payable-items-service";
const shortListModel = require('../models/mongoose/short-list');
const payableItemsModel = require('../models/mongoose/payable-items');

@Service()
export class ShortListService {

    @Inject()
    private _databaseService: DatabaseService;

    @Inject()
    private payableItemsService: PayableItemsService;

    @Inject()
    _appUtilities: appUtilities;

    @CustomInject(CustomErrorModel)
    private _customError: CustomErrorModel;

    public async getData(query: any): Promise<any> {

        try {
            if(query.userName){
                const params: any = {
                    userName: query.userName,
                }
                if(query.itemId) {
                    params["itemId"] = { "$regex": "^" + query.itemId};
                }
                if(query.keyword){
                    params["description"] = { "$regex": query.keyword , "$options": "i"};
                }

                const allData = await shortListModel.find(params).sort({"createdAt": -1})
                
                const idPrefixes = await this.payableItemsService.getIdPrefixes(shortListModel);

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
        }
        catch (err) {
        }
    }

    public async getSummaries(query: any) {
        try {
            const data = await this._databaseService.getManyItems(shortListModel , query);
            const priceIds = [... new Set(data.map((item:any) => item.itemId.slice(0,2)))];
            if(data && priceIds) {
                return await Promise.all(priceIds.map( async (priceId: any) =>{
                    let priceItem = await this._databaseService.getSingleItem(payableItemsModel, {itemId : priceId});
                    let sum = 0;
                    data.forEach((el: any)=> {
                        if(el && el.itemId.slice(0,2) === priceId) {
                            sum+=(el.price * el.amount) || 0;
                        }
                    });
                    return {
                        itemId:priceId,
                        description:priceItem.description,
                        total: sum,
                    }
                }))
            }
        } catch (error) {
            return {
                success:false,
                error,
            }
        }
    }
    

    public async saveShortListedItems(body: any, workbook: any) {
        try {
            var sheet_name_list = workbook.SheetNames;
            const data = this.payableItemsService.transformData(sheet_name_list , workbook);
            if(data) {
                const filteredData = [].concat.apply([], data).filter((element: any) => element!== null);
                if(filteredData && filteredData.length) {
                    let countImported = 0;
                    await Promise.all( filteredData.map(async (item: any) => {
                        const response = await this._databaseService.getSingleItem(payableItemsModel , 
                        {
                            itemId: item.ID                            
                        });
                        if(response){
                            delete response.createdAt;
                            delete response._id;
                            response.amount = item.Amount;
                            response.userName = body.userName;
                            countImported++;
                            await this._databaseService.addItem(shortListModel , response);
                        }
                    }));
                    if(countImported > 0 && countImported <= filteredData.length) {
                        return {
                            hasErrors: false,
                            message: "Data successfully Imported"
                        }            
                    } else {
                        return {
                            hasErrors: true,
                            message: "Couldn't import some or all data!"
                        }            
                    }
                }

            }
        } catch (error) {
            console.log(error);
            return {success: false, error};
        }
    }

    public async addItem(body: any) {
        try {
            if(body && body.itemIds) {
                await Promise.all(
                    body.itemIds.map(async (id: any) => {
                        const response = await this._databaseService.getSingleItem(payableItemsModel ,{
                            itemId: id
                        });
                        
                        if(response && !(await this._databaseService.isExists(shortListModel , {itemId : id , userName: body.userName}))) {
                            delete response.createdAt;
                            delete response._id;
                            response.userName = body.userName;
                           await this._databaseService.addItem(shortListModel , response);
                        }                        
                    })
                );
                return {
                    hasErrors: false,
                    message:"Items successfully added!"
                }                
            }
        } catch (error) {
            return {
                success:false,
                error,
            }
        }
    }

    public async updateItem(body: any) {
        try {
            const payload: any = {};

            if("remarks" in body) {
                payload.remarks = body.remarks;
            }

            //This is the function for adding remarks or amount to the item

            if("amount" in body) {
                payload.amount = body.amount;
            }

            const response = await this._databaseService.updateItem(shortListModel ,{
                itemId: body.itemId,
                userName: body.userName
            },
                payload
            );
            
            if(response) {
                return {
                    hasErrors: false,
                    message:"Item successfully updated!"
                }     
            }   
       
        } catch (error) {
            return {
                success:false,
                error,
            }
        }
    }

    public async deleteItem(params: any) {
        try {
            const response = await shortListModel.findOneAndRemove({
                itemId: params.id,
                userName: params.userName
            });
            if(response) {
                return {
                    hasErrors: false,
                    message:"Item successfully deleted!"
                }     
            }   
       
        } catch (error) {
            return {
                hasErrors: true,
                error,
            }
        }
    }

    public async addFile(body: any, file: any) {
        try {
            const payload: any = {};

            if(file) {
                payload.attachedFile = file;
            }

            const response = await this._databaseService.updateItem(shortListModel ,{
                itemId: body.itemId,
                userName: body.userName,
            },
                payload
            );
            
            if(response) {
                return {
                    hasErrors: false,
                    message:"Item successfully updated!"
                }     
            }   
       
        } catch (error) {
            return {
                success:false,
                error,
            }
        }
    }

}
