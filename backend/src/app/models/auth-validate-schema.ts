import { Joi } from "celebrate";

module.exports = {
    authLogin: {
        body: {
            username: Joi.string().required(),
            password: Joi.string().required(),
        }
    },
    createUser: {
        body: {
            userName: Joi.string().required(),
            password: Joi.string().required(),
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            rootUser: Joi.boolean().required(),
        }
    }
}
