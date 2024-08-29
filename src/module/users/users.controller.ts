import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto} from './dto';
import { ApiInternalServerErrorResponse, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UserRole } from 'src/common/guard/roles.enum';
import { Auth } from 'src/common/decorators/auth.decorator';

@ApiTags('users')
@Controller('users')
export default class UsersController {
  constructor(private readonly usersService: UsersService) {}

 @Post('createUser')
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  
  @Auth(UserRole.ADMIN)
  @Post(':email')
  @ApiOperation({ summary: 'Get user for email' })
  @ApiParam({ name: 'email', description: 'email user' })
  @ApiResponse({ status: 201, description: 'User found with email' })
  @ApiResponse({ status: 400, description: 'Dates invalid.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Server Error' })
  findOne(@Param('email') email: string) {
    return this.usersService.findOneByEmail(email);
  }

  @Auth(UserRole.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get user for email' })
  @ApiParam({ name: 'id', description: 'id user' })
  @ApiResponse({ status: 201, description: 'User found with id' })
  @ApiResponse({ status: 400, description: 'Dates invalid.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Server Error' })
  findById(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Patch(':id')
  @ApiResponse({ status: 201, description: 'User found with id' })
  @ApiResponse({ status: 400, description: 'Dates invalid.' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 201, description: 'User found with id' })
  @ApiResponse({ status: 400, description: 'Dates invalid.' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
