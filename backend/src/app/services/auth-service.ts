import { Service, Inject } from "typedi";
import { AuthLoginModel } from '../models/auth-login-model';
import { ResponseModel } from "../../common/models/response-model";
import bcrypt from 'bcrypt';
import { Helper } from "../../common/services/helper";
import * as HttpStatus from 'http-status-codes';
import { DatabaseService } from "../../common/services/database-service";
import { User } from '../models/userModel';
var jwt = require('jsonwebtoken');
const appConstants = require('../constants/constant');
const userModel = require('../models/mongoose/user');

@Service()
export class AuthService {

    @Inject()
    private helperObj: Helper;

    @Inject()
    private dbService: DatabaseService;

    public async getUserByUsernameAndPassword(authCreds: AuthLoginModel) {
        const authUser = await this.dbService.getSingleItem(userModel,{userName: authCreds.username});
        console.log(authUser)

        if(authUser) {

            if (authUser && await this.compareAsync(authUser.password, authCreds.password)) {
                return authUser;
            } else {
                return false;
            }    
        }
    }

    public async createUser(user: User) {
        try {
            const existingUser = await this.dbService.isExists(userModel, {userName: user.userName});
            if(!existingUser) {
                const hash: any = await this.hashPassword(10,user.password);
                user.password = hash;
                const newUser = await this.dbService.addItem(userModel,user);
                if(newUser) {
                    return {success: true , message: "User successfully created!"};
                }         
            } else {
                return {success: false , message: "user name already exists!"};
            }
                        
        } catch (error) {
            throw this.helperObj.getCustomError
            (
                HttpStatus.BAD_REQUEST,
                error,
                true,
            );             
        }
    }

    public async login(authCreds: AuthLoginModel): Promise<ResponseModel<any>> {
        try {
            const authUser = await this.getUserByUsernameAndPassword(authCreds);

            if (authUser) {
                const token = jwt.sign({
                    username: authUser.username,
                    password: authUser.password
                }, appConstants.auth.jwtSecret);
                return new ResponseModel(
                    {
                        token,
                        user: authUser
                    }
                );
            } else {
                throw this.helperObj.getCustomError
                (
                    HttpStatus.UNAUTHORIZED,
                    "Invalid Credentials!",
                    true,
                );            
            }
        } catch (err) {
            console.log(err);
            throw this.helperObj.getCustomError
            (
                HttpStatus.UNAUTHORIZED,
                "Invalid Credentials!",
                true,
            ); 
        }
    }


    public compareAsync(hash : any , password : any) {
        return new Promise(function(resolve, reject) {
            try {
                bcrypt.compare(password, hash, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                });                
            } catch (error) {
                reject(error)
            }
        });
    }

    public hashPassword(salt : any , password : any) {
        return new Promise(function(resolve, reject) {
            try {
                bcrypt.genSalt(salt, function(err, salt) {
                    bcrypt.hash(password, salt, async (err, hash) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(hash);
                        }   
                    });
                });                 
            } catch (error) {
                reject(error)
            }
        });
    }

}