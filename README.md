# Authentication layer for Vue 3 applications

This package is designed as an authentication layer for Vue applications in combination with an authentication backend server that provides statefull API (session-based cookie authentication). Example of such a backend implementation is [Larvel Sanctum](https://laravel.com/docs/8.x/sanctum).

## Install

Using npm:

```bash2
npm install @bonsaicms/vue-statefull-api-auth --save
```

Using yarn:

```bash2
yarn add @bonsaicms/vue-statefull-api-auth
```

## Setup

You need to run this code once while your application is booting.

```js
import Vue from 'vue'
import { createAuth } from '@bonsaicms/vue-statefull-api-auth'

// Import your Vue router instance
import router from 'src/router'

const auth = createAuth(

  // Router instance
  router,

  // You can override the default configuration here
  // Default config values can be found here: https://github.com/bonsaicms/vue-statefull-api-auth/blob/master/src/config.js#L3
  { }
)

// Don't forget to initialize the auth
// By "initialize" we mean "to find out wether the user is logged in or not"
auth.initialize()
```

## Usage

In the following example we use the `auth` variable. It is an object created using the `createAuth` function.

### Getters

- `auth.ready` is `true` if the package was already initialized (`fetchUser` endpoint responded) or `false` (didn't respond yet).
- `auth.check` is `true` if the user is logged in or `false` when user is not logged in.
- `auth.user` is the `user` object returned by the `fetchUser` endpoint.

### Methods

- `auth.initialize()` - you need to run this exactly one time.
- `auth.attemptLogin(credentialsObject).then(user => /* user logged */).catch((e) => { /* login failed */ })`
- `auth.logout()`
- `auth.fetchUser().then(user => ...)`

### Protecting the routes

You can protect your routes using the `meta` property. This valus of the `meta.auth` can be configured in the `config.authMeta` property.

#### Routes example:

```js
const routes = [

  // This route is accessible only for LOGGED users
  {
    path: '/home',
    component: () => import('Home.vue'),
    meta: { auth: true } // Notice true value
  },

  // This route is accessible only for UNAUTHENTICATED users
  {
    path: '/login',
    component: () => import('Login.vue'),
    meta: { auth: false } // Notice false value
  },

  // This is just a reggular public route accessible for everybody
  {
    path: '/something',
    component: () => import('Something.vue'),
    // Notice meta: { auth: ... } is not defined here
  },

]
```

## Automatic redirects

If the user is **NOT** logged in and he/she is trying to visit a route accessible only for logged users, this package will automatically redirect the user to `config.redirects.unauthenticated` route.

If the user **IS** logged in and he/she is trying to visit a route accessible only for unauthenticated users, this package will automatically redirect the user to `config.redirects.authenticated` route.

### Configuration

#### Default configuration object

```js
{
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
```

### HTTP Client

This package uses [Axios](https://github.com/axios/axios) for sending API requests by default, but you can use your own HTTP client implementation this by calling `auth.drivers.register('http', 'myDriver', myHttpDriverFactory)` and then `auth.drivers.use('http', 'myDriver')`.

## Backend Endpoints

In order to use this package, your backend must implement at least these three API endpoints:

  - `fetchUser` - Get the information about the currently logged user.
    - You can call this endpoint by calling `auth.fetchUser().then(user => ...))`
    - If the user is logged in, this endpoint should respond with HTTP status 200 and provide an JSON `user` in the response body. Example of `user`:`{ 'name': 'John' }`. This can be anything useful for your frontend application.
    - If the user is **NOT** logged in, this endpoint should respond with HTTP status 422 and empty body.
  - `attemptLogin` - Attempt to login a user.
    - You can call this endpoint by calling `auth.attemptLogin(credentialsObject).then(user => ...))`
    - This endpoint must accept the POST HTTP method.
    - If the user was successfuly logged in, this endpoint should respond with HTTP status 200.
    - If the user is **NOT** logged in, this endpoint should respond with HTTP status 422.
  - `logout` - Logout the currently logged user.
    - You can call this endpoint by calling `auth.logout().then(...))`

Your backend can also implement the 4th endpoint, but this one is optional:

  - `setCsrfCookie`
    - If this endpoints is configured (not configured by default), then it will be accessed automatically during the initialization procedure.
    - It should accept the GET HTTP method.
    - It should configure the CSRF cookie in the response so any subsequent POST API calls will not fail because of missing CSRF token cookie.

## Are you looking for backend authentication implementation ?
Feel free to check out our [bonsaicms/auth](https://github.com/bonsaicms/auth) package designed for Laravel applications.
