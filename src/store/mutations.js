export default function (auth) {
  return {
    setReady (state) {
      state.ready = true
    },
    login (state, user) {
      state.logged = true
      state.user = user
    },
    setUser (state, user) {
      state.user = user
    },
    logout (state) {
      state.user = null
      state.logged = false
    }
  }
}
