const inject = require('injectinto')
if (inject.oneornone('ecs')) {
  location.reload(true)
  return
}

const ecs = require('./ecs')()
inject('ecs', ecs)

require('./physics')
require('./display')

for (let pod of inject.many('pod')) pod()



ecs.on('load', () => {
  const create = () => {
    const id = ecs.id()
    ecs.emit('create sphere', id)
    setTimeout(() => ecs.emit('delete', id), 5000)
  }
  setInterval(create, 10000)
  create()
})


ecs.emitAsync('init')
  .then(() => ecs.emitAsync('load'))
  .then(() => ecs.emitAsync('start'))
