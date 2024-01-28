import { Layer, Map } from "./type";

export interface User {
  id?: number;
  username?: string;
  is_superuser?: boolean;
  first_name?: string;
  last_name?: string;
  slug?: string;
  email?: string;
  password?: string;
  is_active?: boolean;
  password_changed?: boolean;
  is_from_ldap?: boolean;
  layers_saved?: boolean;
  entreprise_id?: number;
  entreprise?: number;
  entreprise_name?: string;
  group?: GroupUser;
  group_id?: number;
  group_name?: string;
  maps?:number[];
}

export interface GroupUser {
  id?: number;
  name?: string;
  user_id?: number[];
  users?: User[] | number[];
  map?: number[];
  required?: boolean;
  action?:string;
}

export interface TokenResponse {
  refresh: string;
  access: string;
}

export interface PasswordConfirmation {
  is_valid: boolean;
}

export interface Entreprise {
  entreprise_id?: number;
  name?: string;
}

export interface Right {
  id?: number;
  user_id?: number;
  layer_id?: number;
  user_name?: string;
  layer_name?: string;
  read?: boolean;
  write?: boolean;
}

export interface GroupsRight {
  no_read: GroupUser[];
  write: GroupUser[];
}

export interface LayersRight {
  no_read: Layer[];
  write: Layer[];
}
