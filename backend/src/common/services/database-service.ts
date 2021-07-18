import 'reflect-metadata';
import { Service, Inject } from 'typedi';
import mongoose from 'mongoose';
import config from '../../config';
import { Logger } from '../../utils/logger';
import { PagingModel } from "../models/paging-model";

@Service()
export class DatabaseService {
	@Inject()
	private logger: Logger;

	public async initializeAndConnectDB(): Promise<any> {
		const password = encodeURIComponent(config.database.password);
		const DB_URL = `mongodb://${config.database.host}:${config.database.port}/${config.database.name}?authSource=admin`;
		const options = {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			auto_reconnect: true,
			autoIndex: false, // Don't build indexes
			poolSize: config.database.poolSize  // Maintain up to 10 socket connections
		};
		return mongoose.connect(DB_URL, options);
	}

	public async addItem(model: any, payload: any): Promise<any> {
		try {
			this.logger.logInfo(
				'DATABASE_SERVICE.addItem: Adding new item in: ' +
				model.collection.collectionName,
				payload,
			);
			const savedItem = await new model(payload).save();
			if (savedItem) {
				this.logger.logInfo(
					'DATABASE_SERVICE.addItem: Recieved saved item from: ' +
					model.collection.collectionName,
					savedItem,
				);
				return savedItem;
			}
		} catch (error) {
			this.logger.logError(
				'DATABASE_SERVICE.addItem: Error occured while adding item in: ' +
				model.collection.collectionName,
				error,
			);
		}
	}

	public async getSingleItem(model: any, query: any, projectPayload?: any, options? :any): Promise<any> {
		try {
			this.logger.logInfo(
				'DATABASE_SERVICE.getSingleItem: getting single item from: ' +
				model.collection.collectionName,
				query,
			);
			const result = projectPayload ? await model.findOne(query, projectPayload, options).lean() : await model.findOne(query, null, options).lean();
			if (result) {
				this.logger.logInfo(
					'DATABASE_SERVICE.getSingleItem: Recieved query result from: ' +
					model.collection.collectionName,
					result,
				);
				return result;
			}
		} catch (error) {
			this.logger.logError(
				'DATABASE_SERVICE.getSingleItem: Error occured while getting single item in: ' +
				model.collection.collectionName,
				error,
			);
		}
	}

	public async getLimitedItems(model: any, query: any, limit: any) {
		try {
			this.logger.logInfo(
				'DATABASE_SERVICE.getLimitedItems: getting limited items from: ' +
				model.collection.collectionName + " Limit: " + limit,
				query,
			);
			const result = await model.find(query).limit(limit).lean();
			if (result) {
				this.logger.logInfo(
					'DATABASE_SERVICE.getLimitedItems: Recieved query result from: ' +
					model.collection.collectionName + " Limit: " + limit,
					result,
				);
				return result;
			}
		} catch (error) {
			this.logger.logError(
				'DATABASE_SERVICE.getLimitedItems: Error occured while getting many items in in: ' +
				model.collection.collectionName + " Limit: " + limit,
				error,
			);
		}
	}
	public async getAggregatedGroupedItems(model: any, query: any, groupingPayload: any, projectPayload?: any) {
		try {
			this.logger.logInfo(
				'DATABASE_SERVICE.getAggregatedGroupedItems: getting aggregated items from: ' +
				model.collection.collectionName,
				query,
			);

			const result = projectPayload ?
				model.aggregate([
					{ $match: query },
					{ $group: groupingPayload },
					{ $project: projectPayload }
				]).allowDiskUse(true) :
				model.aggregate([
					{ $match: query },
					{ $group: groupingPayload }
				])

			if (result) {
				this.logger.logInfo(
					'DATABASE_SERVICE.getAggregatedGroupedItems: Recieved query result from: ' +
					model.collection.collectionName,
					result,
				);
				return result;
			}

		} catch (error) {
			this.logger.logError(
				'DATABASE_SERVICE.getAggregatedGroupedItems: Error occured while getting aggregated items in: ' +
				model.collection.collectionName,
				error,
			);
		}
	}
	public async getManyItems(model: any, query: any, projectPayload?: any) {
		try {
			this.logger.logInfo(
				'DATABASE_SERVICE.getManyItems: getting many items from: ' +
				model.collection.collectionName,
				query,
			);
			const result = projectPayload ? await model.find(query, projectPayload).lean() : await model.find(query).lean();
			if (result) {
				this.logger.logInfo(
					'DATABASE_SERVICE.getManyItems: Recieved query result from: ' +
					model.collection.collectionName,
					result,
				);
				return result;
			}
		} catch (error) {
			this.logger.logError(
				'DATABASE_SERVICE.getSingleItem: Error occured while getting many items in: ' +
				model.collection.collectionName,
				error,
			);
		}
	}

