import { PrismaService } from "src/prisma.service";
import { RegisterDTO } from "./dto/auth.dto";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { hash, compare } from "bcrypt";
import { Employee } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import { generateCode } from "src/common/utils/generate-code.util";

@Injectable() // => class này là server và NestJS có quyền quản lý nó 
export class AuthService {
    constructor (private prismaService: PrismaService, private jwtService: JwtService) {}

    async register(userData: RegisterDTO): Promise<Employee> {
      const email = userData.email_account.trim().toLowerCase();
      const phone = userData.phone_account.trim();

      // 1) check unique email/phone trước (ngoài tx cho nhẹ)
      const existing = await this.prismaService.employee.findFirst({
        where: { OR: [{ email_account: email }, { phone_account: phone }] },
        select: { id: true },
      });
      if (existing) {
        throw new HttpException('Email or phone number already exists', HttpStatus.BAD_REQUEST);
      }

      const passwordHash = await hash(userData.password, 10);

      // 2) tạo user + gán emp_code trong transaction để giảm race condition
      const createdUser = await this.prismaService.$transaction(async (tx) => {
        const lastEmp = await tx.employee.findFirst({
          where: { emp_code: { not: null, startsWith: 'EC_' } },
          orderBy: { emp_code: 'desc' },
          select: { emp_code: true },
        });

        let nextNumber = 1;
        const last = lastEmp?.emp_code;
        if (last) {
          const m = last.match(/^EC_(\d+)$/);
          if (m) nextNumber = Number(m[1]) + 1;
        }

        const empCode = generateCode('EC', nextNumber);

        return tx.employee.create({
          data: {
            emp_code: empCode, 
            email_account: email,
            phone_account: phone,
            password: passwordHash,
            status: userData.status ?? 'Active',
            is_active: true,
          },
        });
      });

      return createdUser;
    }

async login(userData: { phone_account: string; password: string }) {
  const phone = userData.phone_account.trim();

  const user = await this.prismaService.employee.findUnique({
    where: { phone_account: phone },
    include: { roles: { include: { role: true } } }, // nếu bạn cần roles
  });

  if (!user) throw new HttpException('Phone number does not exist', HttpStatus.UNAUTHORIZED);

  const ok = await compare(userData.password, user.password);
  if (!ok) throw new HttpException('Password is incorrect', HttpStatus.UNAUTHORIZED);

  const roles = user.roles?.map((x) => x.role?.name_role).filter(Boolean) ?? [];
  const payload = { id: user.id, phone_account: user.phone_account, roles };

  const accessToken = await this.jwtService.signAsync(payload, {
    secret: process.env.ACCESS_TOKEN_SECRET,
    expiresIn: '1h',
  });

  const refreshToken = await this.jwtService.signAsync(payload, {
    secret: process.env.REFRESH_TOKEN_SECRET,
    expiresIn: '7d',
  });

  // ❗ bỏ password trước khi trả về
  const { password, ...safeUser } = user;

  return {
    accessToken,
    refreshToken,
    user: safeUser,
  };
}

async checkUserByPhone (phoneAccount: string){
  const employee = await this.prismaService.employee.findFirst({
    where: {
      phone_account: phoneAccount,
    },
    select: {
      id: true, employee_name: true
    }
    
  })
  if(!employee){
    throw new HttpException('User not found with this phone number', HttpStatus.BAD_REQUEST);
  }

  return {
    message: 'User found',
    data: {
      id: employee.id,
      name: employee.employee_name
    }
  }
}

async changePassword (userId: string, newPassword: string){
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(newPassword, salt);
  await this.prismaService.employee.update({
    where: {id: userId},
    data: {
      password: hashPassword
    }
  })
  return { message: 'Password changed successfully' };
}
}