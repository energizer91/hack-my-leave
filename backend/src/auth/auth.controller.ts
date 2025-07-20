import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    return { userId: user._id, email: user.email };
  }

  @Post('register')
  async register(
    @Body() body: { email: string; password: string; name?: string },
  ) {
    const user = await this.authService.register(
      body.email,
      body.password,
      body.name,
    );
    return { userId: user._id, email: user.email };
  }
}
