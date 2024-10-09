import { User } from "src/user/entities/user.entity";

export interface AuthenticateInterface {
    readonly user: User;
    readonly token: string;
}