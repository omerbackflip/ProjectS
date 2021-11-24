import { Request, Response, NextFunction } from "express";
import {
	Middleware,
	ExpressErrorMiddlewareInterface,
} from "routing-controllers";
import config from "../../config";
import { ResponseModel } from "../models/response-model";
import { ErrorModel } from "../models/error-model";
import { CustomErrorModel } from "../models/custom-error-model";
import * as HttpStatus from 'http-status-codes';
import { Logger } from '../../utils/logger';
const appResponses = require("../constants/app-responses");
import { Inject } from 'typedi';

@Middleware({ type: "after" })
export default class ErrorHandler implements ExpressErrorMiddlewareInterface {

	@Inject()
    private readonly logger: Logger;

	error(err: any, req: Request, res: Response, next: NextFunction): void {
		const response = new ResponseModel<null>(null);
		const errorModel = new ErrorModel();

		if (!req.logger)
            req.logger = this.logger;


		if (err.joi) {

			const reducer = (accumulator: any, currentValue: any) => accumulator + currentValue.message;
			appResponses.invalidRequest.description = err.joi.details.reduce(reducer, "");

			res.status(HttpStatus.BAD_REQUEST).send({
				statusCode: appResponses.invalidRequest.statusCode,
				description: appResponses.invalidRequest.description,
			});

			req.logger.logError(
				`VALIDATION ERROR - ${res.req.method} ${res.req.originalUrl} ${HttpStatus.BAD_REQUEST} ${res.statusMessage ? res.statusMessage : ""}`,
				res.req.headers,
				err.joi
			);
			return next();
		}
		response.hasErrors = true;

		const customErr = err as CustomErrorModel;
		if (customErr.hasErrors && customErr.isWrappedResponse) {
			errorModel.message = customErr.message;
			errorModel.data = customErr.data;
			errorModel.stack =
				config.env === "development" ? customErr.stack : undefined;
			response.errorModel = errorModel;

			res.status(customErr.httpStatusCode).send(response);

			req.logger.logError(
				`CUSTOM ERROR - ${res.req.method} ${res.req.originalUrl} ${customErr.httpStatusCode}`,
				res.req.headers,
				customErr.data
			);

			return next();
		}
		if (customErr.hasErrors && !customErr.isWrappedResponse) {
			response.errorModel = customErr.data;

			res.status(customErr.httpStatusCode).send(response.errorModel);
			req.logger.logError(
				`CUSTOM ERROR - ${res.req.method} ${res.req.originalUrl} ${customErr.httpStatusCode}`,
				res.req.headers,
				customErr.data
			);

			return next();
		}

		switch (err.name) {
			default:
				req.logger.logError(err, 'Something went wrong');
				errorModel.message = err.message;
				errorModel.stack = config.env === "development" ? err.stack : undefined;
				response.errorModel = errorModel;

				return next();
		}
	}
}
