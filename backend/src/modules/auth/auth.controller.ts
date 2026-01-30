import { Body, Controller, Injectable, Post } from "@nestjs/common";
import { RegisterDTO } from "./dto/auth.dto";
import { Employee } from "generated/prisma/browser";
import { AuthService } from "./auth.service";


@Controller('auth')
export class AuthController{
    constructor(private authService: AuthService){}
    @Post('register')
    register (@Body() body: RegisterDTO): Promise<Employee>{
        return this.authService.register(body);
    }

    @Post('login')
    login(@Body() body: RegisterDTO):Promise<any>{
        return this.authService.login(body);
    }
}