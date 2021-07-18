import "reflect-metadata";
import { Service, Inject } from "typedi";
import * as HttpStatus from 'http-status-codes';
import { CustomErrorModel } from '../../common/models/custom-error-model';
import { CustomInject } from '../../common/injector/custom-injector';
import { GenericFilteringRequestModel } from '../models/generic-filtering-request-model';
import { DatabaseService } from "../../common/services/database-service";
import { ResponseModel } from "../../common/models/response-model";
import { Convertor } from "../../utils/convertor";
import appUtilities from "../utils/app-utils";
import { Helper } from "src/common/services/helper";

const appResponses = require('../../common/constants/app-responses');
const constants = require('../constants/constant');
const appConstants = require('../../common/constants/application-constants');
const mongoose = require('mongoose');
const configModel = require('../../common/models/mongoose/configuration');
const moment = require('moment')

@Service()
export class GenericService {

    @Inject()
    private _databaseService: DatabaseService;

    @Inject()
    private _appUtilities: appUtilities;

    @Inject()
    private helperObj: Helper;

    @Inject()
    private _convertor: Convertor;


    @CustomInject(CustomErrorModel)
    private _customError: CustomErrorModel;

    public async getFilteredItems(requestBody: GenericFilteringRequestModel): Promise<ResponseModel<any>> {

        try {

            const { collectionName, filterOptions, projectPayload } = requestBody;

            Object.keys(filterOptions).map((item: any) => {
                if (moment(filterOptions[item], "YYYY-MM-DD", true).isValid()) {
                    filterOptions[item] =
                    {
                        $gte: new Date(filterOptions[item]).setHours(0, 0, 0, 0),
                        $lte: new Date(filterOptions[item]).setHours(23, 59, 59, 999)
                    }
                }
                else if (Array.isArray(filterOptions[item]) && filterOptions[item].length == 0) {
                    delete filterOptions[item];
                }

            })

            const model: any = this._appUtilities.getModelByCollectionName(collectionName.toLowerCase());

            if (model) {
                const result = await this._databaseService.getPagedItems
                    (
                        model,
                        filterOptions,
                        projectPayload
                    );

                if (result) {
                    const customResponse = {
                        [collectionName]: result.result,
                        pagingModel: result.pagingModel
                    };
                    return new ResponseModel<any>(customResponse);
                }
                else {
                    throw this.helperObj.getCustomError
                        (
                            HttpStatus.NOT_FOUND,
                            "Not found",
                            true
                        );
                }
            }
            else {
                throw this.helperObj.getCustomError
                    (
                        HttpStatus.NOT_FOUND,
                        constants.errors.COLLECTION_NOT_FOUND,
                        true
                    );
            }
        }
        catch (err) {
            throw this.helperObj.getCustomError
                (
                    err.httpStatusCode ? err.httpStatusCode : HttpStatus.INTERNAL_SERVER_ERROR,
                    err.message ? err.message : appResponses.internalServerErrorMessage,
                    true,
                );
        }

    }

    public async getDisputeStatuses() {
        const disputedStatusKey = appConstants.configurationKeys.DISPUTED_STATUS;
        const result = await this._databaseService.getSingleItem(configModel, { name: disputedStatusKey }, { _id: 0, "description.status": 1 });
        return result;
    }

    public async getJsonByProperty(query: any) {

        try {
            const {
                collection,
                objectId,
                property
            } = query;

            // fetch Associated model
            const allModels: any = Object.entries(mongoose.models);
            let activeCollection: any = allModels.filter((item: any) => item[0].toLowerCase() == collection.toLowerCase())[0];

            if (activeCollection) {

                // fetch Associated Object
                const contextObject = await this._databaseService.getSingleItem(
                    activeCollection[1],
                    {
                        _id: objectId
                    }
                );

                return this._convertor.getJsonByProperty(contextObject, property);
            }
            else {
                throw this.helperObj.getCustomError
                    (
                        HttpStatus.NOT_FOUND,
                        constants.errors.COLLECTION_NOT_FOUND,
                        true
                    );
            }
        }
        catch (err) {
            this.helperObj.throwErrors(err);
        }
    }

}