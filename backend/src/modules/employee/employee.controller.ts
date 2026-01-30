import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { CreateEmployeeDTO } from './dto/created_employee';
import {EmployeeService} from './employee.service';
import { Employee } from '@prisma/client';
import { EmployeeFilterType } from './dto/employee_filter_type';
import { EmployeePaginType } from './dto/employee_pagin_type';
import { UpdatedEmployeeDTO } from './dto/updated_employee';
@Controller('employee')
export class EmployeeController {
    constructor(private employeeService: EmployeeService) {}
    @Post()
    create(@Body() body: CreateEmployeeDTO): Promise<Employee> {
        return this.employeeService.createEmployee(body);
    }

    @Get()
    getAll(@Query() params: EmployeeFilterType): Promise<EmployeePaginType> {
        return this.employeeService.getAll(params);
    }

    @Get(':id')
    getByID(@Param('id') id: string): Promise<Employee | null> {
        return this.employeeService.getByID(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() body: UpdatedEmployeeDTO): Promise<Employee> {
        return this.employeeService.updateEmployee(id, body);
    }

    @Delete(':id')
    delete (@Param('id') id:string): Promise<Employee>{
        return this.employeeService.deleteEmployee(id);
    }
}