	// Function to insert bulk records in database
	public async addManyItems(model: any, payload: []) {
		try {
			this.logger.logInfo(
				'DATABASE_SERVICE.addManyItems: adding many items in: ' +
				model.collection.collectionName,
				payload,
			);

			const result = model.insertMany(payload, { ordered: true });

			if (result) {
				this.logger.logInfo(
					'DATABASE_SERVICE.addManyItems: Added many items in ' +
					model.collection.collectionName,
					result,
				);
				return result;

			}
		} catch (error) {
			this.logger.logError(
				'DATABASE_SERVICE.addManyItems: Error occured while adding many items in: ' +
				model.collection.collectionName,
				error,
			);
		}
	}

	public async getPagedItems(model: any, query: any, projectPayload: any) {
		try {
			this.logger.logInfo(
				'DATABASE_SERVICE.getManyItems: getting filtered from: ' +
				model.collection.collectionName,
				query,
			);

			const limit = parseInt(query.limit || config.pager.defaultLimit);
			const page = parseInt(query.page || config.pager.defaultPage);
			const skip = limit * (page - 1);


			let sortingOption: any = {};
			if (query.sortBy) {
				sortingOption[query.sortBy] = query.sortOrder;
			}
			else {
				sortingOption = { [`${config.pager.defaultSortBy}`]: config.pager.defaultSortOrder };
			}

			delete query.limit;
			delete query.page;
			delete query.sortBy;
			delete query.sortOrder;

			const [total, result] = await Promise.all([
				model.countDocuments(query),
				model.find(query, projectPayload).skip(skip).limit(limit).sort(sortingOption).lean(),
			])

			if (result && result.length) {

				const pagingModel = new PagingModel();
				pagingModel.total = total;
				pagingModel.totalPages = Math.ceil(total / limit);
				pagingModel.pageNumber = page;
				pagingModel.pageSize = limit;
				pagingModel.sortBy = sortingOption;

				this.logger.logInfo(
					'DATABASE_SERVICE.getFilteredItems: Recieved query result from: ' +
					model.collection.collectionName,
					result,
					pagingModel
				);
				return { result: result, pagingModel };
			}

		} catch (error) {
			this.logger.logError(
				'DATABASE_SERVICE.getFilteredItems: Error occured while getting filtered items in: ' +
				model.collection.collectionName,
				error,
			);
		}
	}


	public async updateItem(
		model: any,
		query: any,
		payload: any,
	): Promise<any> {
		try {
			this.logger.logInfo(
				'DATABASE_SERVICE.updateItem: updating item in: ' +
				model.collection.collectionName,
				payload,
			);

			const updatedItem = await model.findOneAndUpdate(query, payload, {
				useFindAndModify: false,
				new: true,
				lean: true
			});

			if (updatedItem) {
				this.logger.logInfo(
					'DATABASE_SERVICE.updateItem: Recieved updated item from: ' +
					model.collection.collectionName,
					query,
					payload,
					updatedItem
				);
				return updatedItem;
			}
		} catch (error) {
			this.logger.logError(
				'DATABASE_SERVICE.updateItem: Error occured while updating item in: ' +
				model.collection.collectionName,
				error,
			);
		}
	}

	public async updateManyItem(
		model: any,
		query: any,
		payload: any,
	): Promise<any> {
		try {
			this.logger.logInfo(
				'DATABASE_SERVICE.updateManyItem: updating many items in: ' +
				model.collection.collectionName,
				payload,
			);

			const updatedItem = await model.updateMany(query, payload, {
				useFindAndModify: false,
				new: true,
			});

			if (updatedItem) {
				this.logger.logInfo(
					'DATABASE_SERVICE.updateManyItem: Recieved updated items from: ' +
					model.collection.collectionName,
					query,
					payload,
				);
				return updatedItem;
			}
		} catch (error) {
			this.logger.logError(
				'DATABASE_SERVICE.updateManyItem: Error occured while updating many items in: ' +
				model.collection.collectionName,
				error,
			);
		}
	}

	public async getDocumentCount(model: any, query: any) {
		try {
			this.logger.logInfo(
				'DATABASE_SERVICE.getDocumentCount: getting document counts from: ' +
				model.collection.collectionName,
				query,
			);

			const result = await model.countDocuments(query);
			if (result) {
				this.logger.logInfo(
					'DATABASE_SERVICE.getDocumentCount: Recieved document counts from: ' +
					model.collection.collectionName,
					query,
				);
				return result;
			}
		} catch (error) {
			this.logger.logError(
				'DATABASE_SERVICE.getDocumentCount: Error occured while getting document count in: ' +
				model.collection.collectionName,
				error,
			);
		}
	}

	public async isExists(model: any, query: any) {
		try {
			this.logger.logInfo(
				'DATABASE_SERVICE.isExists: checking documents in: ' +
				model.collection.collectionName,
				query,
			);

			const result = await model.exists(query);
			if (result != undefined) {
				this.logger.logInfo(
					'DATABASE_SERVICE.isExists: Recieved query result from: ' +
					model.collection.collectionName,
					query,
				);
				return result;
			}
		} catch (error) {
			this.logger.logError(
				'DATABASE_SERVICE.isExists: Error occured while checking documents in: ' +
				model.collection.collectionName,
				error,
			);
		}
	}
}
