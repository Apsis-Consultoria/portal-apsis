// Base44 SDK — functions habilitadas + entities com API real
import { appParams } from '@/lib/app-params';

const APP_ID = '69a1fc4b60b4c477ea324579';
const getAppId = () => {
  const id = appParams.appId || import.meta.env.VITE_BASE44_APP_ID;
  return (id && id !== 'undefined') ? id : APP_ID;
};
const getToken = () => appParams.token || localStorage.getItem('base44_access_token');

const apiRequest = async (method, path, body) => {
  const appId = getAppId();
  const token = getToken();
  const url = `https://api.base44.app/api/apps/${appId}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
};

const buildQueryString = (params) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v !== undefined && v !== null && qs.append(k, v));
  return qs.toString() ? `?${qs.toString()}` : '';
};

const fetchViaBackend = async (entity_name, sort = '-created_date', limit = 300) => {
  const res = await invokeFunction('getEntities', { entity_name, sort, limit });
  const rows = res.data?.data || res.data || [];
  // SDK do base44 já retorna os campos flat (id, nome, etc.), sem aninhamento
  return Array.isArray(rows) ? rows : [];
};

const createEntityClient = (entityName) => ({
  list: async (sort = '-created_date', limit = 300) => {
    return fetchViaBackend(entityName, sort, limit);
  },
  filter: async (filters = {}, sort = '-created_date', limit = 300) => {
    const all = await fetchViaBackend(entityName, sort, limit);
    return all.filter(row => Object.entries(filters).every(([k, v]) => row[k] === v));
  },
  get: async (id) => {
    const all = await fetchViaBackend(entityName);
    return all.find(r => r.id === id) || null;
  },
  create: async (data) => {
    const res = await apiRequest('POST', `/entities/${entityName}`, data);
    const row = res.data || res;
    return { id: row.id, ...(row.data || row) };
  },
  update: async (id, data) => {
    const res = await apiRequest('PUT', `/entities/${entityName}/${id}`, data);
    const row = res.data || res;
    return { id: row.id, ...(row.data || row) };
  },
  delete: async (id) => {
    await apiRequest('DELETE', `/entities/${entityName}/${id}`);
    return true;
  },
  schema: async () => {
    const res = await apiRequest('GET', `/entities/${entityName}/schema`);
    return res;
  },
});

const invokeFunction = async (name, payload = {}) => {
  const appId = getAppId();
  const token = getToken();
  const url = `https://api.base44.app/api/apps/${appId}/functions/${name}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return { data };
};

export const base44 = {
  auth: { me: () => Promise.resolve(null), logout: () => {}, redirectToLogin: () => {} },
  entities: new Proxy({}, {
    get: (_, entityName) => createEntityClient(entityName)
  }),
  integrations: new Proxy({}, { get: () => new Proxy({}, { get: () => () => Promise.resolve({}) }) }),
  functions: { invoke: invokeFunction },
  analytics: { track: () => {} },
  agents: {},
  users: {},
};