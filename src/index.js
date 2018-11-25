const inject = require('injectinto')
if (!inject.oneornone('ecs')) {
  const ecs = require('./ecs')()
  inject('ecs', ecs)

  require('./physics')
  require('./controls')
  require('./constraints')
  require('./hotkeys')
  require('./pointercapture')
  require('./input')
  require('./tools')
  require('./drag')
  require('./scripts')
  require('./selection')
  require('./move')
  require('./display')
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
    let frame = 0
    const animate = () => {
      frame++
      window.requestAnimationFrame(animate)
      const current = Date.now()
      const dt = current - last
      ecs.emit('event delta', frame, dt)
      ecs.emit('physics delta', frame, dt)
      ecs.emit('physics to display delta', frame, dt)
      ecs.emit('display delta', frame, dt)
      last = current
    }
    window.requestAnimationFrame(animate)
  })

} else location.reload(true)
