import api from './client';

export const startGroupSession = async (data: { tenant_id: number; host_name: string; table_number?: string }) => {
    const response = await api.post('/group-orders/start', data);
    return response.data;
};

export const getGroupSession = async (token: string) => {
    const response = await api.get(`/group-orders/${token}`);
    return response.data;
};

export const addGroupItem = async (token: string, data: { menu_item_id: number; quantity: number; added_by_name: string; guest_id?: string }) => {
    const response = await api.post(`/group-orders/${token}/items`, data);
    return response.data;
};

export const removeGroupItem = async (token: string, itemId: number) => {
    const response = await api.delete(`/group-orders/${token}/items/${itemId}`);
    return response.data;
};

export const finalizeGroupOrder = async (token: string) => {
    const response = await api.post(`/group-orders/${token}/finalize`);
    return response.data;
};
