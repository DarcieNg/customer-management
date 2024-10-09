import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class AuthenticateDto {
    @ApiProperty({
        type: String,
        description: "Required value with no empty value"
    })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({
        type: String,
        description: "Required value with no empty value"
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}