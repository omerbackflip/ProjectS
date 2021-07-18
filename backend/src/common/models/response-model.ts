import { ResponseBaseModel } from "../models/response-base-model";
import { IsOptional } from 'class-validator'
export class ResponseModel<Any> extends ResponseBaseModel {
    @IsOptional()
    result: Any;
    constructor(result: Any) {
        super();
        this.result = result
    }
}