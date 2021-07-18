import "reflect-metadata";
import { Service, Inject } from "typedi";
import { DatabaseService } from '../../common/services/database-service';
import * as HttpStatus from 'http-status-codes';
import appUtilities from "../utils/app-utils";
import { CustomErrorModel } from '../../common/models/custom-error-model';
import { CustomInject } from '../../common/injector/custom-injector';
import { UserResponseModel } from "../models/users-response-model";
import { ResponseModel } from "../../common/models/response-model";
const userModel = require('../models/mongoose/user');

@Service()
export class UserService {

    @Inject()
    private _databaseService: DatabaseService;

    @Inject()
    _appUtilities: appUtilities;

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
}
