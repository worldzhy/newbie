import {Controller, Get, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {RoleService} from './role.service';

@ApiTags('[Product] Account / Role')
@ApiBearerAuth()
@Controller()
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Get('role/')
  getRoles() {
    return this.roleService.roles();
  }

  @Get('role/:id')
  getRole(@Param('id') id: string) {
    return this.roleService.role({id});
  }
}
