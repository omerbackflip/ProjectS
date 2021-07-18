import Bunyan from "bunyan";
import { Service } from "typedi";
import config from "../config";
import fs from 'fs';

@Service('Logger')
export class Logger {

    private _logger: Bunyan;
    
    constructor() {
        if (!this._logger) {
            if (!fs.existsSync(config.application.logging.basePath)) {
                fs.mkdirSync(config.application.logging.basePath);//create path if doesn't exist
            }
            this._logger = new Bunyan({
                name: config.application.name,
                serializers: Bunyan.stdSerializers,
                streams: [
                    {
                        level: this.getBunyanLevel(config.application.logging.level),
                        stream: process.stdout,
                    },
                    {
                        level: this.getBunyanLevel(config.application.logging.level),
                        path: `${config.application.logging.basePath}${config.application.name.toLowerCase()}.log`,
                    }],
            });
        }
    }
    public async logInfo(_info: any, ...params: any[]) {
        try {
            if (_info) {
                const lMessage = this.transformLogMessage(_info, Bunyan.nameFromLevel[Bunyan.INFO]);
                if (this.getBunyanLevel(config.application.logging.level) == Bunyan.DEBUG) {
                    this._logger.debug(lMessage, {...params});
                }
                else {
                    this._logger.info(lMessage);
                }
            }            
        } catch (error) {
            
        }
    }

    public async logError(_error: any, ...params: any[]) {
        try {
            let data:any = {};

            this._logger.error(this.transformLogMessage(
                _error, 
                Bunyan.nameFromLevel[Bunyan.ERROR]), 
                {...params}
            );
                        
        } catch (error) {
            
        }
    }

    public getLogger() {
        return this._logger;
    }

    private transformLogMessage(message: string, type: string) {
        return `${config.application.name}:${type.toUpperCase()} --> ${message}`
    }

    private getBunyanLevel(level: string) {
        let levelNum: number;
        switch (level) {
            case 'compact':
                levelNum = Bunyan.INFO;
                break;
            case 'detail':
                levelNum = Bunyan.DEBUG;
                break;
        }
        return levelNum;
    };

}

