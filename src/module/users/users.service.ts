import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>){}
async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userModel
      .findOne({ email: createUserDto.email })
      .exec();
      if (existingUser) {
        throw new HttpException(
          `User with email ${createUserDto.email} already exists`,
          HttpStatus.BAD_REQUEST,
        );
  }
  const createdUser = new this.userModel(createUserDto);
  return createdUser.save();
}

  // findAll() {
  //   return `This action returns all users`;
  // }

async findOne(id: string) {

    return ;
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
