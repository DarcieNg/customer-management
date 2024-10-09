import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

// Reference: https://medium.com/@chandantechie/understand-regular-expression-from-beginners-to-advanced-with-examples-a3f7866a5f2b
const passwordRegEx =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]{8,50}$/;

export class CreateUserDto {
    @ApiProperty({
        type: String,
        description: "Required value with at least 5 character long"
    })
    @IsString()
    @MinLength(5, { message: 'Username must be at least 5 characters' })
    @IsNotEmpty()
    username: string;

    @ApiProperty({
        type: String,
        description: "Required value with valid email address"
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        type: String,
        description: "Required value with 3 options: admin, sale personal, or sale company"
    })
    @IsString()
    @IsEnum(["admin", "sale personal", "sale company"])
    role: string;

    @ApiProperty({
        type: String,
        description: "Required value with at least 8 characters and max 50 characters, 1 uppercase, 1 lowercase, 1 number and 1 special character"
    })
    @IsNotEmpty()
    @Matches(passwordRegEx, {
        message: "Password must be at least 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 special character"
    })
    password: string;
}
