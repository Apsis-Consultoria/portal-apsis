// Base44 SDK desabilitado — app totalmente independente (Azure MSAL + Supabase)
export const base44 = {
  auth: { me: () => Promise.resolve(null), logout: () => {}, redirectToLogin: () => {} },
  entities: new Proxy({}, { get: () => new Proxy({}, { get: () => () => Promise.resolve([]) }) }),
  integrations: new Proxy({}, { get: () => new Proxy({}, { get: () => () => Promise.resolve({}) }) }),
  functions: { invoke: () => Promise.resolve({}) },
  analytics: { track: () => {} },
  agents: {},
  users: {},
};