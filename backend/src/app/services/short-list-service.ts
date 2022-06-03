import "reflect-metadata";
import { Service, Inject } from "typedi";
import { DatabaseService } from '../../common/services/database-service';
import appUtilities from "../utils/app-utils";
import { CustomErrorModel } from '../../common/models/custom-error-model';
import { CustomInject } from '../../common/injector/custom-injector';
import { PayableItemsService } from "./payable-items-service";
import { isTemplateMiddle } from "typescript";
import { userInfo } from "os";
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
                
                delete params.userName // why this delete is needed??
                if (allData) {
                    return {
                        result:this.sortObject(allData),
                        idPrefixes: this.sortObject(idPrefixes),
                        summaries: await this.getSummaries({
                            userName: query.userName,
                            discount: query.discount
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

    public async getItemsID(query: any): Promise<any> {

        try {
            if(query.userName){
                const params: any = {
                    userName: query.userName,
                }
                // if(query.additional){
                //     params["itemId"] = { "$regex": "^"+query.additional , "$options": "i"}; // "^" is a regular expression that tells the db to fetch only data that starts with the givien letters only
                // }
                if(query.topic){
                    params["topic"] = { "$regex": query.topic , "$options": "i"}; // this will fetch all the results that matches with a string at any place in the string
                }
                if(query.itemId){
                    params["itemId"] = { "$regex": "^"+query.itemId , "$options": "i"}; // "^" is a regular expression that tells the db to fetch only data that starts with the givien letters only
                }
                let allData = await shortListModel.find(params).sort({"itemId": 1})
                
                if (allData) {
                    return {
                        result:allData,
                    }
                };
            }
            else {
                return undefined;
            }
        }
        
        catch (err) {
        }
    }



    public async getSummaries(query: any, excel?: boolean) {
        try {
            const data = await this._databaseService.getManyItems(shortListModel , {userName: query.userName});
            //console.log(data.length);
            //Get ID's summary
            const priceIds = [...new Set(data.map((item: any) => item.itemId.slice(0, 2)))];
            let response: any = {};
            if(data && priceIds) {
                response.summaryIDs = await Promise.all(priceIds.map( async (priceId: any) =>{  //Promise.all will execute next line after all resolved
                    let priceItem = await this._databaseService.getSingleItem(payableItemsModel, {itemId : priceId}); // CHeck if possible to replace with area-keys.ts file
                    let sum = 0;
                    let sumPaid = 0;
                    let sumPlanned = 0;
                    data.forEach((el: any)=> {
                        if(el && el.itemId.slice(0,2) === priceId) {
                            sum+=(el.price * el.amount * query.discount) || 0;
                            sumPaid+=(el.price * el.paid * query.discount) || 0;
                            sumPlanned+=(el.price * el.planned * query.discount) || 0;
                        }
                    });
                    if(excel) {
                         return `${priceId} - ${sum} - ${priceItem?.description.trim()}`
                     } else {
                        return {
                            itemId:priceId,
                            description:priceItem?.description,
                            total: sum,
                            paid: sumPaid,
                            planned: sumPlanned,
                        }   
                    }
                }));
                //response.summaryIDs.sort({ itemId: 'asc' });
                let total = 0;
                let totalPaid = 0;
                let totalPlanned = 0;
                data.forEach((num: any) => {
                    total+=(num.price * num.amount * query.discount) || 0;
                    totalPaid+=(num.price * num.paid * query.discount) || 0;
                    totalPlanned+=(num.price * num.planned * query.discount) || 0;
                })
                response.grandTotalIDs = total;
                response.grandTotalPaid = totalPaid;
                response.grandTotalPlanned = totalPlanned;
                //response.countIDs = data.length;
            }

            //Get Topics Summary
            const topics = [... new Set(data.map((item:any) => item.topic))];
            if(data && topics) {
                response.summaryTopics = topics.map( (topic: any) =>{
                    let sum = 0;
                    let count = 0;
                    let sumPaid = 0;
                    data.forEach((el: any)=> {
                        if(el && el.topic === topic) {
                            sum+=(el.price * el.amount * query.discount) || 0;
                            sumPaid+=(el.price * el.paid * query.discount) || 0;
                            count+=1;
                        }
                    });
                    if(excel) {
                        return `${topic} - ${sum}`
                    } else {
                        return {
                            topic:topic,
                            total: sum,
                            count: count,
                            paid: sumPaid,
                        }   
                    }
                });
                let total = 0;
                data.forEach((num: any) => {
                    total+=(num.price * num.amount * query.discount) || 0;
                })
                response.grandTotalTopics = total;
                //return response;
            }
            return response;
        } catch (error) {
            console.log(error)
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
            //await this.deleteShortListItems(body);
            const data = this.payableItemsService.transformData(sheet_name_list , workbook);
            if(data) {
                const filteredData = [].concat.apply([], data).filter((element: any) => element!== null);
                if(filteredData && filteredData.length) {
                    let countImported = 0;
                    await Promise.all( filteredData.map(async (item: any) => {
                        const shortListResponse = await this._databaseService.getSingleItem(shortListModel, {itemId:item.ID , userName:body.userName});
                        if(shortListResponse){  // Update item in Short_list table
                            let payload: any = {};
                            item.Planned ? payload.planned = item.Planned : '';
                            payload.paid = item.Paid; // force the update of this field
                            item.Amount ? payload.amount = item.Amount : '';
                            item.Topic ? payload.topic = item.Topic : '';
                            item.Remarks ? payload.remarks = item.Remarks : '';
                            countImported++;
                            await this._databaseService.updateItem(shortListModel ,{itemId: item.ID, userName: body.userName}, payload);
                        } else {    // insert new item to Short_list table
                            const response = await this._databaseService.getSingleItem(payableItemsModel, {itemId: item.ID});
                            if(response){
                                delete response.createdAt;
                                delete response._id;
                                item.Planned ? response.planned    = item.Planned : '';
                                item.Paid ? response.paid       = item.Paid : '';                            
                                item.Amount ? response.amount     = item.Amount : '';
                                item.Topic ? response.topic      = item.Topic : '';
                                item.Remarks ? response.remarks    = item.Remarks : ''; // item MUST be the same name as in the Excel e.g "Remarks"
                                response.userName   = body.userName;
                                countImported++;
                                await this._databaseService.addItem(shortListModel , response);
                            } else {    // this section adds the "99.xx.xxxx" items to the short_list
                                let response : any = {};
                                response.itemId     = item.ID;
                                response.planned    = item.Planned ? item.Planned : '';
                                response.paid       = item.Paid ? item.Paid : '';                            
                                response.amount     = item.Amount ? item.Amount : '';
                                response.topic      = item.Topic ? item.Topic : '';
                                response.remarks    = item.Remarks ? item.Remarks : ''; // item MUST be the same name as in the Excel e.g "Remarks"
                                response.userName   = body.userName;
                                countImported++;
                                await this._databaseService.addItem(shortListModel , response);
                            }

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
            if(body && body.additional) { // this is called from short_List_Items while adding "Additional" single item.
                await this._databaseService.addItem(shortListModel , body);
                return {
                    hasErrors: false,
                    message:"Additional Item 99 successfully added!"
                }                
            }
            if(body && body.itemIds && !(body.additional)) { // "itemIds" - this is called from payable_Items while adding multiple items using "+" bottom.
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
            //return await shortListModel.remove({});
            return ('Error while delete - no userName');
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
            //return await shortListModel.remove({});
            return ('Error while copting - no body.users');
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