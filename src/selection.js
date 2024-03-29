const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  const three = require('three')

  const crosshair = new three.Vector2(0, 0)

  let worldscene = null
  let worldcamera = null
  let selectionGroup = new three.Group()
  ecs.on('load world scene', (id, scene) => {
    worldscene = scene
    worldscene.add(selectionGroup)
  })
  ecs.on('load world camera', (id, camera) => worldcamera = camera)

  ecs.on('load', () => {
    ecs.emit('load selection group', null, selectionGroup)
  })

  const entities = {}
  ecs.on('load box', (id, box) => entities[id] = box)
  ecs.on('delete', (id) => {
    if (entities[id]) delete entities[id]
  })

  let spotlight = null
  const layersToSpotlight = new three.Layers()
  ecs.on('clear spotlight', () => {
    worldscene.remove(spotlight.mesh)
    spotlight = null
    ecs.emit('spotlight clear')
  })
  const setSpotlight = (intersects) => {
    let entity = null
    for (let intersect of intersects) {
      const ecsid = intersect.object.ecsid
      if (ecsid && entities[ecsid]) {
        const e = entities[ecsid]
        if (!e.mesh.layers.test(layersToSpotlight)) continue
        entity = e
        break
      }
    }
    if (!entity) {
      if (spotlight) ecs.emit('clear spotlight')
      return
    }
    if (spotlight && entity.id != spotlight.id) {
      worldscene.remove(spotlight.mesh)
      spotlight = null
    }
    if (!spotlight) {
      spotlight = { id: entity.id, entity: entity }
      spotlight.geometry = new three.EdgesGeometry(entity.geometry)
      spotlight.mesh = new three.LineSegments(spotlight.geometry)
      spotlight.mesh.material.depthTest = false
      spotlight.mesh.material.color = new three.Color(0xffffff)
      spotlight.mesh.material.linewidth = 3
      spotlight.mesh.layers.set(1)
      worldscene.add(spotlight.mesh)
      ecs.emit('spotlight set', entity.id, spotlight)
    }
  }

  let selected = {}
  let currentTool = null
  ecs.on('tool select', (id, tool) => currentTool = tool.current)
  ecs.on('remove selection', (id) => {
    worldscene.remove(selected[id].mesh)
    selectionGroup.remove(selected[id].entity.mesh)
    worldscene.add(selected[id].entity.mesh)
    delete selected[id]
    ecs.emit('selection removed', id)
  })
  ecs.on('add selection', (id, entity) => {
    const selection = { id: id, entity: entity }
    selection.geometry = new three.EdgesGeometry(selection.entity.geometry)
    selection.mesh = new three.LineSegments(selection.geometry)
    selection.mesh.material.depthTest = false
    selection.mesh.material.color = new three.Color(0xffffff)
    selection.mesh.material.linewidth = 1
    // selection.mesh.layers.set(1)
    selected[selection.id] = selection
    worldscene.add(selection.mesh)
    worldscene.remove(entity.mesh)
    selectionGroup.add(entity.mesh)
    ecs.emit('selection added', selection.id, selection)
  })
  ecs.on('pointer click', (id, e) => {
    if (currentTool != 'select') return
    if (!spotlight) return
    if (selected[spotlight.id])
      return ecs.emit('remove selection', spotlight.id)
    ecs.emit('add selection', spotlight.id, spotlight.entity)
  })

  ecs.on('delete', (id) => {
    if (selected[id]) ecs.emit('remove selection', id)
    if (spotlight && spotlight.id == id) ecs.emit('spotlight clear')
  })

  let isdragging = false
  ecs.on('dragging started', () => isdragging = true)
  ecs.on('dragging finished', () => isdragging = false)
  const raycaster = new three.Raycaster()
  ecs.on('physics to display delta', (id, dt) => {
    // if (id % 60 == 0) console.log('copying position')
    if (!isdragging) {
      raycaster.setFromCamera(crosshair, worldcamera)
      setSpotlight(raycaster.intersectObjects(
        Object.values(entities).map(e => e.mesh)))
    }
    if (spotlight) {
      spotlight.entity.mesh.getWorldPosition(spotlight.mesh.position)
      spotlight.entity.mesh.getWorldQuaternion(spotlight.mesh.quaternion)
    }
    for (let selection of Object.values(selected)) {
      selection.entity.mesh.getWorldPosition(selection.mesh.position)
      selection.entity.mesh.getWorldQuaternion(selection.mesh.quaternion)
    }
  })
})