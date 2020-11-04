export default function (auth) {
  return {

    async initialize (context) {
      if (auth.config.apiEndpoints.setCsrfCookie) {
        await auth.drivers.get('http').request('setCsrfCookie')
      }
      return auth.drivers.get('http').request('fetchUser')
        .then(auth.config.apiEndpoints.fetchUser.transformResponse)
        .then(user => {
          context.commit('setReady')
          context.commit('login', user)
        })
        .catch(err => {
          context.commit('setReady')
          context.commit('logout')
        })
    },

    attemptLogin (context, credentials) {
      return auth.drivers.get('http').request('attemptLogin', credentials)
        .then(auth.config.apiEndpoints.attemptLogin.transformResponse)
        .then(user => {
          context.commit('login', user)
          return user
        })
        .catch(err => {
          context.commit('logout')
          throw err
        })
    },

    fetchUser (context) {
      return auth.drivers.get('http').request('fetchUser')
        .then(auth.config.apiEndpoints.fetchUser.transformResponse)
        .then(user => {
          context.commit('setUser', user)
        })
    },

    logout (context, credentials) {
      return auth.drivers.get('http').request('logout')
        .then(() => {
          context.commit('logout')
        })
    }

  }
}
