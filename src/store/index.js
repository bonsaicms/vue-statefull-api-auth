import createState from './state'
import createActions from './actions'
import createGetters from './getters'
import createMutations from './mutations'

export default function (auth) {
  return {
    namespaced: auth.config.store.namespaced,

    state: createState(auth),
    actions: createActions(auth),
    getters: createGetters(auth),
    mutations: createMutations(auth),
  }
}
