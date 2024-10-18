import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StepsService } from './steps.service';
import { StepDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Steps')
@Controller('steps')
export class StepsController {
  constructor(private readonly stepsService: StepsService) {}

  @Post()
  create(@Body() createStepDto: StepDto) {
    return this.stepsService.create(createStepDto);
  }

  @Get()
  findAll() {
    return this.stepsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stepsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStepDto: UpdateStepDto) {
    return this.stepsService.update(+id, updateStepDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stepsService.remove(id);
  }
}
