import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { InforcompanyModule } from './modules/inforcompany/inforcompany.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    AuthModule,
    PrismaModule,
    EmployeeModule,
    InforcompanyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
