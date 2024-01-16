import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Auth42Guard } from './guards/42.guard';

@Controller('auth')
export class AuthController {
  constructor(private authServices: AuthService) {}

  @Get('login')
  async login(@Res() res) {
    console.log("🚀 ~ file: auth.controller.ts:11 ~ AuthController ~ login ")
    return this.authServices.login(res);
  }

  @UseGuards(Auth42Guard)
  @Get('callback')
  async callback(@Res() res, @Req() req) {
    return this.authServices.callback(res, req);
  }
}
