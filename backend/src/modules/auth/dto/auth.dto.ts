import { IsEmail, IsNotEmpty, Matches, MinLength } from "class-validator";
// matches validate cho phone
export class RegisterDTO{
    @IsNotEmpty()
    @MinLength(100)
    @IsEmail()
    email_account: string;

    @MinLength(15)
    @Matches(/^[\+]?[()]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
    phone_account: string;

    @IsNotEmpty()
    @MinLength(100)
    password: string;
    
    @IsNotEmpty()
    status: string;
}

export class LoginDTO{
    @IsNotEmpty()
    @IsEmail()
    email_account: string;

    @Matches(/^[\+]?[()]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
    phone_account: string;
    
    @IsNotEmpty()
    password: string;
}