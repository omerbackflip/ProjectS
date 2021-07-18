import { Response, Request } from "express";
import { JsonController, Req, Res, Get } from "routing-controllers";
@JsonController()
export class DefaultController {
  @Get("/")
  public healthCheck(@Req() req: Request, @Res() res: Response): Response<unknown> {
    req.logger.logInfo("Hello World from short-list-supplier App!!")
    return res.send({ message: 'Hello World from short-list-supplier App!!' });
  }
}
