import { RolesTypeEnum } from '@/enums/rolesTypeEnum';

export interface User {
  id?: number;
  email: string;
  password?: string;
  role: RolesTypeEnum | null;
}
