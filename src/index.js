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

ecs.on('load', () => {
  const cannon = require('cannon')
  const randomPosition = () => new cannon.Vec3(
    (Math.random() - 0.5) * 20,
    1 + (Math.random() - 0.5) * 1,
    (Math.random() - 0.5) * 20)
  ecs.emit('load ground', ecs.id(), {})
  ecs.emit('load camera', ecs.id(), {})
  ecs.emit('load box', ecs.id(), { position: randomPosition() })
  ecs.emit('load box', ecs.id(), { position: randomPosition() })
  ecs.emit('load box', ecs.id(), { position: randomPosition() })
  ecs.emit('load box', ecs.id(), { position: randomPosition() })
  ecs.emit('load box', ecs.id(), { position: randomPosition() })
  ecs.emit('load box', ecs.id(), { position: randomPosition() })
  ecs.emit('load box', ecs.id(), { position: randomPosition() })
})

ecs.on('start', () => {
  let last = Date.now()
  const animate = () => {
    window.requestAnimationFrame(animate)
    const current = Date.now()
    const dt = current - last
    ecs.emit('event delta', null, dt)
    ecs.emit('physics delta', null, dt)
    ecs.emit('display delta', null, dt)
    last = current
  }
  window.requestAnimationFrame(animate)
})

ecs.on('pointer click', (id, e) => {
  ecs.emit('load box', ecs.id(), { position: e })
})
