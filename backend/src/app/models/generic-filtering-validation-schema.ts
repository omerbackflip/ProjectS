import { Joi } from "celebrate";

module.exports = {
    genericFiltering: {
        body: {
            collectionName: Joi.string().required(),
            filterOptions: Joi.object().required(),
            projectPayload: Joi.object()
        },
    }
}
