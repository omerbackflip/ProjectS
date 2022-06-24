import "reflect-metadata";
import { Response, Request } from "express";
import { JsonController, Req, Res, Get, Post, QueryParams, UseBefore, Put, Delete } from "routing-controllers";
import { Inject } from "typedi";
import { ShortListService } from "../services/short-list-service";
import { ResponseModel } from "../../common/models/response-model";
import { PassportAuthMiddleware } from '../middleware/passport-auth-middleware';
import { DatabaseService } from '../../common/services/database-service';
const shortListModel = require('../models/mongoose/short-list');
import fs from 'fs'
import { promisify } from "util";
const multer = require('multer');
var upload = multer({ dest: 'short-listed/' })

var storage = multer.diskStorage({
	destination: function (req: any, file: any, cb: any) {
	  cb(null, `./src/app/controllers/attached-files/`)	//Middleware to create/save to directory files
	},
	filename: function (req: any, file: any, cb: any) {
	  cb(null, file.originalname) //Appending .jpg
	}
  })
  
var uploadFile = multer({ storage: storage });

const XLSX = require('xlsx');
var excel = require('exceljs');


const constants = require('../constants/constant');

@JsonController(constants.appRoutingPrefix)
@UseBefore(PassportAuthMiddleware)
export class ShortListController {

	@Inject()
	private shortListService: ShortListService;

	@Inject()
    private _databaseService: DatabaseService;

	@Post("/short-list-items/upload")
	@UseBefore(
		upload.single("file")
	)
	public async saveShortListedItems(
		@Req() req: any,
		@Res() res: Response,
	): Promise<Response<ResponseModel<any>>> {
		var workbook = XLSX.readFile(`short-listed/${req.file.filename}`);

		const result = await this.shortListService.saveShortListedItems(req.body,workbook);
		if (result) {
			return res.send(result);
		}
		else {
			return res.send({
				hasErrors: true,
				message: "Could not upload file!"
			});		
		}
	}

	@Get("/short-list-items/get")
	public async getData(
		@Req() req: Request,
		@Res() res: Response,
		@QueryParams() query: any
	): Promise<any> {

		const result = await this.shortListService.getData(query);
		if (result) {
			return res.send(result);
		}
		else {
			return res.send({
				hasErrors: true,
				message: "No match found for shorlisting!"
			});
		}
	}

	@Get("/short-list-items/get-items-id")
	public async getItemsID(
		@Req() req: Request,
		@Res() res: Response,
		@QueryParams() query: any
	): Promise<any> {

		const result = await this.shortListService.getItemsID(query);
		if (result) {
			return res.send(result);
		}
		else {
			return res.send({
				hasErrors: true,
				message: "No match found for shorlisting!"
			});
		}
	}

	@Put("/short-list-items/add")
	public async addItem(
		@Req() req: Request,
		@Res() res: Response,
		@QueryParams() query: any
	): Promise<Response<ResponseModel<any>>> {
		const result = await this.shortListService.addItem(req.body);
		if (result) {
			return res.send(result);
		}
		else {
			return res.send({
				hasErrors: true,
				message: "Couldn't add the item to the short list!"
			});
		}
	}

	@Put("/short-list-items/update-item")
	public async updateItem(
		@Req() req: Request,
		@Res() res: Response,
		@QueryParams() query: any
	): Promise<Response<ResponseModel<any>>> {
		const result = await this.shortListService.updateItem(req.body);
		if (result) {
			return res.send(result);
		}
		else {
			return res.send({
				hasErrors: true,
				message: "Could not update the item!"
			});
		}
	}

	@Delete("/short-list-items/delete-item/:id/:userName")
	public async deleteItem(
		@Req() req: Request,
		@Res() res: Response,
		@QueryParams() query: any
	): Promise<Response<ResponseModel<any>>> {

		const result = await this.shortListService.deleteItem(req.params);
		if (result) {
			return res.send(result);
		}
		else {
			return res.send({
				hasErrors: true,
				message: "Could not delete the item!"
			});
		}
	}

	@Put("/short-list-items/add-file")
	@UseBefore(
		uploadFile.single("file")
	)
	public async addFile(
		@Req() req: any,
		@Res() res: Response,
		@QueryParams() query: any
	): Promise<Response<ResponseModel<any>>> {

		const result = await this.shortListService.addFile(req.body,req.file);
		if (result) {
			return res.send(result);
		}
		else {
			return res.send({
				hasErrors: true,
				message: "Could not add the file!"
			});
		}
	}

	@Get("/short-list-items/get-file")
	public async getFile(
		@Req() req: any,
		@Res() res: Response,
		@QueryParams() query: any
	): Promise<any> {
		try {
			const url = `${__dirname}/attached-files/${query.destination}`;
			await promisify<string, void>(res.download.bind(res))(url)
			return res;
		} catch (error) {
			console.log(error)
		}
	}
	

