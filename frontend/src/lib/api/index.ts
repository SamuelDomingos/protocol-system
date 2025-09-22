import * as auth from './auth';
import * as users from './users';
import * as protocols from './protocols';
import * as clients from './clients';

export { auth, users, protocols, clients };

export { login, logout } from './auth';
export { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} from './users';
export { 
  getProtocols, 
  getProtocolById, 
  createProtocol, 
  updateProtocol, 
  deleteProtocol 
} from './protocols';
export { 
  getClients, 
  getClientById, 
  createClient, 
  updateClient, 
  deleteClient,
  searchClients 
} from './clients';

export type * from './types';

export { ApiError } from '@/src/utils/http';