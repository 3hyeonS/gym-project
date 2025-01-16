import { SetMetadata } from "@nestjs/common";
import { TRole } from "src/auth/entity/user.entity";

export const ROLES_KEY = 'roles';
export const Roles = (...roles: TRole[]) => SetMetadata(ROLES_KEY, roles);