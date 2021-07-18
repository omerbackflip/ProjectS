import { FilterBaseModel } from '../../common/models/filter-base-model';
import { IsOptional } from 'class-validator';

export class GenericFilteringRequestModel extends FilterBaseModel {
    collectionName: string;
    filterOptions: any;
    projectPayload: any;

    @IsOptional()
    restProps: any;
}