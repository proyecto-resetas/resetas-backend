import { PartialType } from '@nestjs/mapped-types';
import { CreateRecetaDto } from './create-recipe.dto';

export class UpdateRecetaDto extends PartialType(CreateRecetaDto) {}
