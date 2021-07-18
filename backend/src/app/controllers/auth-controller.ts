import { Response, Request, NextFunction, query } from "express";
import { JsonController, Req, Res, Get, Post, Body, QueryParams, UseBefore, Put } from "routing-controllers";
import { Inject } from "typedi";
import { ResponseModel } from "../../common/models/response-model";
import { AuthLoginModel } from '../models/auth-login-model';
import { User } from '../models/userModel';
import { celebrate } from "celebrate";
import { OpenAPI } from 'routing-controllers-openapi';
import { BadResponse, InternalServerErrorResponse, Success } from '../../common/models/open-api/open-api-responses';
import { AuthService } from "../services/auth-service";

const appConstants = require('../constants/constant');
const validateSchema = require("../models/auth-validate-schema");

@JsonController(appConstants.appRoutingPrefix)
export class AuthController {

    @Inject()
    authService :AuthService

	@Post(`/auth/login`)
	@OpenAPI({
		description: 'Handles Auth login',
		summary: 'Used to authenicate user against username/password combination',
		responses: {
			...Success,
			...BadResponse,
			...InternalServerErrorResponse
		}
	})
	@UseBefore(celebrate(validateSchema.authLogin))
	public async authLogin(
		@Req() req: Request,
		@Res() res: Response,
		@Body() body: AuthLoginModel,
		next: NextFunction
	): Promise<Response<ResponseModel<any>>> {
		return res.send(await this.authService.login(body));
	}

	@Post(`/auth/createUser`)
	@OpenAPI({
		description: 'Handles new user request',
		summary: 'Used to Create New User',
		responses: {
			...Success,
			...BadResponse,
			...InternalServerErrorResponse
		}
	})
	@UseBefore(celebrate(validateSchema.createUser))
	public async createUser(
		@Req() req: Request,
		@Res() res: Response,
		@Body() body: User,
		next: NextFunction
	): Promise<Response<ResponseModel<any>>> {
		const user = await this.authService.createUser(body);
		if(user) {
			return res.send(user);
		} else {
			return res.send({success: false, message:"Cannot create user! Something went wrong"});
		}
	}

}