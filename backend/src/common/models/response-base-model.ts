import { ErrorModel } from "../models/error-model";
import { PagingModel } from "../models/paging-model";
import { CustomInject } from "../injector/custom-injector";
import { IsOptional, IsBoolean, IsInstance } from 'class-validator'
export class ResponseBaseModel {
    @IsBoolean()
    hasErrors: boolean = false;

    @IsOptional()
    @IsInstance(ErrorModel)
    @CustomInject(ErrorModel)
    errorModel: ErrorModel;

    @IsOptional()
    @IsInstance(PagingModel)
    @CustomInject(PagingModel)
    pagingModel: PagingModel;

    @IsOptional()
    filterId: any;

}