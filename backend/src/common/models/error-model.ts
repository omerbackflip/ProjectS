import { IsString, IsObject, IsJSON } from 'class-validator'
export class ErrorModel {
    @IsString()
    message: string;
    @IsString()
    stack: string;
    @IsString()
    data: any;
}
