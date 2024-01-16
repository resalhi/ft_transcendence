import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthJwtGuard } from 'src/auth/guards/jwt.guard';
import { UpdateUserDto } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private userServices: UserService) {}

  @Post('verify2f-login')
  async verify2fLogin(@Req() req) {
    return this.userServices.verify2fLogin(req.body.id, req.body.token);
  }

  @UseGuards(AuthJwtGuard)
  @Get('me')
  async getMe(@Req() req) {
    return this.userServices.getMe(req.user.id);
  }

  @UseGuards(AuthJwtGuard)
  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.userServices.getUser(id);
  }

  @UseGuards(AuthJwtGuard)
  @Post('enable2fa')
  async enable2fa(@Req() req) {
    return this.userServices.enable2fa(req.user);
  }

  @UseGuards(AuthJwtGuard)
  @Post('disable2fa')
  async disable2fa(@Req() req) {
    return this.userServices.disable2fa(req.user);
  }

  @UseGuards(AuthJwtGuard)
  @Post('verify2fa')
  async verify2fa(@Req() req) {
    return this.userServices.verify2fa(req.user, req.body.token);
  }

  @UseGuards(AuthJwtGuard)
  @Put('update')
  async updateUser(@Body() updatedUser: UpdateUserDto, @Req() req) {
    return this.userServices.updateUser(updatedUser, req.user);
  }
}
