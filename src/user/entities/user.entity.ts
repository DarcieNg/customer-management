import { ApiProperty } from "@nestjs/swagger";
import { Role } from "src/enum/roles.enum";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @ApiProperty({
        type: Number,
        description: "This is auto-generated property"
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        type: String,
        description: "This is required property with maximum length 50 characters"
    })
    @Column({ type: "varchar", length: 50, unique: true })
    username: string;

    @ApiProperty({
        type: String,
        description: "This is required property with maximum length 50 characters"
    })
    @Column({ type: "varchar", length: 50, unique: true })
    email: string;

    @ApiProperty({
        type: String,
        description: "\
        This is required property with at least 8 characters and maximum length 50 characters.\
        The password must contains at least 1 uppercase, 1 lower case, 1 special character and 1 number.\
        "
    })
    @Column({ type: "varchar", length: 50 })
    password: string;

    @ApiProperty({
        type: String,
        description: "This is required property with 3 option values: admin, sale personal and sale company."
    })
    @Column({ type: "enum", enum: Role })
    role: string;
}
