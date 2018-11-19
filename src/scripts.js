const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  const three = require('three')
  const cannon = require('cannon')

  const scripts = [
    'create unit box',
    'create random box',
    'delete selected objects'
  ]

  ecs.on('load', () => {
    ecs.emit('scripts available', null, scripts)
  })

  let worldcamera  = null
  ecs.on('load world camera', (id, c) => worldcamera = c)
  ecs.on('create unit box', () => {
    const offset = new three.Vector3(0, 0, -3)
    const lookDirection = new three.Quaternion()
    worldcamera.getWorldQuaternion(lookDirection)
    offset.applyQuaternion(lookDirection)
    const position = new three.Vector3()
    worldcamera.getWorldPosition(position)
    offset.add(position)
    const id = ecs.id()
    ecs.emit('load box', id, { id: id, position: offset })
  })
  const randomPosition = () => new cannon.Vec3(
    (Math.random() - 0.5) * 10,
    4 + Math.random() * 100,
    (Math.random() - 0.5) * 10)
  const randomSize = () => new cannon.Vec3(
    3 + Math.random() * 3,
    0.2 + Math.random() * 2,
    3 + Math.random() * 3)
  ecs.on('create random box', () => {
    const id = ecs.id()
    ecs.emit('load box', id, {
      id: id,
      position: randomPosition(),
      halfExtents: randomSize()
    })
  })


  let selected = {}
  ecs.on('selection removed', (id) => delete selected[id])
  ecs.on('selection added', (id) => selected[id] = true)
  ecs.on('delete selected objects', () => {
    for (let id of Object.keys(selected)) ecs.emit('delete', id)
  })
})