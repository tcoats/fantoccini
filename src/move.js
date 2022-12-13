const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  const three = require('three')

  let selected = {}
  let selectionGroup = null
  let constraints = { x: false, y: false, z: false }
  ecs.on('remove selection', (id) => delete selected[id])
  ecs.on('add selection', (id, entity) => selected[id] = entity)
  ecs.on('load selection group', (id, group) => selectionGroup = group)
  ecs.on('constrain axis', (id, c) => constraints = c)

  const raycaster = new three.Raycaster()
  const direction = new three.Vector3()
  let currentTool = null
  let origin = null
  let plane = null
  ecs.on('tool select', (id, tool) => currentTool = tool.current)
  ecs.on('dragging started', (id, drag) => {
    if (currentTool != 'move') return
    direction.set(0, 0, -1)
    direction.applyQuaternion(drag.startQuaternion)
    raycaster.set(drag.startPosition, direction)
    const intersects = raycaster.intersectObjects(
      Object.values(selected).map(e => e.mesh))
    if (intersects.length == 0) return
    if (!constraints.x && !constraints.y && !constraints.z) {
      plane = { geometry: new three.PlaneGeometry(1000, 1000) }
      plane.mesh = new three.Mesh(plane.geometry,
        new three.MeshBasicMaterial({ side: three.DoubleSide}))
      plane.mesh.position.copy(intersects[0].point)
      plane.mesh.quaternion.copy(drag.startQuaternion)
      console.log(plane.mesh.quaternion)
    }
  })
  let frame = 0
  ecs.on('dragging', (id, drag) => {
    if (currentTool != 'move') return
    selectionGroup.position.set(0, 0, 0)
    if (!plane) return
    direction.set(0, 0, -1)
    direction.applyQuaternion(drag.quaternion)
    raycaster.set(drag.position, direction)
    const intersects = raycaster.intersectObject(plane.mesh)
    frame++
    if (intersects.length == 0) return
    direction.copy(plane.mesh.position)
    direction.sub(intersects[0].point)
    selectionGroup.position.sub(direction)
    selectionGroup.updateMatrixWorld()
  })
  ecs.on('dragging finished', (id, drag) => {
    if (currentTool != 'move' ) return
    selectionGroup.position.set(0, 0, 0)
    if (!plane) return
    // selectionGroup.position.add(drag.deltaPosition)
    // selectionGroup.updateMatrixWorld()
  })
})