const inject = require('injectinto')
if (!inject.oneornone('ecs')) {
  const cannon = require('cannon')
  const three = require('three')
  const ecs = require('./ecs')()
  inject('ecs', ecs)

  require('./physics')
  require('./display')
  require('./controls')
  require('./ui')

  for (let pod of inject.many('pod')) pod()

  ecs.call('init')
    .then(() => ecs.call('load'))
    .then(() => ecs.call('start'))

  ecs.on('load', () => {
    const randomPosition = () => new cannon.Vec3(
      (Math.random() - 0.5) * 10,
      4 + Math.random() * 100,
      (Math.random() - 0.5) * 10)
    const randomSize = () => new cannon.Vec3(
      3 + Math.random() * 3,
      0.2 + Math.random() * 2,
      3 + Math.random() * 3)
    const loadBox = () => {
      const id = ecs.id()
      ecs.emit('load box', id, {
        id: id,
        position: randomPosition(),
        halfExtents: randomSize()
      })
    }
    const groundId = ecs.id()
    ecs.emit('load ground', groundId, { id: groundId })
    const cameraId = ecs.id()
    ecs.emit('load camera', cameraId, { id: cameraId })
    loadBox()
    loadBox()
    loadBox()
    loadBox()
    loadBox()
    loadBox()
    loadBox()
    loadBox()
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

  let worldcamera  = null
  ecs.on('load world camera', (id, c) => worldcamera = c)

  ecs.on('pointer click', (id, e) => {
    const offset = new three.Vector3(0, 0, -3)
    const lookDirection = new three.Quaternion()
    worldcamera.getWorldQuaternion(lookDirection)
    offset.applyQuaternion(lookDirection)
    offset.add(e.client3D)
    ecs.emit('load box', ecs.id(), { position: offset })
  })
} else location.reload(true)
