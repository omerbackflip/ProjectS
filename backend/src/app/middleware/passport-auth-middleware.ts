import { Request, Response, NextFunction } from "express";
import passport from 'passport';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
const appConstants = require('../constants/constant');
import * as HttpStatus from 'http-status-codes';
const appResponses = require('../../common/constants/app-responses');
import { AuthService } from '../services/auth-service';
import { Helper } from "../../common/services/helper";
import { Inject } from "typedi";
var JwtStrategy = require('passport-jwt').Strategy;

@Middleware({ type: "before" })
export class PassportAuthMiddleware implements ExpressMiddlewareInterface {

  private _authService :AuthService

  @Inject()
  private helperObj: Helper;

  constructor(
    authService :AuthService
  ){
    const opts = {
        jwtFromRequest: (response :any) => {
            let token = '';

            if(response.req.headers && response.req.headers.authorization)
              token = response.req.headers.authorization.split(' ')[1];
    
            if(response.req.cookies && response.req.cookies.authorization)
              token = response.req.cookies.authorization;    
    
            return token;
        },
        secretOrKey: appConstants.auth.jwtSecret
    }
    this._authService = authService;
    this.setupJWTStrategy(opts);
  }

  setupJWTStrategy(opts :object){
    passport.use(new JwtStrategy(opts, (jwt_payload :any, done :any, ) => {
        try{
          return new Promise(() => {
              // Fetch associated user to verify validity of token/user
              const user = this._authService.getUserByUsernameAndPassword({
                username: jwt_payload.username,
                password: jwt_payload.password
              });

              if (user) {
                  return done(null, user);
              } else {
                  return done(null, false);
              }
          });
        } catch(e){
          throw this.helperObj.getCustomError
          (
              HttpStatus.INTERNAL_SERVER_ERROR,
              appResponses.internalServerErrorMessage,
              true,
          );
        }
      })
    );
  }

  // tslint:disable-next-line
  private authenticate = (callback :any) => passport.authenticate('jwt', { session: false }, callback);

  use(request: Request, response: Response, next: NextFunction): Promise<passport.Authenticator> {
    return this.authenticate((err :any, user :object) => {
      try{

        if (err || !user) {
          throw this.helperObj.getCustomError
          (
              HttpStatus.UNAUTHORIZED,
              appConstants.auth.invalidTokenResponse,
              true,
          );
        }
  
        request.user = user;
        return next();
      } catch(e){
        throw this.helperObj.getCustomError
        (
            HttpStatus.UNAUTHORIZED,
            appConstants.auth.invalidTokenResponse,
            true,
        );
      }
    })(response, request, next);
  }
}