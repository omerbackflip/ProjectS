import "reflect-metadata";
import { Service, Inject } from "typedi";
import { DatabaseService } from '../../common/services/database-service';
import * as HttpStatus from 'http-status-codes';
import appUtilities from "../utils/app-utils";
import { CustomErrorModel } from '../../common/models/custom-error-model';
import { CustomInject } from '../../common/injector/custom-injector';
import { UserResponseModel } from "../models/users-response-model";
import { ResponseModel } from "../../common/models/response-model";
import { AuthService } from "./auth-service";
const shortListModel = require('../models/mongoose/short-list');
const userModel = require('../models/mongoose/user');

@Service()
export class UserService {

    @Inject()
    private _databaseService: DatabaseService;

    @Inject()
    _appUtilities: appUtilities;

    @Inject()
    authService: AuthService;

    @CustomInject(CustomErrorModel)
    private _customError: CustomErrorModel;

    public async getData(query: any): Promise<ResponseModel<UserResponseModel>> {

        try {
            const allData = await this._databaseService.getPagedItems
                (
                    userModel, {},{}
                );

            if (allData && allData.result.length > 0) {
                const dataResponse = new UserResponseModel();
                dataResponse.users = allData.result;
                const response = new ResponseModel<UserResponseModel>(dataResponse);
                response.pagingModel = allData.pagingModel;
                return response;
            }
            else {
                console.log('error occured');
            }
        }
        catch (err) {
        }
    }

    public async updateUser(payload: any): Promise<any> {

        try {
            if(payload && payload._id) {
                if(payload.password) {
                    const hash: any = await this.authService.hashPassword(10,payload.password);
                    payload.password = hash;
                }
                if(payload.userName !== payload.currentUsername) {

                    await shortListModel.updateMany(
                        {
                            userName: payload.currentUsername,
                        },
                        {
                            userName: payload.userName
                        },
                        {multi: true}
                    )
                }
                const response = await this._databaseService.updateItem(
                    userModel,
                    {_id:payload._id},
                    payload
                );
                if(response) {
                    return {
                        success: true,
                        message: "User successfully updated!",
                    }
                }
            }
        }
        catch (err) {
        }
    }

    public async deleteUser(query: any): Promise<any> {

        try {
            if(query && query.userId) {
                const response = await userModel.remove({
                    _id:query.userId
                });
                if(response) {
                    return {
                        success: true,
                        message: "User successfully deleted!",
                    }
                }
            }
        }
        catch (err) {
        }
    }

}
