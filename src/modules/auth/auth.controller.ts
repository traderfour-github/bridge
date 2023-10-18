import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JoinDto } from './dto/join.dto';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('join')
  async join(@Body() joinDto: JoinDto) {
    const result = await this.authService.join(joinDto);
    return result;
  }
}
