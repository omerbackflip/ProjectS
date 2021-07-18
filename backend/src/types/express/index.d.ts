import { Logger } from "../../utils/logger";

declare module 'express-serve-static-core' {
    interface Request {
        logger: Logger;
    }
}
