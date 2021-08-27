import { ref, readonly } from 'vue'
import { deepMerge } from './utils'
import { mergeConfig } from './config'
import { createDriversManager, axiosHttpDriverFactory } from './drivers'

export function createAuth (router, cfg = {}) {
  // Initialize config
  const config = mergeConfig(cfg)

  // Initialize drivers
  const drivers = createDriversManager(config)
  drivers.register('http', 'axios', axiosHttpDriverFactory);
  drivers.use('http', config.http.driver)

  // Initialize state
  const _ready = ref(false)
  const ready = readonly(_ready)

  const _logged = ref(false)
  const logged = readonly(_logged)

  const _user = ref(null)
  const user = readonly(_user)

  // Functions implementation

  function _initializeRouterGuard () {
    router.beforeEach((to, from, next) => {
      // If not ready, do nothing
      if (!_ready.value) {
        next()
        return
      }
      if (to.matched.some(route => route.meta[config.authMeta.key] === config.authMeta.value.authenticated)) {
        // Accessing route only for authenticated users
        if (_logged.value) {
          // We are logged, so we can continue
          next()
        } else {
          // We are not logged, so we need to login first
          next(deepMerge(
            { params: { nextUrl: to.fullPath } },
            config.redirects.unauthenticated
          ))
        }
      } else if (to.matched.some(route => route.meta[config.authMeta.key] === config.authMeta.value.unauthenticated)) {
        // Accessing route only for unauthenticated users
        if (_logged.value) {
          // We are logged, so we need to redirect
          next(config.redirects.authenticated)
        } else {
          // We are not logged, so we can continue
          next()
        }
      } else {
        // Accessing public route (for authenticated and also for unauthenticated users)
        next()
      }
    })
  }

  function redirectIfNeed () {
    if (router.currentRoute.value.matched.some(route =>
      route.meta[config.authMeta.key] ===
      config.authMeta.value.authenticated
    )) {
      // If not ready, do nothing
      if (!_ready.value) {
        return
      }
      // Accessing route only for authenticated users
      if (!_logged.value) {
        // We are not logged, so we need to login first
        router.push(deepMerge(
          { params: { nextUrl: router.currentRoute.value.fullPath } },
          config.redirects.unauthenticated
        ))
      }
    } else if (router.currentRoute.value.matched.some(route =>
      route.meta[config.authMeta.key] ===
      config.authMeta.value.unauthenticated
    )) {
      // Accessing route only for unauthenticated users
      if (_logged.value) {
        // We are logged, so we need to redirect
        router.push(config.redirects.authenticated)
      }
    }
  }

  const _onReadyResolvers = []

  async function isReady () {
    if (_ready.value) {
      return Promise.resolve()
    } else {
      return new Promise((resolve, reject) => {
        _onReadyResolvers.push(resolve)
      })
    }
  }

  function _resolveOnReady () {
    for (const resolve of _onReadyResolvers) {
      resolve()
    }
  }

  async function initialize () {
    if (config.apiEndpoints.setCsrfCookie) {
      await drivers.get('http').request('setCsrfCookie')
    }
    return drivers.get('http').request('fetchUser')
      .then(config.apiEndpoints.fetchUser.transformResponse)
      .then(user => {
        _logged.value = true
        _user.value = user
      })
      .catch(err => {
        _logged.value = false
        _user.value = null
      })
      .finally(() => {
        _ready.value = true
        router.isReady().then(() => {
          _initializeRouterGuard()
          redirectIfNeed()
        })
        _resolveOnReady()
      })
  }

  async function attemptLogin (credentials) {
    return drivers.get('http').request('attemptLogin', credentials)
      .then(config.apiEndpoints.attemptLogin.transformResponse)
      .then(user => {
        _logged.value = true
        _user.value = user
        return user
      })
      .catch(err => {
        _logged.value = false
        _user.value = null
        throw err
      })
      .finally(redirectIfNeed)
  }

  async function fetchUser () {
    return drivers.get('http').request('fetchUser')
      .then(config.apiEndpoints.fetchUser.transformResponse)
      .then(user => {
        _user.value = user
        return user
      })
      .finally(redirectIfNeed)
  }

  async function logout () {
    return drivers.get('http').request('logout')
      .then(() => {
        _logged.value = false
        _user.value = null
      })
      .finally(redirectIfNeed)
  }

  return {
    drivers,
    ready,
    logged,
    user,
    redirectIfNeed,
    initialize,
    attemptLogin,
    fetchUser,
    logout,
    isReady,
  }
}
