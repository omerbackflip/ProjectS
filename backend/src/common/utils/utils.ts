import { Service, Inject } from "typedi";
import { Logger } from "../../utils/logger";
import { DatabaseService } from "../services/database-service";

@Service()
export class Utils {
    @Inject()
    private logger: Logger;

    @Inject()
    private _databaseService: DatabaseService

    public async getData(): Promise<any> {
        try {
            //
        }
        catch (err) {
            this.logger.logError('Utils.getPurposeCodeMappedValue: ERROR -> ', err);
        }
        return {}
    }
}   
