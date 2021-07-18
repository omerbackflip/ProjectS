export class CustomErrorModel extends Error {
    httpStatusCode: number;
    message: string;
    data: any;
    hasErrors: boolean = true;
    isWrappedResponse: boolean = true;
    constructor() {
        super();
    }
}
