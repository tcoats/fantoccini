const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  const three = require('three')

  const scripts = [
    'create unit box',
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


  let selected = {}
  ecs.on('selection removed', (id) => delete selected[id])
  ecs.on('selection added', (id) => selected[id] = true)
  ecs.on('delete selected objects', () => {
    for (let id of Object.keys(selected)) ecs.emit('delete', id)
  })
})