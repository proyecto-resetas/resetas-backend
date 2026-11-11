import { RecipesService } from './recipes.service';

describe('RecipesService - searchByIngredients', () => {
  let service: RecipesService;
  let mockRecipeModel: any;

  beforeEach(() => {
    mockRecipeModel = {
      find: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    service = new RecipesService(
      mockRecipeModel,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );
  });

  it('debe encontrar y clasificar recetas correctamente con match de singular/plural y básicos de despensa', async () => {
    const mockRecipes = [
      {
        _id: '1',
        nameRecipe: 'Omelette con cebolla y tomate',
        ingredientsRecipe: [
          { description: '2 huevos frescos', amount: '2 unidades' },
          { description: 'Cebolla cabezona picada', amount: '1/2 unidad' },
          { description: 'Tomate en cubos', amount: '1 unidad' },
          { description: 'Sal y pimienta', amount: 'al gusto' },
        ],
        toObject: function () {
          return { ...this };
        },
      },
      {
        _id: '2',
        nameRecipe: 'Pasta con salsa y carne',
        ingredientsRecipe: [
          { description: 'Pasta espagueti', amount: '200g' },
          { description: 'Carne de res molida', amount: '250g' },
          { description: 'Tomates triturados', amount: '1 lata' },
          { description: 'Cebollas en juliana', amount: '1 unidad' },
          { description: 'Aceite de oliva', amount: '1 cda' },
        ],
        toObject: function () {
          return { ...this };
        },
      },
    ];

    mockRecipeModel.exec.mockResolvedValue(mockRecipes);

    const result = await service.searchByIngredients({
      ingredients: ['huevo', 'cebolla', 'tomate'],
      excludeStaplesFromMissing: true,
      page: 1,
      limit: 10,
    });

    expect(result.recipes.length).toBe(2);

    // La primera receta (Omelette) debe tener 0 faltantes reales porque Sal y pimienta es básico
    const first = result.recipes[0];
    expect(first.nameRecipe).toBe('Omelette con cebolla y tomate');
    expect(first.effectiveMissingCount).toBe(0);
    expect(first.matchedIngredientsCount).toBe(3);
    expect(first.matchPercentage).toBe(75);

    // La segunda receta (Pasta) debe tener 2 faltantes reales (Pasta, Carne)
    const second = result.recipes[1];
    expect(second.nameRecipe).toBe('Pasta con salsa y carne');
    expect(second.effectiveMissingCount).toBe(2);
    expect(second.matchedIngredientsCount).toBe(2);
    expect(second.matchPercentage).toBe(40);
  });

  it('debe filtrar recetas que no alcanzan el porcentaje mínimo de coincidencia', async () => {
    const mockRecipes = [
      {
        _id: '1',
        nameRecipe: 'Ensalada simple',
        ingredientsRecipe: [
          { description: 'Lechuga romana', amount: '1 planta' },
          { description: 'Tomate', amount: '1 unidad' },
        ],
        toObject: function () {
          return { ...this };
        },
      },
    ];

    mockRecipeModel.exec.mockResolvedValue(mockRecipes);

    // Con tomate hace 50% de match. Si pedimos mínimo 80%, debe retornar 0 recetas.
    const result = await service.searchByIngredients({
      ingredients: ['tomate'],
      minMatchPercentage: 80,
    });

    expect(result.recipes.length).toBe(0);
    expect(result.total).toBe(0);
  });

  it('debe manejar lista de ingredientes vacía retornando array vacío', async () => {
    const result = await service.searchByIngredients({
      ingredients: [],
    });

    expect(result.recipes).toEqual([]);
    expect(result.total).toBe(0);
  });
});
