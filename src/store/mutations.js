export default function (auth) {
  return {
    setReady (state) {
      state.ready = true
    },
    login (state, user) {
      state.logged = true
      state.user = user
    },
    logout (state) {
      state.user = null
      state.logged = false
    }
  }
}
