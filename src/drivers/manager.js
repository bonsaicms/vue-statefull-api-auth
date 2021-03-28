export function createDriversManager (config) {
  const factories = {}
  const instances = {}
  const active = {}

  function register (type, name, factoryFunction) {
    if (!factories[type]) {
      factories[type] = {}
    }
    factories[type][name] = factoryFunction
  }

  function makeInstance (type, name) {
    if (!factories[type][name]) throw new Error(`Cannot make instance for driver with type "${type}" and name "${name}".`)
    return factories[type][name](config)
  }

  function hasInstance (type, name) {
    return (instances[type] && instances[type][name])
  }

  function setInstance (type, name, instance) {
    if (!instances[type]) {
      instances[type] = {}
    }
    instances[type][name] = instance
  }

  function getInstance (type, name) {
    return instances[type][name]
  }

  function getOrMakeInstance (type, name) {
    if (!hasInstance(type, name)) {
      setInstance(type, name, makeInstance(type, name))
    }
    return getInstance(type, name)
  }

  function use (type, name) {
    active[type] = name
    return this
  }

  function using (type) {
    return active[type]
  }

  function get (type) {
    return getOrMakeInstance(type, using(type))
  }

  return {
    register,
    use,
    using,
    get,
  }
}
