const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  const three = require('three')

  const scripts = [
    'create unit box',
    'delete selected objects',
    'duplicate selected objects'
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
    ecs.emit('load box', ecs.id(), { position: offset })
  })
})