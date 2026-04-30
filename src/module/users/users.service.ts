import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { MyFavorite } from './entities/my-favorite.entity';
import { MyRecipes } from './entities/my-recipe.entity';
import { Recipe } from '../recipes/entities/recipes.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Recipe.name) private recipeModel: Model<Recipe>,
  ) {}

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

  async findOneByEmail(email: string) {
    try {
      const user = await this.userModel.findOne({ email }).exec();
      if (!user) {
        throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      throw new HttpException(
        `Error fetching user`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      throw new HttpException(
        `Error fetching user`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.findOneById(id);
      if (!user) {
        throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
      }
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .exec();

      if (!updatedUser) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      return updatedUser;
    } catch (error) {
      throw new HttpException(
        `Error fetching user`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string) {
    try {
      const deleteUser = await this.userModel.findByIdAndDelete(id).exec();

      if (!deleteUser) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      return deleteUser;
    } catch (error) {
      throw new HttpException(
        `Error fetching user`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Agregar una receta a myFavorite
  async addFavoriteRecipe(userId: string, recipeId: string): Promise<User> {
    try {
      // 1. Obtener la receta para el nombre
      const recipe = await this.recipeModel.findById(recipeId).exec();
      if (!recipe) {
        throw new NotFoundException(`Recipe with id ${recipeId} not found`);
      }

      // 2. Verificar si el usuario existe y si ya lo tiene en favoritos
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
      }

      const isAlreadyFavorite = user.myFavorite.some(
        (favorite: MyFavorite) => favorite.idRecipe === recipeId,
      );

      if (isAlreadyFavorite) {
        throw new HttpException(
          `Recipe is already in favorites`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // 3. Añadirlo
      return await this.userModel
        .findByIdAndUpdate(
          userId,
          {
            $push: {
              myFavorite: { idRecipe: recipeId, nameRecipe: recipe.nameRecipe },
            },
          },
          { new: true },
        )
        .exec();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to add favorite recipe: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Agregar una receta a myRecipe
  async addMyRecipe(userId: string, recipeId: string): Promise<User> {
    try {
      // 1. Obtener la receta
      const recipe = await this.recipeModel.findById(recipeId).exec();
      if (!recipe) {
        throw new NotFoundException(`Recipe with id ${recipeId} not found`);
      }

      // 2. Verificar usuario y si ya existe en la lista
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
      }

      const isAlreadyInMyRecipes = user.myRecipe.some(
        (r: MyRecipes) => r.idRecipe === recipeId,
      );

      if (isAlreadyInMyRecipes) {
        throw new HttpException(
          `Recipe is already in my recipes`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // 3. Añadir
      return await this.userModel
        .findByIdAndUpdate(
          userId,
          {
            $push: {
              myRecipe: { idRecipe: recipeId, nameRecipe: recipe.nameRecipe },
            },
          },
          { new: true },
        )
        .exec();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to add recipe to my recipes: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Eliminar una receta de myFavorite
  async removeFavoriteRecipe(userId: string, recipeId: string): Promise<User> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { myFavorite: { idRecipe: recipeId } } },
        { new: true },
      )
      .exec();
  }

  async removeMyRecipe(userId: string, recipeId: string): Promise<User> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { myRecipe: { idRecipe: recipeId } } },
        { new: true },
      )
      .exec();
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { password: hashedPassword })
      .exec();
  }
}
