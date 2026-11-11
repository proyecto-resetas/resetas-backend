import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { PurchaseRecipeDto } from './dto/purchase-recipe.dto';
import { SearchByIngredientsDto } from './dto/search-by-ingredients.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Recipe } from './entities/recipes.entity';
import { Model, Types } from 'mongoose';
import { GetRecipesQueryDto } from './dto/get-recipe-query.dto';
import { UserService } from '../users/users.service';
import { StepsService } from '../steps/steps.service';
import { OllamaService } from '../ollama/ollama.service';
import { AIService, AIProvider } from '../ai';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class RecipesService {
  constructor(
    @InjectModel(Recipe.name) private recipeModel: Model<Recipe>,
    private readonly stepService: StepsService,
    private readonly userService: UserService,
    private readonly ollamaService: OllamaService,
    private readonly aiService: AIService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Analiza una imagen de receta usando el prompt estructurado para obtener un objeto JSON listo para guardar.
   */
  async analyzeRecipeImage(
    file: Express.Multer.File,
    promptName?: string,
    provider?: AIProvider,
  ): Promise<any> {
    const finalPrompt = this.aiService.getPrompt(promptName);

    const rawResponse = await this.aiService.analyzeImage(file, finalPrompt, {
      provider,
    });

    // Limpia y parsea el JSON de la IA
    return this.aiService.parseJSONResponse(rawResponse);
  }

  /**
   * Analiza y organiza un texto libre de receta usando IA para obtener un objeto JSON estructurado.
   */
  async analyzeRecipeText(
    text: string,
    provider?: AIProvider,
  ): Promise<any> {
    const basePrompt = this.aiService.getPrompt('RECIPE_TEXT_ANALYSIS');
    const fullPrompt = `${basePrompt}\n\n<recipe_text>\n${text}\n</recipe_text>`;

    const response = await this.aiService.generateResponse(fullPrompt, {
      provider,
    });

    return this.aiService.parseJSONResponse(response.text);
  }

  /**
   * Analiza una imagen de receta y la guarda automáticamente en la base de datos.
   */
  async analyzeAndCreateRecipe(
    file: Express.Multer.File,
    userId: string,
    prompt?: string,
    provider?: AIProvider,
  ): Promise<Recipe> {
    // 1. Analizamos la imagen para obtener el objeto JSON
    const recipeData = await this.analyzeRecipeImage(file, prompt, provider);

    // 2. Usamos el método create existente para guardarla
    return await this.create(recipeData as CreateRecipeDto, userId);
  }

  async create(
    createRecipeDto: CreateRecipeDto,
    userId: string,
  ): Promise<Recipe> {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const savedSteps = await this.stepService.createMultipleSteps(
      createRecipeDto.steps,
    );
    const stepIds = savedSteps.map(
      (s) => (s as unknown as { _id: Types.ObjectId })._id,
    );

    const recipeCreate = new this.recipeModel({
      ...createRecipeDto,
      createdBy: user._id,
      steps: stepIds,
    });

    const saved = await recipeCreate.save();

    const recipe =  this.recipeModel
      .findById(saved._id)
      .populate('steps')
      .exec() as Promise<Recipe>;

    return recipe;
  }

  async findAll() {
    try {
      const recipes = await this.recipeModel
        .find()
        .select('-steps -ingredientsRecipe -utensilRecipe')
        .populate('createdBy', 'username lastname')
        .exec();
      if (!recipes) {
        throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
      }
      return recipes;
    } catch (error) {
      throw new HttpException(
        `Error fetching user`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findRecipesCategory(
    filterDto: GetRecipesQueryDto,
  ): Promise<{ recipes: Recipe[]; total: number }> {
    const { name, category, createdBy, level, page, limit } = filterDto;

    const filters: any = {};

    if (name) {
      const rawTerms = name
        .split(',')
        .map((t) => normalizeCulinaryText(t))
        .filter(Boolean);

      const patterns = rawTerms.flatMap((term) =>
        getWordVariants(term).map((v) => buildAccentInsensitiveRegexPattern(v)),
      );

      if (patterns.length > 0) {
        const combinedRegex = patterns.join('|');
        filters.$or = [
          { nameRecipe: { $regex: combinedRegex, $options: 'i' } },
          {
            'ingredientsRecipe.description': {
              $regex: combinedRegex,
              $options: 'i',
            },
          },
        ];
      }
    }
    if (category) filters.category = category;
    if (createdBy) filters.createdBy = createdBy;
    if (level) filters.level = level;

    const skip = (page - 1) * limit;

    const [recipes, total] = await Promise.all([
      this.recipeModel
        .find(filters)
        .select('-steps -ingredientsRecipe -utensilRecipe')
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'username lastname')
        .exec(),
      this.recipeModel.countDocuments(filters).exec(),
    ]);

    return { recipes, total };
  }

  // async findRecipesFavorite(userId: string, page = 1, limit = 10) {
  //   // Verificar si el usuario existe
  //   const user = await this.userService.findOneById(userId);
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   // Extraer los IDs de las recetas favoritas del usuario
  //   const favoriteRecipeIds = user.myFavorite.map(fav => fav.idRecipe);

  //   if (favoriteRecipeIds.length === 0) {
  //     return { recipes: [], total: 0 };
  //   }

  //   // Aplicar paginación
  //   const skip = (page - 1) * limit;

  //   // Consultar las recetas favoritas
  //   const [recipes, total] = await Promise.all([
  //     this.recipeModel
  //       .find({ _id: { $in: favoriteRecipeIds } })
  //       .skip(skip)
  //       .limit(limit)
  //       .exec(),
  //     this.recipeModel.countDocuments({ _id: { $in: favoriteRecipeIds } }).exec(),
  //   ]);

  //   return { recipes, total };
  // }

  async findRecipesProperty(
    userId: string,
    query: { type: 'favorite' | 'myRecipes' | 'purchased' | 'created' },
    page: number,
    limit: number,
  ) {
    const { type } = query;

    // Verificar si el usuario existe
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Determinar la propiedad a consultar o el filtro
    let recipeIds: string[] = [];
    let filters: any = {};

    if (type === 'favorite') {
      recipeIds = user.myFavorite.map((fav) => fav.idRecipe);
      filters = { _id: { $in: recipeIds } };
    } else if (type === 'myRecipes') {
      recipeIds = user.myRecipe.map((recipe) => recipe.idRecipe);
      filters = { _id: { $in: recipeIds } };
    } else if (type === 'purchased') {
      recipeIds = user.myPurchased?.map((recipe) => recipe.idRecipe) || [];
      filters = { _id: { $in: recipeIds } };
    } else if (type === 'created') {
      filters = { createdBy: new Types.ObjectId(userId) };
    } else {
      throw new NotFoundException(
        'Invalid query parameter. Allowed values are "favorite", "myRecipes", "purchased" or "created".',
      );
    }

    if (type !== 'created' && recipeIds.length === 0) {
      return [];
    }

    // Aplicar paginación
    const skip = (page - 1) * limit;

    // Consultar las recetas según la propiedad seleccionada
    const recipes = await this.recipeModel
      .find(filters)
      .select('-steps -ingredientsRecipe -utensilRecipe')
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'username lastname')
      .exec();

    return recipes;
  }

  async findOneById(id: string) {
    try {
      const recipe = await this.recipeModel
        .findById(id)
        .populate('steps')
        .exec();
      if (!recipe) {
        throw new HttpException(`Recipe not found`, HttpStatus.NOT_FOUND);
      }
      return recipe;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error fetching recipe`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOneByIdForUser(id: string, userId?: string, userRole?: string) {
    try {
      const recipe = await this.recipeModel
        .findById(id)
        .populate('createdBy', 'username lastname')
        .populate('steps')
        .exec();
      if (!recipe) {
        throw new HttpException(`Recipe not found`, HttpStatus.NOT_FOUND);
      }

      const isFreeRecipe = Number(recipe.price ?? 0) <= 0;
      const creatorId = String(
        (recipe.createdBy as any)?._id || recipe.createdBy || '',
      );
      const isCreator = Boolean(userId) && creatorId === String(userId);
      const isSuperAdmin = userRole === 'super_admin';

      let isPurchased = false;
      if (userId && !isFreeRecipe && !isCreator && !isSuperAdmin) {
        try {
          const user = await this.userService.findOneById(userId);
          isPurchased = Boolean(
            user?.myPurchased?.some(
              (r) => String(r.idRecipe) === String(id),
            ),
          );
        } catch {
          isPurchased = false;
        }
      }

      if (!isFreeRecipe && !isCreator && !isSuperAdmin && !isPurchased) {
        const recipeObj = recipe.toObject();
        recipeObj.steps = [];
        return recipeObj;
      }

      return recipe;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error fetching recipe`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtiene una receta por su ID, la almacena en la lista de recetas compradas (myPurchased)
   * del usuario autenticado y retorna la receta completa con sus pasos.
   * Preparado para escalar con pasarela de pagos y envío de regalo por email en el futuro.
   */
  async purchaseRecipe(
    userId: string,
    recipeId: string,
    purchaseDto?: PurchaseRecipeDto,
  ) {
    const recipe = await this.findOneById(recipeId);
    const buyer = await this.userService.findOneById(userId);
    const buyerUsername = buyer?.username || 'Un usuario';

    // Si es un regalo para otro usuario por email, desbloquear al destinatario
    let targetUserId = userId;
    if (purchaseDto?.recipientEmail?.trim()) {
      try {
        const recipientUser = await this.userService.findOneByEmail(
          purchaseDto.recipientEmail.trim(),
        );
        if (recipientUser && recipientUser._id) {
          targetUserId = String(recipientUser._id);
        }
      } catch {
        // Si el correo no existe, se asigna al comprador
      }
    }

    await this.userService.addPurchasedRecipe(targetUserId, recipeId, {
      paymentReference: purchaseDto?.paymentReference,
    });

    const recipeImg = Array.isArray(recipe.imageUrl)
      ? recipe.imageUrl[0]
      : (recipe.imageUrl as unknown as string);

    // 1. Si fue regalo para otro usuario, notificar al destinatario en tiempo real + Push
    if (targetUserId !== userId) {
      await this.notificationsService.createAndEmit({
        recipientId: targetUserId,
        senderId: userId,
        senderUsername: buyerUsername,
        type: 'recipe_gift',
        title: '¡Te regalaron una receta!',
        message: `@${buyerUsername} te envió "${recipe.nameRecipe}". ¡El paso a paso ya está desbloqueado!`,
        recipeId: String(recipe._id),
        recipeName: recipe.nameRecipe,
        recipeImage: recipeImg,
        amount: recipe.price,
      });
    }

    // 2. Notificar confirmación de compra al comprador
    await this.notificationsService.createAndEmit({
      recipientId: userId,
      senderId: userId,
      senderUsername: buyerUsername,
      type: 'purchase_confirmed',
      title: 'Compra exitosa',
      message:
        targetUserId !== userId
          ? `Enviaste "${recipe.nameRecipe}" como regalo exitosamente.`
          : `Desbloqueaste "${recipe.nameRecipe}" en tus recetas compradas.`,
      recipeId: String(recipe._id),
      recipeName: recipe.nameRecipe,
      recipeImage: recipeImg,
      amount: recipe.price,
    });

    // 3. Notificar al autor/chef de la receta que vendió su receta
    const creatorId = recipe.createdBy
      ? String((recipe.createdBy as any)._id || recipe.createdBy)
      : null;

    if (creatorId && creatorId !== userId) {
      await this.notificationsService.createAndEmit({
        recipientId: creatorId,
        senderId: userId,
        senderUsername: buyerUsername,
        type: 'recipe_sold',
        title: '¡Vendiste una receta!',
        message: `@${buyerUsername} compró tu receta "${recipe.nameRecipe}" por $${recipe.price}`,
        recipeId: String(recipe._id),
        recipeName: recipe.nameRecipe,
        recipeImage: recipeImg,
        amount: recipe.price,
      });
    }

    return {
      message: 'Recipe purchased and added to your purchased list successfully',
      success: true,
      recipe,
    };
  }

  async findIngredientsAndUtensils(id: string) {
    try {
      const recipe = await this.recipeModel
        .findById(id)
        .select('ingredientsRecipe utensilRecipe')
        .exec();
      if (!recipe) {
        throw new HttpException(`Recipe not found`, HttpStatus.NOT_FOUND);
      }
      return {
        ingredientsRecipe: recipe.ingredientsRecipe,
        utensilRecipe: recipe.utensilRecipe,
      };
    } catch (error) {
      throw new HttpException(
        `Error fetching ingredients and utensils`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: string,
    updateRecipeDto,
    userId?: string,
    userRole?: string,
  ) {
    try {
      const recipe = await this.recipeModel.findById(id).exec();
      if (!recipe) {
        throw new HttpException(`Recipe not found`, HttpStatus.NOT_FOUND);
      }

      const creatorId = String(
        (recipe.createdBy as any)?._id || recipe.createdBy || '',
      );
      if (
        userRole !== 'super_admin' &&
        (!userId || creatorId !== String(userId))
      ) {
        throw new ForbiddenException(
          'No tienes permiso para editar una receta de otro chef.',
        );
      }

      const updatePayload: Record<string, any> = { ...updateRecipeDto };
      delete updatePayload._id;
      delete updatePayload.createdBy;

      if (Array.isArray(updateRecipeDto?.steps)) {
        if (recipe.steps && recipe.steps.length > 0) {
          await this.stepService.removeManyByIds(recipe.steps);
        }
        const cleanSteps = updateRecipeDto.steps.map((s: any) => ({
          description: s.description,
          time: s.time,
          timeScreen: s.timeScreen,
        }));
        const savedSteps =
          await this.stepService.createMultipleSteps(cleanSteps);
        updatePayload.steps = savedSteps.map(
          (s) => (s as unknown as { _id: Types.ObjectId })._id,
        );
      }

      const updatedRecipe = await this.recipeModel
        .findByIdAndUpdate(id, updatePayload, { new: true })
        .populate('steps')
        .exec();

      if (!updatedRecipe) {
        throw new NotFoundException(`recipe with id ${id} not found`);
      }
      return updatedRecipe;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error fetching recipe`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // async update(nameRecipe: string, updateRecetaDto: UpdateRecetaDto) {
  //   try {
  //     const user = await this.userModel.findOne(nameRecipe).exec();
  //   if (!user) {
  //       throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
  //     }
  //     const updatedUser = await this.userModel
  //     .findByIdAndUpdate(id, updateUserDto, { new: true })
  //     .exec();

  //   if (!updatedUser) {
  //     throw new NotFoundException(`User with id ${id} not found`);
  //   }

  //     return updatedUser;

  //   } catch (error) {
  //     throw new HttpException(`Error fetching user`, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  async remove(id: string) {
    const recipe = await this.recipeModel.findById(id).exec();
    if (!recipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }

    // 1. Eliminar los pasos asociados en la colección Step
    if (recipe.steps && recipe.steps.length > 0) {
      await this.stepService.removeManyByIds(recipe.steps);
    }

    // 2. Limpiar referencias en myFavorite y myRecipe de los usuarios
    await this.userService.cleanupDeletedRecipeReferences(id);

    // 3. Eliminar la receta de MongoDB
    await this.recipeModel.findByIdAndDelete(id).exec();

    return {
      message: 'Recipe deleted successfully',
      success: true,
      id,
    };
  }

  /**
   * Busca y clasifica recetas según una lista de ingredientes proporcionados por el usuario.
   * Calcula porcentaje de coincidencia, ingredientes presentes e ingredientes faltantes.
   */
  async searchByIngredients(dto: SearchByIngredientsDto) {
    try {
      const userIngredientsClean = (dto.ingredients || [])
        .map((i) => normalizeCulinaryText(i))
        .filter((i) => i.length > 0);

      if (userIngredientsClean.length === 0) {
        return { recipes: [], total: 0, page: 1, totalPages: 0 };
      }

      const userTermsWithVariants = userIngredientsClean.map((term) => ({
        original: term,
        variants: getWordVariants(term),
      }));

      // Extraer todas las variantes para el filtro inicial en MongoDB
      const allVariantPatterns = userTermsWithVariants.flatMap(
        (t) => t.variants,
      );
      const escapedPatterns = allVariantPatterns.map((p) =>
        buildAccentInsensitiveRegexPattern(p),
      );

      const queryConditions: any = {
        $or: escapedPatterns.map((pat) => ({
          'ingredientsRecipe.description': { $regex: pat, $options: 'i' },
        })),
      };

      if (dto.category) {
        queryConditions.category = dto.category;
      }
      if (dto.level) {
        queryConditions.level = dto.level;
      }

      // Buscar candidatos en MongoDB
      const candidateRecipes = await this.recipeModel
        .find(queryConditions)
        .populate('createdBy', 'username lastname')
        .exec();

      if (!candidateRecipes || candidateRecipes.length === 0) {
        return { recipes: [], total: 0, page: 1, totalPages: 0 };
      }

      const scoredRecipes = candidateRecipes
        .map((recipe) => {
          const recipeIngredients = recipe.ingredientsRecipe || [];
          if (recipeIngredients.length === 0) return null;

          const matched: any[] = [];
          const missing: any[] = [];
          let stapleMissingCount = 0;
          const matchedUserTagsSet = new Set<string>();

          for (const ing of recipeIngredients) {
            const descNormalized = normalizeCulinaryText(ing.description);

            // Verificar si este ingrediente de la receta coincide con algún término del usuario
            let isMatched = false;
            for (const item of userTermsWithVariants) {
              const matchedItem = item.variants.some((variant) => {
                const escapedVariant = variant.replace(
                  /[.*+?^${}()|[\]\\]/g,
                  '\\$&',
                );
                const regex = new RegExp(
                  `(^|\\s|[.,;])${escapedVariant}($|\\s|[.,;])`,
                  'i',
                );
                return (
                  regex.test(descNormalized) ||
                  descNormalized.includes(variant)
                );
              });
              if (matchedItem) {
                isMatched = true;
                matchedUserTagsSet.add(item.original);
              }
            }

            const isStaple = isStapleIngredient(descNormalized);

            if (isMatched) {
              matched.push({
                description: ing.description,
                amount: ing.amount,
                isStaple,
              });
            } else {
              if (isStaple) stapleMissingCount++;
              missing.push({
                description: ing.description,
                amount: ing.amount,
                isStaple,
              });
            }
          }

          const totalCount = recipeIngredients.length;
          const matchedCount = matched.length;
          const missingCount = missing.length;

          // Si el usuario configuró excludeStaplesFromMissing (por defecto true),
          // los ingredientes básicos comunes (sal, agua, aceite) no suman a los faltantes reales
          const effectiveMissingCount =
            dto.excludeStaplesFromMissing !== false
              ? Math.max(0, missingCount - stapleMissingCount)
              : missingCount;

          const matchPercentage = Math.round((matchedCount / totalCount) * 100);

          // Filtro por porcentaje mínimo
          if (
            dto.minMatchPercentage !== undefined &&
            matchPercentage < dto.minMatchPercentage
          ) {
            return null;
          }

          // Filtro por máximo de ingredientes faltantes permitidos
          if (
            dto.maxMissingIngredients !== undefined &&
            effectiveMissingCount > dto.maxMissingIngredients
          ) {
            return null;
          }

          const recipeObj = recipe.toObject
            ? recipe.toObject()
            : { ...recipe };
          delete recipeObj.steps;

          return {
            ...recipeObj,
            totalIngredientsCount: totalCount,
            matchedIngredientsCount: matchedCount,
            matchedUserTagsCount: matchedUserTagsSet.size,
            missingIngredientsCount: missingCount,
            effectiveMissingCount,
            matchPercentage,
            matchedIngredients: matched,
            missingIngredients: missing,
          };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null);

      // Ordenar por compatibilidad:
      // 1. Mayor cantidad de tags/ingredientes buscados presentes en la receta
      // 2. Menos ingredientes faltantes reales (0 faltantes primero)
      // 3. Mayor porcentaje de coincidencia
      // 4. Mayor cantidad de ingredientes que coinciden
      scoredRecipes.sort((a, b) => {
        if (b.matchedUserTagsCount !== a.matchedUserTagsCount) {
          return b.matchedUserTagsCount - a.matchedUserTagsCount;
        }
        if (a.effectiveMissingCount !== b.effectiveMissingCount) {
          return a.effectiveMissingCount - b.effectiveMissingCount;
        }
        if (b.matchPercentage !== a.matchPercentage) {
          return b.matchPercentage - a.matchPercentage;
        }
        return b.matchedIngredientsCount - a.matchedIngredientsCount;
      });

      // Paginación
      const total = scoredRecipes.length;
      const page = Number(dto.page || 1);
      const limit = Number(dto.limit || 10);
      const totalPages = Math.ceil(total / limit) || 1;
      const startIndex = (page - 1) * limit;
      const paginatedRecipes = scoredRecipes.slice(
        startIndex,
        startIndex + limit,
      );

      return {
        recipes: paginatedRecipes,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al buscar recetas por ingredientes: ${error?.message || error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

/**
 * Normaliza un término culinario: minúsculas, quita acentos/diacríticos y espacios sobrantes.
 */
function normalizeCulinaryText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .trim();
}

/**
 * Construye un patrón regex insensible a tildes para consultar en MongoDB.
 */
function buildAccentInsensitiveRegexPattern(word: string): string {
  const escaped = normalizeCulinaryText(word).replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  );
  return escaped
    .replace(/a/g, '[aáàäâ]')
    .replace(/e/g, '[eéèëê]')
    .replace(/i/g, '[iíìïî]')
    .replace(/o/g, '[oóòöô]')
    .replace(/u/g, '[uúùüû]');
}

/**
 * Extrae raíces o variantes básicas singular/plural para el término de búsqueda.
 */
function getWordVariants(word: string): string[] {
  const clean = normalizeCulinaryText(word);
  if (!clean || clean.length < 3) return clean ? [clean] : [];

  const variants = new Set<string>();
  variants.add(clean);

  // Si termina en 'es' (tomates -> tomate)
  if (clean.endsWith('es') && clean.length > 4) {
    variants.add(clean.slice(0, -2));
  }
  // Si termina en 's' (huevos -> huevo, cebollas -> cebolla)
  else if (clean.endsWith('s') && clean.length > 3) {
    variants.add(clean.slice(0, -1));
  } else {
    // Si es singular, añadir plural común
    variants.add(`${clean}s`);
    variants.add(`${clean}es`);
  }

  return Array.from(variants);
}

const COMMON_PANTRY_STAPLES = [
  'sal',
  'agua',
  'pimienta',
  'aceite',
  'aceite de oliva',
  'aceite vegetal',
  'sal y pimienta',
  'sal marina',
];

function isStapleIngredient(normalizedDesc: string): boolean {
  return COMMON_PANTRY_STAPLES.some((staple) => {
    const stapleVariants = getWordVariants(staple);
    return stapleVariants.some((v) => {
      const regex = new RegExp(`(^|\\s|[.,;])${v}($|\\s|[.,;])`, 'i');
      return regex.test(normalizedDesc);
    });
  });
}
