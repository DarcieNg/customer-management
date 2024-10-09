import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'secrete'
        });
    }

    async validate(payload) {
        return {
            userId: payload.id,
            username: payload.username,
            email: payload.email,
            role: payload.role
        }
    }
}