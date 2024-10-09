import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './user/entities/user.entity';
import { CustomerModule } from './customer/customer.module';
import { AuthModule } from './auth/auth.module';
import { Customer } from './customer/entities/customer.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { RoleGuard } from './auth/role/role.guard';
import { AllExceptionsFilter } from './filter/all-exception.filter';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('POSTGRES_HOST'),
        port: config.get('POSTGRES_PORT'),
        username: config.get('POSTGRES_USERNAME'),
        password: config.get('POSTGRES_PASSWORD'),
        database: "customer-management",
        entities: [User, Customer],
        synchronize: true,
      })
    }),
    JwtModule.register({
      secret: 'secrete',
      signOptions: { expiresIn: '1h' }
    }),
    UserModule,
    CustomerModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter
    }
  ],
})
export class AppModule { }
