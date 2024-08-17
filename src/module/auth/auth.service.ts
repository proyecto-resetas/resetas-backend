import { HttpException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/index';
import { UsersService } from 'src/module/users/users.service';
import { HashService } from 'src/common/utils/services/hash.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashService: HashService,
    private readonly userService: UsersService,
  ){}
  
  async register(userRegister: RegisterDto): Promise<Tokens> {
    
    
    await this.validateEmailForSignUp(userRegister.email);

    const hashedPassword = await this.hashService.hash(userRegister.password);

    const user = await this.userService.create({
      email: userRegister.email,
      username: userRegister.username,
      lastname: userRegister.lastname,
      password: hashedPassword,
      city: userRegister.city,
      country: userRegister.country,
      phone: userRegister.phone,
      photoUrl: userRegister.photoUrl,
    });

    return await this.getTokens({
      sub: user.id,
    });
  }

  async validateEmailForSignUp(email: string): Promise<boolean | undefined> {
    const user = await this.userService.findOneByEmail(email);

    if (user) {
      throw new HttpException('Email already exists!', 400);
    }
    return true;
  }

}
