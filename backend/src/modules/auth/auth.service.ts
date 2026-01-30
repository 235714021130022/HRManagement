import { PrismaService } from "src/prisma.service";
import { RegisterDTO } from "./dto/auth.dto";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { hash, compare } from "bcrypt";
import { Employee } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";

@Injectable() // => class này là server và NestJS có quyền quản lý nó 
export class AuthService {
    constructor (private prismaService: PrismaService, private jwtService: JwtService) {}
async register(userData: RegisterDTO): Promise<Employee> {
  const email = userData.email_account.trim().toLowerCase();
  const phone = userData.phone_account.trim();

  const existing = await this.prismaService.employee.findFirst({
    where: { OR: [{ email_account: email }, { phone_account: phone }] },
  });
  if (existing) {
    throw new HttpException('Email or phone number already exists', HttpStatus.BAD_REQUEST);
  }

  const passwordHash = await hash(userData.password, 10);

  const createdUser = await this.prismaService.employee.create({
    data: {
      email_account: email,
      phone_account: phone,
      password: passwordHash,
      status: userData.status ?? 'Đang hoạt động',
    },
  });

  return createdUser; // ✅ đúng kiểu Employee
}

async login(userData: { email_account: string; password: string }): Promise<any> {
  const email = userData.email_account.trim().toLowerCase();

  const user = await this.prismaService.employee.findUnique({
    where: { email_account: email },
  });
  if (!user) throw new HttpException('Email does not exist', HttpStatus.UNAUTHORIZED);

  const ok = await compare(userData.password, user.password);
  if (!ok) throw new HttpException('Password is incorrect', HttpStatus.UNAUTHORIZED);

  const payload = { id: user.id, email_account: user.email_account };

  return {
    accessToken: await this.jwtService.signAsync(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: '1h',
    }),
    refreshToken: await this.jwtService.signAsync(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: '7d',
    }),
  };
}
}