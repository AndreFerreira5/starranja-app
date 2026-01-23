import { apiClient } from './client';

export type SupplierOrderStatus = 'Pending' | 'Ordered' | 'Received' | 'Cancelled';

export interface SupplierOrder {
  _id: string;
  supplierName: string;
  description: string; 
  status: SupplierOrderStatus;
  workOrderId?: string;
  createdById: string;
  orderDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierOrderCreate {
  supplierName: string;
  description: string;
  status?: SupplierOrderStatus;
  workOrderId?: string;
}

export interface SupplierOrderUpdate {
  supplierName?: string;
  description?: string;
  status?: SupplierOrderStatus;
}

const ORDERS_PREFIX = '/supplier-orders';

export const supplierOrdersApi = {
  getAll: async (filters?: { 
    workOrderId?: string; 
    status?: SupplierOrderStatus; 
    supplierName?: string 
  }): Promise<SupplierOrder[]> => {
    let url = ORDERS_PREFIX;
    if (filters) {
      const params = new URLSearchParams();
      if (filters.workOrderId) params.append('work_order_id', filters.workOrderId);
      if (filters.status) params.append('status', filters.status);
      if (filters.supplierName) params.append('supplier_name', filters.supplierName);
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
    }
    return apiClient.get(url);
  },

  getById: async (id: string): Promise<SupplierOrder> => {
    return apiClient.get(`${ORDERS_PREFIX}/${id}`);
  },

  create: async (data: SupplierOrderCreate): Promise<SupplierOrder> => {
    return apiClient.post(ORDERS_PREFIX, data);
  },

  update: async (id: string, data: SupplierOrderUpdate): Promise<SupplierOrder> => {
    return apiClient.patch(`${ORDERS_PREFIX}/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`${ORDERS_PREFIX}/${id}`);
  },
};