const inject = require('injectinto')
if (inject.oneornone('ecs')) return location.reload(true)
const ecs = require('./ecs')()
inject('ecs', ecs)

require('./physics')
require('./display')
require('./controls')

for (let pod of inject.many('pod')) pod()

ecs.call('init')
  .then(() => ecs.call('load'))
  .then(() => ecs.call('start'))
