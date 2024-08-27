import { Catch, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto  } from './dto'
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

async  findOneByEmail(email: string){
      try{
       const user = await this.userModel.findOne({ email }).exec();
       if (!user) {
         throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
       }
       return user;

      } catch(error){
        throw new HttpException(`Error fetching user`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
  
  }

  async findOneByEmailRegister(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();
    if (user) {
      throw new NotFoundException(`User with email ${email} already exists`);
    }
    return user;
  }

async findOneById(id: string) {
    try{
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
      }
      return user;
    } catch(error){
      throw new HttpException(`Error fetching user`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
