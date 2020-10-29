import { deepMerge } from './utils'

export const defaultConfig = {
  store: {
    namespaced: true,
    moduleName: 'auth',
  },
  http: {
    driver: 'axios',
    config: {
      //
    },
  },
  authMeta: {
    key: 'auth',
    value: {
      authenticated: true,
      unauthenticated: false
    }
  },
  redirects: {
    unauthenticated: { path: '/login' },
    authenticated: { path: '/' }
  },
  apiEndpoints: {
    setCsrfCookie: null,
    fetchUser: {
      method: 'get',
      url: '/api/auth/user',
      transformResponse: (response) => response,
    },
    attemptLogin: {
      method: 'post',
      url: '/api/auth/login',
      transformResponse: (response) => response
    },
    logout: {
      method: 'post',
      url: '/api/auth/logout',
    }
  }
}

export function mergeConfig (config) {
  return deepMerge(defaultConfig, config)
}
