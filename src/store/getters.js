export default function (auth) {
  return {
    ready (state) {
      return state.ready
    },
    check (state) {
      return state.logged
    },
    user (state) {
      return state.user
    }
  }
}
