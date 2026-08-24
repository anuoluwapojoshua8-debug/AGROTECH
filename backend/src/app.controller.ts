import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('system')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'API health and service information' })
  getApiInfo() {
    return {
      name: 'AgroTech Marketplace API',
      version: '1.0.0',
      status: 'operational',
      environment: process.env.NODE_ENV || 'development',
      docs: '/docs',
      timestamp: new Date().toISOString(),
    };
  }
}