	@Get("/short-list-items/export-excel")
	public async getExportedFile(
		@Req() req: any,
		@Res() res: Response,
		@QueryParams() query: any
	): Promise<any> {
		try {
            var Excel = require('exceljs');
            var workbook = new Excel.Workbook();
            var worksheet = workbook.addWorksheet('exported-shorlists-items');
            worksheet.columns = [
                { header: 'ID', key: 'itemId', width: 12 },
                { header: 'Description', key: 'description', width: 75 },
                { header: 'Unit', key: 'unit', width: 10 },
                { header: 'Price', key: 'price', width: 12 },
				{ header: 'מחיר חוזה', key: 'discount_price', width: 12 },
                { header: 'Planned', key: 'planned', width: 12 },
                { header: 'Paid', key: 'paid', width: 12 },
                { header: 'Amount', key: 'amount', width: 12 },
				{ header: 'Total', key: 'total', width: 12 },
				{ header: 'Topic', key: 'topic', width: 12 },
                { header: 'Remarks', key: 'remarks', width: 75 },
            ]
            let rows: any[] = [];
            let data = await this._databaseService.getManyItems(shortListModel , {userName: query.userName});
			//rows.push({discount} ); // try to print the user name in the header	
            if(data) {
				data = await this.shortListService.sortObject(data);
                data.forEach((item: any,index: number)=>{
                    rows.push({
                        itemId: item.itemId,
                        description: (item.description) || '',
                        unit: item.unit,
                        //price: this.shortListService.numberWithCommas(item.price), // This function makes numbers to be string in the Excel...
                        price: item.price,
						discount_price: (item.price * query.discount),
						//discount_price: (item.price*discount).toLocaleString(undefined, {maximumFractionDigits: 0}),
                        planned: item.planned,
                        amount: item.amount,
                        paid: item.paid,
						total: (item.amount * item.price) ? (item.amount * item.price * query.discount) : '',
                        topic: item.topic,
                        remarks: item.remarks,
                    });
                });
				const summary = await this.shortListService.getSummaries(query,true);
				if(summary && summary?.summaryIDs.length) {
					rows.push({}); // empty row
					rows.push({}); // empty row
					rows.push({}); // empty row
					summary.summaryIDs.forEach((sum: any) => {
						rows.push({
							description: sum
						})
					})
					rows.push({
						description:`Grand Total:  ${summary.grandTotalIDs.toFixed(0)}`
					})
				}

				if(summary && summary?.summaryTopics.length) {
					rows.push({}); // empty row
					rows.push({}); // empty row
					rows.push({}); // empty row
					summary.summaryTopics.forEach((sum: any) => {
						rows.push({
							description: sum
						})
					})
					rows.push({
						description:`Grand Total:  ${summary.grandTotalTopics.toFixed(0)}`
					})
				}


                worksheet.addRows([
					...rows,
				]);
				
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader("Content-Disposition", "attachment; filename=" + 'exported-shortlists.xlsx');
            
                await workbook.xlsx.write(res); 
				res.end();


			}
		} catch (error) {
			console.log(error)
		}
	}
	

	@Put("/short-list-items/get-summary")
	public async getSummary(
		@Req() req: any,		//req.body 
		@Res() res: Response, 	//Generic type of response like responseData responseType ResponseError
		@QueryParams() query: any
	): Promise<any> {
		try {
			const result = await this.shortListService.getSummaries(req.body);
			if (result) {
				return res.send(result);
			}
		} catch (error) {
			return res.send({
				hasErrors:true,
				message:"Couldn't get summary!"
			})
		}
	}

	@Put("/short-list-items/remove-file/:id/:userName")
	public async removeFile(
		@Req() req: any,
		@Res() res: Response,
		@QueryParams() query: any
	): Promise<any> {
		try {
			const result = await this.shortListService.removeFile(req.params);
			if (result) {
				return res.send(result);
			}
		} catch (error) {
			return res.send({
				hasErrors:true,
				message:"Couldn't delete file!"
			})
		}
	}
	
	@Put("/short-list-items/delete")
	public async deleteShortListItems(
		@Req() req: Request,
		@Res() res: Response,
		@QueryParams() query: any
	): Promise<any> {
		const response = await this.shortListService.deleteShortListItems(req.body);
		if(response){
			res.send({
				success:true
			});
		}
	}

	@Put("/short-list-items/copy")
	public async copyShortListItems(
		@Req() req: Request,
		@Res() res: Response,
		@QueryParams() query: any
	): Promise<any> {
		const response = await this.shortListService.copyShortListItems(req.body);
		if(response){
			res.send({
				success:true
			});
		}
	}

	@Get("/short-list-items/get-image")
	public async getImage(
		@Req() req: Request,
		@Res() res: Response,
		@QueryParams() query: any
	): Promise<any> {
		const url = `${query.destination}`;
		const bitmap: any = fs.readFileSync(url);
		const base64:any = Buffer.from(bitmap).toString("base64");
		res.send(base64);  // Send base64 instead of the raw file binary
	}

}
