import { ApiProperty } from "@nestjs/swagger";
import { AfterLoad, BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Customer {
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
    @Column({ type: "varchar", length: 50 })
    name: string;

    @ApiProperty({
        type: [String],
        description: "This is required property with maximum length 50 characters"
    })
    @Column({ type: "varchar", length: 100, array: true })
    address: string[];

    @ApiProperty({
        type: String,
        description: "This is required property with 2 options: personal, company"
    })
    @Column({ type: "enum", enum: ["personal", "company"] })
    type: string;
}
    
