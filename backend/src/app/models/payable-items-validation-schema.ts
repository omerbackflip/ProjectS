"use strict";
const Joi = require('celebrate').Joi;
module.exports = {
    validateRequestParams: {
        query: {
            itemId: Joi.any(),
            keyword: Joi.any(),
            userName: Joi.any()
        },
    },
}
