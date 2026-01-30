import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Employee } from '@prisma/client';
import { Prisma } from 'generated/prisma/browser';
import { PrismaService } from 'src/prisma.service';
import { CreateEmployeeDTO } from './dto/created_employee';
import { hash } from 'bcrypt';
import { EmployeeFilterType } from './dto/employee_filter_type';
import { EmployeePaginType } from './dto/employee_pagin_type';
import { UpdatedEmployeeDTO } from './dto/updated_employee';

@Injectable()
export class EmployeeService {
    constructor(private prismaService: PrismaService) {}
    async createEmployee(body: CreateEmployeeDTO): Promise<Employee> {
        // checking email or phone exist
        const emailAccount = await this.prismaService.employee.findUnique({
            where: { email_account: body.email_account.trim().toLowerCase() },
        })
        if (emailAccount) {
            throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
        }

        const phoneAccount = await this.prismaService.employee.findUnique({
            where: { phone_account: body.phone_account.trim() },
        })
        if (phoneAccount) {
            throw new HttpException('Phone number already exists', HttpStatus.BAD_REQUEST);
        }

        const passwordHash = await hash(body.password, 10);
        const result = await this.prismaService.employee.create({
            data: {
                ...body,
                email_account: body.email_account.trim().toLowerCase(),
                phone_account: body.phone_account.trim(),
                password: passwordHash,
            },
        });
        return result;
        
    
    }
    async getAll(filter: EmployeeFilterType): Promise<EmployeePaginType> {
        const items_per_page = Number(filter.items_per_pages) || 10;
        const page = Number(filter.page) || 1;
        const search = filter.search ? filter.search.trim() : '';

        const skip = page > 1 ? (page - 1) * items_per_page : 0;
        const employee = await this.prismaService.employee.findMany({
            take: items_per_page,
            skip,
            where: {
                OR: [
                    {
                        email_account: { contains: search, mode: 'insensitive'

                        }
                    },
                    {
                        phone_account: {contains: search, mode: 'insensitive' }
                    },
                    {
                        employee_name: {contains: search, mode: 'insensitive' }
                    }
                ],
                AND: [
                    {
                        status: { not: 'Đã nghỉ việc'}
                    }
                ]
            },
            orderBy: {
                created_at: 'desc'
            }
        })
        const total_items = await this.prismaService.employee.count({
                        where: {
                OR: [
                    {
                        email_account: { contains: search, mode: 'insensitive'

                        }
                    },
                    {
                        phone_account: {contains: search, mode: 'insensitive' }
                    },
                    {
                        employee_name: {contains: search, mode: 'insensitive' }
                    }
                ],
                AND: [
                    {
                        status: { not: 'Đã nghỉ việc'}
                    }
                ]
            },
            
        })
        return {
            data: employee,
            total_items,
            current_page: page,
            items_per_page 
        }
    }
    async getByID(id: string): Promise<Employee | null> {
        return this.prismaService.employee.findFirst({
            where: {
                id
            }
        })
    }
    async updateEmployee(id: string, data: UpdatedEmployeeDTO): Promise<Employee> {
        return await this.prismaService.employee.update({
            where: {id},
            data
        })
    }
    async deleteEmployee(id: string): Promise<Employee> {
        return await this.prismaService.employee.delete({
            where: {id}
        })
    }
}

