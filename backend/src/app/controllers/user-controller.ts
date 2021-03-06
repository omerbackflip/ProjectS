import "reflect-metadata";
import { Response, Request } from "express";
import { JsonController, Req, Res, Get, Post, QueryParams, UseBefore, Put } from "routing-controllers";
import { Inject } from "typedi";
import { UserService } from "../services/user-service";
import { ResponseModel } from "../../common/models/response-model";
import { PassportAuthMiddleware } from '../middleware/passport-auth-middleware';

const { celebrate } = require('celebrate');
const constants = require('../constants/constant');

@JsonController(constants.appRoutingPrefix)
@UseBefore(PassportAuthMiddleware)
export class UsersController {

	@Inject()
	private userService: UserService;

	@Get("/users/get")
	public async getData(
		@Req() req: Request,
		@Res() res: Response,
		@QueryParams() query: any
	): Promise<Response<ResponseModel<any>>> {

		const result = await this.userService.getData(query);
		if (result) {
			return res.send(result);
		}
		else {
			return res.send("Error");
		}
	}
	
	@Put("/users/update")
	public async updateUser(
		@Req() req: Request,
		@Res() res: Response,
		@QueryParams() query: any
	): Promise<Response<ResponseModel<any>>> {

		const result = await this.userService.updateUser(req.body);
		if (result) {
			return res.send(result);
		}
		else {
			return res.send("Error");
		}
	}

	@Put("/users/delete/:userId")
	public async deleteUser(
		@Req() req: Request,
		@Res() res: Response,
		@QueryParams() query: any
	): Promise<Response<ResponseModel<any>>> {

		const result = await this.userService.deleteUser(req.params);
		if (result) {
			return res.send(result);
		}
		else {
			return res.send("Error");
		}
	}

}
