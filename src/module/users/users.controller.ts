import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto} from './dto';
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from 'src/common/guard/roles.enum';
import { JwtAuthGuard } from 'src/common/guard/jwt.guard';
import { UserRoleGuard } from 'src/common/guard/role.guard';
import { Roles } from 'src/common/decorators/roleGuard.decorator';
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

  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }
  
  @Auth(UserRole.ADMIN)
  @Post(':email')
  @ApiParam({ name: 'email', description: 'email user' })
  @ApiResponse({ status: 201, description: 'User found with email' })
  @ApiResponse({ status: 400, description: 'Dates invalid.' })
  findOne(@Param('email') email: string) {
    return this.usersService.findOneByEmail(email);
  }

  @Auth(UserRole.ADMIN)
  @Get(':id')
  @ApiResponse({ status: 201, description: 'User found with id' })
  @ApiResponse({ status: 400, description: 'Dates invalid.' })
  findById(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
