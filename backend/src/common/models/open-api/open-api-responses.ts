
const BadResponse = {
    '400': {
        description: 'Bad request. The flag "hasErrors" will be TRUE and error details will be provided in "errorModel" object',
        content: {
            'application/json': {
                schema: {
                    '$ref': '#/components/schemas/ResponseModel'
                }
            }
        }
    }
}
const InternalServerErrorResponse = {
    '500': {
        description: 'Internal Server Error'
    }
}
const Success = {
    '200': {
        description: 'Successful Response. The flag "hasErrors" will be FALSE and expected response will be provided in "result" object',
        content: {
            'application/json': {
                schema: {
                    '$ref': '#/components/schemas/ResponseModel'
                }
            }
        }
    }
}


export { BadResponse, Success, InternalServerErrorResponse }
