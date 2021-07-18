/* eslint-disable @typescript-eslint/no-explicit-any */
import "reflect-metadata";
import fs from 'fs';
import https from 'https';
import bodyParser from "body-parser";
import express from 'express';
import helmet from "helmet";
import { useExpressServer, useContainer as routingUseContainer, getMetadataArgsStorage } from "routing-controllers";
import swaggerUI from "swagger-ui-express";
import { Container, Inject } from "typedi";
import config from "./config";
import ErrorHandler from './common/middleware/errorHandler';
import { Logger } from "./utils/logger";
import { routingControllersToSpec } from 'routing-controllers-openapi';
import { DatabaseService } from './common/services/database-service'
import { validationMetadatasToSchemas } from 'class-validator-jsonschema'
import { LoggerInitializer } from "./common/middleware/loggerInitializer";
import cookieParser from 'cookie-parser';
const cors = require('cors');

import { AfterLoggingMiddleware, BeforeLoggingMiddleware } from './common/middleware/logging-middlewares';

export class App {
    public readonly expressApplication: express.Application;
    private swaggerDoc: object;
    private routingControllersOptions: object;
    count = 0;

    @Inject()
    private readonly databaseService: DatabaseService;

    constructor(@Inject('Logger') private logger: Logger) {
        this.routingControllersOptions = {
            controllers: [
                __dirname + "/*/controllers/*.ts",
                __dirname + "/*/controllers/*.js"
            ],
            middlewares: [ErrorHandler, BeforeLoggingMiddleware, AfterLoggingMiddleware],
            defaultErrorHandler: false,
        };
        this.expressApplication = express();
        this.initializeMiddleware();
        this.initializeControllers();
        this.configureSwagger();
        this.initializeSwagger();
        this.configureDependencyInjection();
    }


    private initializeMiddleware(): void {
        this.expressApplication.use(helmet({ hidePoweredBy: true }));
        this.expressApplication.use(bodyParser.json({
            limit: config.application.bodyParser.limit
        }));

        this.expressApplication.use(cookieParser());

        this.expressApplication.use(cors())

        this.expressApplication.use((req: any, res: any, next: any) => {
            req.logger = this.logger;
            next();
        });
    }

    private configureSwagger(): void {
        // Parse class-validator classes into JSON Schema:
        const schemas = validationMetadatasToSchemas({
            refPointerPrefix: '#/components/schemas/'
        })
        // Parse routing-controllers classes into OpenAPI spec:
        const storage = getMetadataArgsStorage()
        this.swaggerDoc = routingControllersToSpec(storage, this.routingControllersOptions, {
            components: {
                schemas,
                securitySchemes: {
                    basicAuth: {
                        scheme: 'bearer',
                        type: 'http'
                    }
                }
            },
            info: {
                description: 'short-list-supplier APP',
                title: 'short-list-supplier APP API',
                version: '1.0.0'
            }
        })
    }

    private initializeSwagger(): void {
        this.expressApplication.use('/docs', swaggerUI.serve);
        this.expressApplication.get('/docs', swaggerUI.setup(this.swaggerDoc));
    }

    private configureDependencyInjection(): void {
        routingUseContainer(Container);
    }

    private initializeControllers(): void {
        useExpressServer(this.expressApplication, this.routingControllersOptions);
    }
    public async startExpressServer() {
        let server;
        if(this.count === 0){
            server = await this.expressApplication.listen(config.server.port);
            console.log(`Server successfully started at port ${config.server.port}`)
            this.count++;
            return true;    
        }
        return false;
    }
    public async initializeApplication() {
        try {
            this.databaseService.initializeAndConnectDB().then(async () => {
                this.logger.logInfo(`Database connected!!!!`);
                const server = await this.startExpressServer();
                if (server) {
                    this.logger.logInfo(`App has started running on port: ${config.server.port} ... API Documentation is available at /docs`);
                }
            }).catch((err: any) => {
                this.logger.logError(err)
            });
        }
        catch (err) {
            this.logger.logError(err)
        }

    }
}
