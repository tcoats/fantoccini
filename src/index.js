const inject = require('injectinto')
if (!inject.oneornone('ecs')) {
  const ecs = require('./ecs')()
  inject('ecs', ecs)

  require('./physics')
  require('./display')
  require('./selection')
  require('./controls')
  require('./constraints')
  require('./drag')
  require('./hotkeys')
  require('./pointercapture')
  require('./input')
  require('./tools')
  require('./scripts')
  require('./ui')

  for (let pod of inject.many('pod')) pod()

  ecs.call('init')
    .then(() => ecs.call('load'))
    .then(() => ecs.call('start'))

  ecs.on('load', () => {
    const groundId = ecs.id()
    ecs.emit('load ground', groundId, { id: groundId })
    const cameraId = ecs.id()
    ecs.emit('load camera', cameraId, { id: cameraId })
    ecs.emit('create random box')
    ecs.emit('create random box')
    ecs.emit('create random box')
    ecs.emit('create random box')
    ecs.emit('create random box')
    ecs.emit('create random box')
    ecs.emit('create random box')
    ecs.emit('create random box')
  })

  ecs.on('start', () => {
    let last = Date.now()
    const animate = () => {
      window.requestAnimationFrame(animate)
      const current = Date.now()
      const dt = current - last
      ecs.emit('event delta', null, dt)
      ecs.emit('physics delta', null, dt)
      ecs.emit('physics to display delta', null, dt)
      ecs.emit('display delta', null, dt)
      last = current
    }
    window.requestAnimationFrame(animate)
  })

} else location.reload(true)
