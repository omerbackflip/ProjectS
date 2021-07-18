import "reflect-metadata";
import { Response, Request } from "express";
import { JsonController, Req, Res, Get, Post, QueryParams, UseBefore } from "routing-controllers";
import { Inject } from "typedi";
import { PayableItemsService } from "../services/payable-items-service";
import { ResponseModel } from "../../common/models/response-model";
import { PassportAuthMiddleware } from '../middleware/passport-auth-middleware';
import { PayableItemsModel } from "../models/payable-items-request-model";
const { celebrate } = require('celebrate');
const PayableItemsRequestValidator = require('../models/payable-items-validation-schema');
const constants = require('../constants/constant');
const multer = require('multer');
var upload = multer({ dest: 'files/' })
const XLSX = require('xlsx');

@JsonController(constants.appRoutingPrefix)
@UseBefore(PassportAuthMiddleware)
export class PayableItemsController {

	@Inject()
	private payableItemsService: PayableItemsService;

	@Post("/payable-items/upload")
	@UseBefore(
		celebrate(PayableItemsRequestValidator.validateRequestParams),
		upload.single("file")
	)
	public async savePayableItems(
		@Req() req: any,
		@Res() res: Response,
	): Promise<Response<ResponseModel<any>>> {
		var workbook = XLSX.readFile(`files/${req.file.filename}`);

		const result = await this.payableItemsService.savePayableItems(workbook);
		if (result) {
			return res.send(result);
		}
		else {
			return res.send("Error");
		}
	}

	@Get("/payable-items/get")
	@UseBefore(
		celebrate(PayableItemsRequestValidator.validateRequestParams),
	)
	public async getData(
		@Req() req: Request,
		@Res() res: Response,
		@QueryParams() query: any
	): Promise<any> {

		const result = await this.payableItemsService.getData(query);
		if (result) {
			return res.send(result);
		}
		else {
			return res.send({
				hasErrors: true,
				message: "No data found by the filter ID!"
			});
		}
	}

	@Get("/payable-items/get-area/:id")
	public async getAreaById(
		@Req() req: Request,
		@Res() res: Response,
		@QueryParams() query: any
	): Promise<Response<ResponseModel<any>>> {

		const result = await this.payableItemsService.getItemById(req.params);
		if (result) {
			return res.send(result);
		}
		else {
			return res.send({
				hasErrors: true,
				message: "No data found by the filter ID!"
			});
		}
	}

	@Get("/payable-items/get-count")
	public async getCount(
		@Req() req: Request,
		@Res() res: Response,
		@QueryParams() query: any
	): Promise<any> {
		const response = await this.payableItemsService.getCount();
		if(response){
			res.send({
				count:response,
			});
		}
	}

}
