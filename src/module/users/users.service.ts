import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto  } from './dto'
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { MyFavorite } from './entities/my-favorite.entity';
import { MyRecipes } from './entities/my-recipe.entity';
import { RecipesService } from '../recipes/recipes.service';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>,
){}

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
      throw new HttpException(`Error fetching user`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

// async findRecipesFavoriteAndCreated(nameRecipe: string){

//   try{
//     const userRecipes = await this.userModel.find()
//   } catch(error){
//       throw new HttpException(`Error fetching users`, HttpStatus.INTERNAL_SERVER_ERROR);
//   }
//   // try{
//   //   const users = await this.userModel.find({
//   //     $or: [
//   //       { favorite_recipes: { $exists: true, $not: { $size: 0 } } },
//   //       { created_recipes: { $exists: true, $not: { $size: 0 } } },
//   //     ],
//   //   }).exec();
//   //   return users;

//   // } catch(error){
//   //   throw new HttpException(`Error fetching users`, HttpStatus.INTERNAL_SERVER_ERROR);
//   // }
// } 
async remove(id: string) {

    try {
    const deleteUser = await this.userModel.findByIdAndDelete(id).exec();

    if (!deleteUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return deleteUser;

    } catch (error) {
      throw new HttpException(`Error fetching user`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
  }

  // Agregar una receta a myFavorite
  async addFavoriteRecipe(userId: string, recipe: MyFavorite): Promise<User> {
   // console.log(recipe)

    try {
      // Verificar si el usuario existe
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
      }
  
      // Verificar si el recipe ya está en la lista de favoritos
      const isAlreadyFavorite = user.myFavorite.some(
        (favorite: MyFavorite) => favorite.idRecipe === recipe.idRecipe
      );
  
      if (isAlreadyFavorite == true) {
        throw new NotFoundException(`Recipe is already in favorites`);
      }
  
      // Si no está, añadir el nuevo favorito
      const recipeSave = this.userModel
        .findByIdAndUpdate(
          userId,
          { $push: { myFavorite: recipe } },
          { new: true } // Devuelve el documento actualizado
        )
        .exec();

        return recipeSave

    } catch (error) {
      throw new HttpException(
        `Failed to add favorite recipe: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

  }

    // Agregar una receta a myFavorite
    async addMyRecipe(userId: string, recipe: MyRecipes): Promise<User> {
      return this.userModel.findByIdAndUpdate(
        userId,
        { $push: { myRecipe: recipe } },
        { new: true }
      ).exec();
    }

  // Eliminar una receta de myFavorite
  async removeFavoriteRecipe(userId: string, recipeId: string): Promise<User> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { myFavorite: { id: recipeId } } },
      { new: true }
    ).exec();
  }

  async removeMyRecipe(userId: string, recipeId: string): Promise<User> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { myRecipe: { id: recipeId } } },
      { new: true }
    ).exec();
  }
}

