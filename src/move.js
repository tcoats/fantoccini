const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  const three = require('three')

  let selected = {}
  let selectionGroup = null
  ecs.on('remove selection', (id) => delete selected[id])
  ecs.on('add selection', (id, entity) => selected[id] = entity)
  ecs.on('load selection group', (id, group) => selectionGroup = group)

  const raycaster = new three.Raycaster()
  const direction = new three.Vector3()
  let currentTool = null
  let origin = null
  ecs.on('tool select', (id, tool) => currentTool = tool.current)
  ecs.on('dragging started', (id, drag) => {
    if (currentTool != 'move') return
    direction.set(0, 0, -1)
    direction.applyQuaternion(drag.startQuaternion)
    raycaster.set(drag.startPosition, direction)
    const intersects = raycaster.intersectObjects(
      Object.values(selected).map(e => e.mesh))
    if (intersects.length == 0) return
    origin = intersects[0].point
  })
  ecs.on('dragging', (id, drag) => {
    if (currentTool != 'move') return
    selectionGroup.position.set(0, 0, 0)
    if (!origin) return
    selectionGroup.position.add(drag.deltaPosition)
    selectionGroup.updateMatrixWorld()
  })
  ecs.on('dragging finished', (id, drag) => {
    if (currentTool != 'move' ) return
    selectionGroup.position.set(0, 0, 0)
    if (!origin) return
    selectionGroup.position.add(drag.deltaPosition)
    selectionGroup.updateMatrixWorld()
  })
})