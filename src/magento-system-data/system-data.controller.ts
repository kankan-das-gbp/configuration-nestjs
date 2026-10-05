import { Controller, Get, Param, NotFoundException, UseGuards } from '@nestjs/common';
import { SystemXmlLoader } from './system-xml-loader.service';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { ApiSecurity } from '@nestjs/swagger';

@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
@Controller('api/system-xml')
export class SystemDataController {
  constructor(private systemXml: SystemXmlLoader) {}

  @Get('sections')
  getAllSectionsId() {
    return this.systemXml.getAllSectionsId();
  }

  @Get('sections/:id')
  getSectionById(@Param('id') id: string) {
    const section = this.systemXml.getSystemDataBySectionId(id);
    if (!section) {
      throw new NotFoundException(`Section with ID "${id}" not found in system configurations.`);
    }
    return section;
  }
}
