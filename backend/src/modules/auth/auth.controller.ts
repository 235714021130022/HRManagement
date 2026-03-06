import { Body, Controller, HttpCode, HttpStatus, Injectable, Post } from "@nestjs/common";
import { ChangePasswordDto, LoginDTO, RegisterDTO, RegisterResponseDto } from "./dto/auth.dto";
import { Employee } from "generated/prisma/browser";
import { AuthService } from "./auth.service";


@Controller('auth')
export class AuthController{
    constructor(private authService: AuthService){}
    @Post('register')
    register(
    @Body() body: RegisterDTO
    ): Promise<RegisterResponseDto> {
    return this.authService.register(body);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK) // trả 200 cho "login" (không phải create)
    login(@Body() body: LoginDTO) {
    return this.authService.login(body);
    }

    @Post('check-user')
    @HttpCode(HttpStatus.OK)
    checkUser (@Body('phone_account') phone_account: string){
        return this.authService.checkUserByPhone(phone_account);
    }

    @Post('change-password')
    @HttpCode(HttpStatus.OK)
    changePassword(@Body() dto: ChangePasswordDto){
        return this.authService.changePassword(dto.user_id, dto.new_password);
    }
}