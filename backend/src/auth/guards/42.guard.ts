import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";


@Injectable()
export class Auth42Guard extends AuthGuard("42") {
    constructor() {
        super();
    }
}