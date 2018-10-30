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

ecs.emitAsync('init')
  .then(() => ecs.emitAsync('load'))
  .then(() => ecs.emitAsync('start'))
