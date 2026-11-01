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
import { Notification } from '../notifications/entities/notification.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Recipe.name) private recipeModel: Model<Recipe>,
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    private readonly notificationsService: NotificationsService,
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
      const updatedUser = await this.userModel
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

      // 4. Emitir notificación en tiempo real + Push al creador de la receta
      const creatorId = recipe.createdBy
        ? String((recipe.createdBy as any)._id || recipe.createdBy)
        : null;
      if (creatorId && creatorId !== String(userId)) {
        const recipeImg = Array.isArray(recipe.imageUrl)
          ? recipe.imageUrl[0]
          : (recipe.imageUrl as unknown as string);
        await this.notificationsService.createAndEmit({
          recipientId: creatorId,
          senderId: String(userId),
          senderUsername: user.username,
          type: 'recipe_favorited',
          title: 'Tu receta recibió un favorito',
          message: `@${user.username} guardó "${recipe.nameRecipe}" en sus favoritos.`,
          recipeId: String(recipe._id),
          recipeName: recipe.nameRecipe,
          recipeImage: recipeImg,
        });
      }

      return updatedUser;
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

  // Agregar una receta a myPurchased
  async addPurchasedRecipe(
    userId: string,
    recipeId: string,
    options?: { paymentReference?: string },
  ): Promise<User> {
    try {
      const recipe = await this.recipeModel.findById(recipeId).exec();
      if (!recipe) {
        throw new NotFoundException(`Recipe with id ${recipeId} not found`);
      }

      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
      }

      const isAlreadyPurchased = user.myPurchased?.some(
        (r) => r.idRecipe === recipeId,
      );

      if (isAlreadyPurchased) {
        throw new HttpException(
          `Recipe is already in purchased list`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const purchasedItem: Record<string, any> = {
        idRecipe: recipeId,
        nameRecipe: recipe.nameRecipe,
        purchasedAt: new Date(),
      };

      if (options?.paymentReference) {
        purchasedItem.paymentReference = options.paymentReference;
      }

      return await this.userModel
        .findByIdAndUpdate(
          userId,
          {
            $push: {
              myPurchased: purchasedItem,
            },
          },
          { new: true },
        )
        .exec();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to add recipe to purchased: ${error.message}`,
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

  async removePurchasedRecipe(userId: string, recipeId: string): Promise<User> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { myPurchased: { idRecipe: recipeId } } },
        { new: true },
      )
      .exec();
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { password: hashedPassword })
      .exec();
  }

  async findAllUsers() {
    return this.userModel
      .find()
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateUserRole(userId: string, role: string) {
    const allowedRoles = ['user', 'admin', 'super_admin'];
    if (!allowedRoles.includes(role)) {
      throw new HttpException(
        `Invalid role "${role}". Allowed: user, admin, super_admin`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const updated = await this.userModel
      .findByIdAndUpdate(userId, { role }, { new: true })
      .select('-password')
      .exec();
    if (!updated) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    return updated;
  }

  async cleanupDeletedRecipeReferences(recipeId: string): Promise<void> {
    await this.userModel
      .updateMany(
        {},
        {
          $pull: {
            myFavorite: { idRecipe: recipeId },
            myRecipe: { idRecipe: recipeId },
          },
        },
      )
      .exec();
  }

  async getAdminDashboardStats() {
    const [allUsers, allRecipes, purchaseNotifications] = await Promise.all([
      this.userModel.find().select('-password').sort({ createdAt: -1 }).exec(),
      this.recipeModel
        .find()
        .select('-steps -ingredientsRecipe -utensilRecipe')
        .populate('createdBy', 'username lastname email')
        .sort({ createdAt: -1 })
        .exec(),
      this.notificationModel
        .find({ type: { $in: ['purchase_confirmed', 'recipe_gift'] } })
        .sort({ createdAt: -1 })
        .limit(100)
        .exec(),
    ]);

    const totalUsers = allUsers.length;
    const totalChefs = allUsers.filter((u) => u.role === 'admin').length;
    const totalSuperAdmins = allUsers.filter(
      (u) => u.role === 'super_admin',
    ).length;
    const totalRegularUsers = allUsers.filter((u) => u.role === 'user').length;
    const totalRecipes = allRecipes.length;

    const recipeMap = new Map<string, any>();
    for (const r of allRecipes) {
      recipeMap.set(String(r._id), r);
    }

    const userMap = new Map<string, any>();
    for (const u of allUsers) {
      userMap.set(String(u._id), u);
    }

    const giftNotificationsByRecipeAndRecipient = new Map<string, any>();
    for (const n of purchaseNotifications) {
      if (n.type === 'recipe_gift' && n.recipeId) {
        giftNotificationsByRecipeAndRecipient.set(
          `${n.recipientId}_${n.recipeId}`,
          n,
        );
      }
    }

    const transactions: any[] = [];
    let totalSalesCount = 0;
    let totalGiftsCount = 0;
    let totalRevenue = 0;

    for (const u of allUsers) {
      const purchasedList = u.myPurchased || [];
      for (const p of purchasedList) {
        const recipe = recipeMap.get(String(p.idRecipe));
        const price = Number(recipe?.price ?? 0);
        const giftNotif = giftNotificationsByRecipeAndRecipient.get(
          `${String(u._id)}_${String(p.idRecipe)}`,
        );
        const isGift = Boolean(giftNotif);

        totalSalesCount += 1;
        if (isGift) totalGiftsCount += 1;
        totalRevenue += price;

        const creatorObj = recipe?.createdBy as any;
        const chefName = creatorObj?.username
          ? `${creatorObj.username} ${creatorObj.lastname || ''}`.trim()
          : 'Chef Recetarium';

        const imageUrl = Array.isArray(recipe?.imageUrl)
          ? recipe.imageUrl[0]
          : recipe?.imageUrl || '';

        transactions.push({
          id: `${u._id}_${p.idRecipe}`,
          recipeId: p.idRecipe,
          recipeName: p.nameRecipe || recipe?.nameRecipe || 'Receta',
          recipeImage: imageUrl,
          chefName,
          buyerUsername: isGift
            ? giftNotif.senderUsername || u.username
            : u.username,
          buyerEmail: u.email,
          recipientEmail: isGift ? u.email : null,
          isGift,
          amount: price,
          paymentReference: p.paymentReference || null,
          purchasedAt: p.purchasedAt || (u as any).updatedAt || new Date(),
        });
      }
    }

    transactions.sort(
      (a, b) =>
        new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime(),
    );

    return {
      totalUsers,
      totalChefs,
      totalRegularUsers,
      totalSuperAdmins,
      totalRecipes,
      totalSalesCount,
      totalGiftsCount,
      totalRevenue,
      recentTransactions: transactions.slice(0, 60),
    };
  }
}
