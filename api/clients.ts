import { apiClient } from './client';

export interface Address {
  street?: string;
  city?: string;
  zipCode?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  nif: string;
  phone?: string;
  address?: Address;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientCreate {
  name: string;
  email: string;
  nif: string;
  phone?: string;
  address?: Address;
  notes?: string;
}

export interface ClientUpdate {
  name?: string;
  email?: string;
  nif?: string;
  phone?: string;
  address?: Address;
  notes?: string;
}

const CLIENTS_PREFIX = '/clients';

export const clientsApi = {
  // GET /clients - Lista todos os clientes
  getAll: async (): Promise<Client[]> => {
    return apiClient.get(CLIENTS_PREFIX);
  },

  // GET /clients?nif={nif} - Buscar por NIF
  getByNif: async (nif: string): Promise<Client> => {
    return apiClient.get(`${CLIENTS_PREFIX}?nif=${nif}`);
  },

  // GET /clients?email={email} - Buscar por Email
  getByEmail: async (email: string): Promise<Client> => {
    return apiClient.get(`${CLIENTS_PREFIX}?email=${email}`);
  },

  // GET /clients/{client_id} - Buscar por ID
  getById: async (clientId: string): Promise<Client> => {
    return apiClient.get(`${CLIENTS_PREFIX}/${clientId}`);
  },

  // POST /clients - Criar novo cliente
  create: async (data: ClientCreate): Promise<Client> => {
    return apiClient.post(CLIENTS_PREFIX, data);
  },

  // PATCH /clients/{client_id} - Atualizar cliente
  update: async (clientId: string, data: ClientUpdate): Promise<Client> => {
    return apiClient.patch(`${CLIENTS_PREFIX}/${clientId}`, data);
  },

  // DELETE /clients/{client_id} - Eliminar cliente
  delete: async (clientId: string): Promise<void> => {
    return apiClient.delete(`${CLIENTS_PREFIX}/${clientId}`);
  },
};
