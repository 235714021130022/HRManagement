import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { RegisterDTO } from "./dto/auth.dto";
import { Employee } from "generated/prisma/client";
import {hash} from 'bcrypt';
@Injectable()
export class AuthService {
    constructor(private prismaServer: PrismaService){
        
    }
    register = async (userData: RegisterDTO): Promise<Employee> => {
        const checkExisting = await this.prismaServer.employee.findUnique({
            where: {
                email_account: userData.email_account,
                phone_account: userData.phone_account
            }
        })
        if(checkExisting){
            throw new HttpException({message: 'This email or phone number has been used'}, HttpStatus.BAD_REQUEST)
        }
        const password = hash(userData.password, 10);
        const createData = await this.prismaServer.employee.create({
            data: {
                email_account: userData.email_account,
                phone_account: userData.phone_account,
                password: password,
                status: userData.status
            }
        })
        return createData;
    }

}