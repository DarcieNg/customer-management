import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create-customer.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MinLength } from "class-validator";

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
    @ApiProperty({
        type: String,
        description: "Required value with no empty value"
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        type: String,
        description: "Required value with at least 10 characters"
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(10, { message: "The address must be at least 10 characters long." })
    address: string[];

    @ApiProperty({
        type: String,
        description: "Required value with 2 options: personal, company"
    })
    @IsString()
    @IsEnum(["personal", "company"])
    type: string;
}
