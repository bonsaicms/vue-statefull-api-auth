export class DriversManager {
  constructor (auth) {
    this.auth = auth
    this.factories = {}
    this.instances = {}
    this.active = {}
  }

  register (type, name, factoryFunction) {
    if (!this.factories[type]) {
      this.factories[type] = {}
    }
    this.factories[type][name] = factoryFunction
  }

  makeInstance (type, name) {
    if (!this.factories[type][name]) throw new Error(`Cannot make instance for driver with type "${type}" and name "${name}".`)
    return this.factories[type][name](this.auth.config)
  }

  hasInstance (type, name) {
    return (this.instances[type] && this.instances[type][name])
  }

  setInstance (type, name, instance) {
    if (!this.instances[type]) {
      this.instances[type] = {}
    }
    this.instances[type][name] = instance
  }

  getInstance (type, name) {
    return this.instances[type][name]
  }

  getOrMakeInstance (type, name) {
    if (!this.hasInstance(type, name)) {
      this.setInstance(type, name, this.makeInstance(type, name))
    }
    return this.getInstance(type, name)
  }

  use (type, name) {
    this.active[type] = name
    return this
  }

  using (type) {
    return this.active[type]
  }

  get (type) {
    return this.getOrMakeInstance(type, this.using(type))
  }
}
