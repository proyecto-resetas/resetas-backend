import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import UsersController from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { RolesModule } from '../roles/roles.module';
import { Recipe, RecipeSchema } from '../recipes/entities/recipes.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Recipe.name, schema: RecipeSchema },
    ]),
    RolesModule,
  ],
  controllers: [UsersController],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
