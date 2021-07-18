import axios from "axios";
import { Service, Inject, Container } from "typedi";
import config from "../config";
import { Logger } from "./logger";
import { ClientResponseModel } from '../common/models/client-response-model';
import { CustomInject } from '../common/injector/custom-injector';
import * as HttpStatus from 'http-status-codes';
import https from 'https';
@Service()
export class RestClient {
    @CustomInject(ClientResponseModel)
    private clientResponseModel: ClientResponseModel;

    @Inject()
    private Logger: Logger;
    private timeout: any;

    constructor() {
        this.timeout = config.restClient.requestTimeOut;
    }

    public async execute(
        url: string,
        headers: any,
        method: any,
        body: any,
        query?: any,
        restConfigs?: any,

    ): Promise<ClientResponseModel> {
        const options = {
            method: method,
            url: url,
            data: body,
            headers: headers,
            timeout: this.timeout,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            ...restConfigs,
        };

        if (query) {
            options.params = query;
        }
        const commonLog = `${method} ${url} ${query ? 'QueryParams:' + JSON.stringify(query) : ""} `;
        this.Logger.logInfo(`REST_CLIENT.REQUEST INITIATED - ${commonLog}`, options);
        try {
            if (config.application.ssl.enableValidation == false) {
                const agent = new https.Agent({
                    rejectUnauthorized: false
                });
                options.httpsAgent = agent;
            }
            const apiResponse = await axios(options);
            if (apiResponse) {
                (this.clientResponseModel.status = apiResponse.status),
                    (this.clientResponseModel.result = apiResponse.data),
                    (this.clientResponseModel.statusText =
                        apiResponse.statusText);

                this.clientResponseModel.hasErrors = false;

                this.Logger.logInfo(`REST_CLIENT.REQUEST COMPLETED -  ${commonLog} ${apiResponse.status} ${apiResponse.statusText}`, apiResponse.data);
            }
        } catch (err) {
            this.clientResponseModel.hasErrors = true;
            if (err.response) {
                this.clientResponseModel.statusText = err.response.statusText;
                this.clientResponseModel.status = err.response.status;
                this.clientResponseModel.result = err.response.data;
            }
            else {
                this.clientResponseModel.statusText = err.message;
                this.clientResponseModel.result = err.message;
                this.clientResponseModel.status = this.getStatusCodeByErrorCode(err.code);
            }
            this.Logger.logError(`REST_CLIENT.REQUEST COMPLETED -  ${commonLog} ${this.clientResponseModel.status} ${this.clientResponseModel.statusText}`, err.toJSON());
        }
        return this.clientResponseModel;
    }

    private getStatusCodeByErrorCode(errCode: any) {
        switch (errCode) {
            case "ENOTFOUND":
                return HttpStatus.NOT_FOUND;
            case "ECONNABORTED":
                return HttpStatus.GATEWAY_TIMEOUT;
            case "ETIMEDOUT":
                return HttpStatus.GATEWAY_TIMEOUT;
            default:
                return HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
}