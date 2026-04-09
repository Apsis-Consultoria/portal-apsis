// Base44 SDK — functions habilitadas, resto stubado (Azure MSAL + Supabase)
import { appParams } from '@/lib/app-params';

const invokeFunction = async (name, payload = {}) => {
  const appId = appParams.appId || import.meta.env.VITE_BASE44_APP_ID;
  const token = appParams.token || localStorage.getItem('base44_access_token');
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
  entities: new Proxy({}, { get: () => new Proxy({}, { get: () => () => Promise.resolve([]) }) }),
  integrations: new Proxy({}, { get: () => new Proxy({}, { get: () => () => Promise.resolve({}) }) }),
  functions: { invoke: invokeFunction },
  analytics: { track: () => {} },
  agents: {},
  users: {},
};