import { Controller, Post, Body} from '@nestjs/common';
import { ApiKeyService } from './apikey.service';
import { ApiKeyDto } from './dto/create-apikey.dto';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('ApiKey')
@Controller('ApiKey')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post('createApiKey')
  async createApiKey(@Body() apiKeyDto: ApiKeyDto) {
    return await this.apiKeyService.createApiKey(apiKeyDto);
  }

}
