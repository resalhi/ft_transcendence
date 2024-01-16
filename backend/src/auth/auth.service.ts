import { Injectable, Req, Res } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  login(@Res() res) {
    return res.redirect("https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-b2ca9139e56bb3a5942427a74bcafe6e6506ae6d8221bf05f657123cca10be73&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fauth%2Fcallback&response_type=code");
  }

  callback(@Res() res, @Req() req) {
    const user = req.user;
    if (user.isTwofactorsEnabled) {
      return res.redirect(`http://localhost:3000/twofactors?id=${user.id}`);
    } else {
      return res.redirect(`http://localhost:3000/dashboard?id=${user.id}&firstlogin=${user.firstLogin}&accesstoken=${user.accessToken}`);
    }
  }
}
