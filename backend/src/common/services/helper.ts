import { Service } from "typedi";
import { CustomInject } from "../injector/custom-injector";
import { CustomErrorModel } from "../models/custom-error-model";
import * as HttpStatus from 'http-status-codes';

const appResponses = require('../constants/app-responses');

@Service()
export class Helper {
    @CustomInject(CustomErrorModel)
    private _customError: CustomErrorModel;

    public getCustomError = (httpStatusCode: number, message: string, _isWrappedResponse?: boolean, payload?: any) => {
        this._customError.isWrappedResponse = _isWrappedResponse;
        this._customError.httpStatusCode = httpStatusCode;
        this._customError.message = message;
        this._customError.data = payload;
        return this._customError;
    }

    public rPad = (pad: string, padLength: number, input: string) => {
        let tempPad = "";
        for (let i = 0; i < padLength; i++) {
            tempPad += pad;
        }
        return (input + tempPad);
    }

    public appendStatic = (text: string, resultantLength: number, input:string) => {
        const spaceAvailable = resultantLength - text.length;
        if(input.length > spaceAvailable) {
            input = input.substring(0, spaceAvailable);
        }
        return input + text;
    }

    public throwErrors(err: any) {
        throw this.getCustomError
            (
                err.httpStatusCode ? err.httpStatusCode : HttpStatus.INTERNAL_SERVER_ERROR,
                err.message ? err.message : appResponses.internalServerErrorMessage,
                true,
            );
    }
}