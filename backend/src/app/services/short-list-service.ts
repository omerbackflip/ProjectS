import "reflect-metadata";
import { Service, Inject } from "typedi";
import { DatabaseService } from '../../common/services/database-service';
import appUtilities from "../utils/app-utils";
import { CustomErrorModel } from '../../common/models/custom-error-model';
import { CustomInject } from '../../common/injector/custom-injector';
import { PayableItemsService } from "./payable-items-service";
import { isTemplateMiddle } from "typescript";
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
                if(query.keyword){
                    params["description"] = { "$regex": query.keyword , "$options": "i"};
                }

                let allData = await shortListModel.find(params).sort({"createdAt": -1})
                
                const idPrefixes = await this.payableItemsService.getIdPrefixes(shortListModel,query.userName);
                
                allData = allData.map((data:any) => {
                    if(data.attachedFile) {
                        const directory = ((__dirname.split('/')).slice(0,7)).join('/'); 
                        const url = `${directory}/${data.attachedFile.path}`;    
                        let tempData = data.toObject();
                        tempData.attachedFile.urlImage = url;
                        return tempData;
                    }
                    return data;
                })
                
                delete params.userName
                if (allData) {
                    return {
                        result:this.sortObject(allData),
                        idPrefixes: this.sortObject(idPrefixes),
                        summaries: await this.getSummaries({
                            userName: query.userName
                        })
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

    public async getSummaries(query: any, excel?: boolean) {
        try {
            const data = await this._databaseService.getManyItems(shortListModel , query);
            const priceIds = [... new Set(data.map((item:any) => item.itemId.slice(0,2)))];
            if(data && priceIds) {
                let response: any = {};
                response.summary = await Promise.all(priceIds.map( async (priceId: any) =>{
                    let priceItem = await this._databaseService.getSingleItem(payableItemsModel, {itemId : priceId});
                    let sum = 0;
                    data.forEach((el: any)=> {
                        if(el && el.itemId.slice(0,2) === priceId) {
                            sum+=(el.price * el.amount) || 0;
                        }
                    });
                    if(!excel) {
                        return {
                            itemId:priceId,
                            description:priceItem.description,
                            total: sum,
                        }    
                    } else {
                        return `${priceId} - ${sum.toFixed(0)} - ${priceItem.description.trim()}`
                    }
                }));
                let total = 0;
                data.forEach((num: any) => {
                    total+=(num.price * num.amount) || 0;
                })
                response.grandTotal = total;
                return response;
          }
        } catch (error) {
            return {
                success:false,
                error,
            }
        }
    }
    
    //This function is used to import excel file for short listed items
    public async saveShortListedItems(body: any, workbook: any) {
        try {
            var sheet_name_list = workbook.SheetNames;
            await this.deleteShortListItems(body);
            const data = this.payableItemsService.transformData(sheet_name_list , workbook);
            if(data) {
                const filteredData = [].concat.apply([], data).filter((element: any) => element!== null);
                if(filteredData && filteredData.length) {
                    let countImported = 0;
                    await Promise.all( filteredData.map(async (item: any) => {
                        const response = await this._databaseService.getSingleItem(payableItemsModel, {itemId: item.ID});
                        if(response){
                            delete response.createdAt;
                            delete response._id;
                            response.amount = item.Amount;
                            response.planned = item.Planned;
                            response.paid = item.Paid;                            
                            response.remarks = item.Remarks; // item MUST be the same name as in the Excel e.g "Remarks"
                            response.userName = body.userName;
                            countImported++;
                            await this._databaseService.addItem(shortListModel , response);
                        } else {
                            console.log('Can not find ID - ' + item.ID)
                        }
                    }));
                    if(countImported > 0 && countImported <= filteredData.length) {
                        return {
                            hasErrors: false,
                            message: `${countImported} out of ${filteredData.length} items are being imported successfully!`
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

            if("topic" in body) {
                payload.topic = body.topic;
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

    public async removeFile(params: any) {
        try {
            const response = await shortListModel.update({
                    itemId: params.id,
                    userName: params.userName
                },{$unset: {attachedFile: 1 } }
            );

            if(response) {
                return {
                    hasErrors: false,
                    message:"File successfully deleted!"
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

    public async deleteShortListItems(body?: any) {
        if(body && body.userName) {
            return await shortListModel.remove({userName: body.userName});
        } else {
            return await shortListModel.remove({});
        }
    }

    public async copyShortListItems(body?: any) {
        if(body && body.users) {
            await Promise.all(body.users.map(async (user: any) => {
                let items = await shortListModel.find({
                    userName: body.userName
                });
                items = items.map((item: any) => {
                    let tempData = item.toObject();
                    tempData.userName = user;
                    delete tempData._id;
                    return tempData;
                });
                if(items && items.length) {
                    await this._databaseService.addManyItems(
                        shortListModel,
                        items
                    )
                }
            }));
            return {
                success: true
            }
        } else {
            return await shortListModel.remove({});
        }
    }

    public sortObject(obj: any) {
       return obj.sort((a: any,b: any) => (a.itemId > b.itemId) ? 1 : ((b.itemId > a.itemId) ? -1 : 0))
    }

    public numberWithCommas(x : any) {
        if(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else {
            return '';
        }
    }

}
