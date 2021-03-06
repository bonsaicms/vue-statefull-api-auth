import Vuex from 'vuex'
import { deepMerge } from './utils'
import { mergeConfig } from './config'
import createStoreModule from './store'
import { DriversManager, axiosHttpDriverFactory } from './drivers'

export class Auth {
  constructor ({ store, router, config }) {
    // Initialize config
    this.config = mergeConfig(config)

    // Initialize drivers
    this.initializeDrivers()

    // Initialize Vuex store
    this.initializeStore(store)

    // Initialize Router
    if (!router) throw new Error('You need to provide "router" parameter.')
    this.router = router
  }

  initializeDrivers () {
    this.drivers = new DriversManager(this)
    this.drivers.register('http', 'axios', axiosHttpDriverFactory);
    this.drivers.use('http', 'axios', this.config.http.driver)
  }

  initializeStore (store) {
    if (!store) {
      Vue.use(Vuex)
      store = new Vuex.Store()
    }
    this.store = store
    if (this.config.store.namespaced) {
      this.store.registerModule(this.config.store.moduleName, createStoreModule(this))
      // TODO: Maybe there is cleaner way to retrieve the module context ?
      this.context = this.store._modulesNamespaceMap[this.storePrefix('')].context
    } else {
      this.store.registerModule('', createStoreModule(this))
      this.context = this.store
    }
  }

  initializeRouterGuard () {
    this.router.beforeEach((to, from, next) => {
      // If not ready, do nothing
      if (!this.context.getters.ready) {
        next()
        return
      }
      if (to.matched.some(route => route.meta[this.config.authMeta.key] === this.config.authMeta.value.authenticated)) {
        // Accesing route only for authenticated users
        if (this.context.getters.check) {
          // We are logged, so we can continue
          next()
        } else {
          // We are not logged, so we need to login first
          next(deepMerge(
            { params: { nextUrl: to.fullPath } },
            this.config.redirects.unauthenticated
          ))
        }
      } else if (to.matched.some(route => route.meta[this.config.authMeta.key] === this.config.authMeta.value.unauthenticated)) {
        // Accesing route only for unauthenticated users
        if (this.context.getters.check) {
          // We are logged, so we need to redirect
          next(this.config.redirects.authenticated)
        } else {
          // We are not logged, so we can continue
          next()
        }
      } else {
        // Accesing public route (for authenticated and also for unauthenticated users)
        next()
      }
    })
  }

  initializeRouterRedirects () {
    this.store.subscribe((mutation, state) => {
      this.redirectIfNeed()
    })
  }

  redirectIfNeed () {
    const currentRoute = (this.router.currentRoute.constructor.name === 'RefImpl')
      // Vue 3
      ? this.router.currentRoute.value
      // Vue 2
      :this.router.currentRoute

    if (currentRoute.matched.some(route =>
      route.meta[this.config.authMeta.key] ===
      this.config.authMeta.value.authenticated
    )) {
      // If not ready, do nothing
      if (!this.context.getters.ready) {
        return
      }
      // Accesing route only for authenticated users
      if (!this.context.getters.check) {
        // We are not logged, so we need to login first
        this.router.push(deepMerge(
          { params: { nextUrl: currentRoute.fullPath } },
          this.config.redirects.unauthenticated
        ))
      }
    } else if (currentRoute.matched.some(route =>
      route.meta[this.config.authMeta.key] ===
      this.config.authMeta.value.unauthenticated
    )) {
      // Accesing route only for unauthenticated users
      if (this.context.getters.check) {
        // We are logged, so we need to redirect
        this.router.push(this.config.redirects.authenticated)
      }
    }
  }

  /* Proxy actions */
  async initialize () {
    await this.context.dispatch('initialize')
    // Vue 2
    if (this.router.onReady) {
      this.router.onReady(() => {
        this.initializeRouterGuard()
        this.initializeRouterRedirects()
        this.redirectIfNeed()
      })
    }
    // Vue 3
    else {
      this.router.isReady().then(() => {
        this.initializeRouterGuard()
        this.initializeRouterRedirects()
        this.redirectIfNeed()
      })
    }
  }
  attemptLogin (credentials) {
    return this.context.dispatch('attemptLogin', credentials)
  }
  fetchUser () {
    return this.context.dispatch('fetchUser')
  }
  logout () {
    return this.context.dispatch('logout')
  }

  /*
   * Proxy getters
   */
  get ready () {
    return this.context.getters.ready
  }
  get check () {
    return this.context.getters.check
  }
  get user () {
    return this.context.getters.user
  }

  /*
   * Helpers
   */
  storePrefix (name) {
    if (name === null || name === undefined) {
      if (this.config.store.namespaced) {
        return this.config.store.moduleName
      } else {
        return ''
      }
    } else {
      if (this.config.store.namespaced) {
        return `${this.config.store.moduleName}/${name}`
      } else {
        return name
      }
    }
  }
}
