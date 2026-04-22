import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { StepsService } from './steps.service';
import { StepDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { ApiTags } from '@nestjs/swagger';
import { Secure } from 'src/common/decorators/secure.decorator';
import { UserRole } from 'src/common/guard/roles.enum';
import {
  DocCreateStep,
  DocGetAllSteps,
  DocGetStepById,
  DocGetStepsByRecipe,
  DocUpdateStep,
  DocDeleteStep,
} from './decorators/steps-swagger.decorator';

@ApiTags('Steps')
@Controller('steps')
export class StepsController {
  constructor(private readonly stepsService: StepsService) {}

  @Post()
  @Secure([UserRole.ADMIN, UserRole.USER] , ['steps:create'])
  @DocCreateStep()
  create(@Body() createStepDto: StepDto) {
    return this.stepsService.create(createStepDto);
  }

  @Get()
  @Secure([UserRole.ADMIN, UserRole.USER] , ['steps:read'])
  @DocGetAllSteps()
  findAll() {
    return this.stepsService.findAll();
  }

  @Get(':id')
  @Secure([UserRole.ADMIN, UserRole.USER], ['steps:read'])
  @DocGetStepById()
  findOne(@Param('id') id: string) {
    return this.stepsService.findOne(id);
  }

  @Get('recipe/:recipeId')
  @Secure([UserRole.ADMIN, UserRole.USER], ['steps:read'])
  @DocGetStepsByRecipe()
  async getStepsByRecipe(
    @Param('recipeId') recipeId: string,
    @Request() req: any,
  ) {
    const userId = req.user?.sub;
     const steps = await this.stepsService.findStepsByRecipeForUser(recipeId, userId);
     return {
      message: 'Steps found successfully',
      data: steps,
     }

  }

  @Patch(':id')
  @Secure([UserRole.ADMIN] , ['steps:update'])
  @DocUpdateStep()
  update(@Param('id') id: string, @Body() updateStepDto: UpdateStepDto) {
    return this.stepsService.update(id, updateStepDto);
  }

  @Delete(':id')
  @Secure([UserRole.ADMIN] , ['steps:delete'])
  @DocDeleteStep()
  remove(@Param('id') id: string) {
    return this.stepsService.remove(id);
  }
}
