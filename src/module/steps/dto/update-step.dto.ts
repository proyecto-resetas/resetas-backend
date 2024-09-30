import { PartialType } from '@nestjs/swagger';
import { StepDto } from './create-step.dto';

export class UpdateStepDto extends PartialType(StepDto) {}
