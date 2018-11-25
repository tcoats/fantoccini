// https://threejs.org/
// https://threejs.org/docs/

const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  const three = require('three')
  const canvas = document.getElementById('canvas')

  let entities = {}
  let worldscene = null
  let renderer = null
  let worldcamera = null
  let axiscamera = null
  let axisscene = null

  let groundMaterial = null
  let boxMaterial = null

  ecs.on('init', () => {
    worldcamera = new three.PerspectiveCamera(
      75, canvas.width / canvas.height, 0.1, 1000)
    worldscene = new three.Scene()
    groundMaterial = new three.MeshLambertMaterial({ color: 0xFD9148 })
    boxMaterial = new three.MeshLambertMaterial({ color: 0x6297D0 })
    // worldscene.fog = new three.Fog(0xffffff, 0, 200)

    // Three Point Lighting
    const keyLight = new three.DirectionalLight(0xffffff, 1)
    keyLight.position.set(-1, 1, 1)
    worldscene.add(keyLight)

    const fillLight = new three.DirectionalLight(0xffffff, 0.5)
    fillLight.position.set(1, 1, -1)
    worldscene.add(fillLight)

    const backLight = new three.AmbientLight(0xffffff, 0.2)
    worldscene.add(backLight)

    renderer = new three.WebGLRenderer({ canvas: canvas })
    renderer.shadowMap.enabled = true
    renderer.shadowMapSoft = true
    renderer.setSize(canvas.width, canvas.height, false)
    renderer.setClearColor(0xffffff, 1)
    renderer.autoClear = false

    axiscamera = new three.OrthographicCamera(-1, 1, 1, -1, 0, 2)
    axisscene = new three.Scene()
    axisscene.add(new three.AmbientLight(0x111111))
    axisscene.add(new three.AxesHelper(1))
  })

  ecs.on('load', () => {
    ecs.emit('load world camera', null, worldcamera)
    ecs.emit('load world scene', null, worldscene)
  })

  ecs.on('load ground', (id, ground) => {
    ground.geometry = new three.PlaneGeometry(3000, 3000, 50, 50)
    ground.geometry.applyMatrix(new three.Matrix4().makeRotationX(-Math.PI / 2))
    ground.mesh = new three.Mesh(ground.geometry, groundMaterial)
    ground.mesh.castShadow = true
    ground.mesh.receiveShadow = true
    ground.mesh.ecsid = id
    ground.selectable = false
    worldscene.add(ground.mesh)
    entities[id] = ground
  })

  ecs.on('load camera', (id, camera) => {
    camera.body = new three.Object3D()
    camera.body.ecsid = id
    camera.selectable = false
    worldscene.add(camera.body)
    camera.head = new three.Object3D()
    camera.head.add(worldcamera)
    camera.body.position.y = 2
    camera.body.add(camera.head)
    entities[id] = camera
  })

  let menuopen = false
  ecs.on('menu open', () => {
    worldcamera.layers.enable(1)
    menuopen = true
  })
  ecs.on('menu close', () => {
    worldcamera.layers.disable(1)
    menuopen = false
  })

  ecs.on('load box', (id, box) => {
    const halfExtents = box.halfExtents
      ? box.halfExtents : new three.Vector3(1, 1, 1)
    box.geometry = new three.BoxGeometry(
      halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2)
    box.mesh = new three.Mesh(box.geometry, boxMaterial)
    box.mesh.ecsid = id
    worldscene.add(box.mesh)
    box.mesh.castShadow = true
    box.mesh.receiveShadow = true
    entities[id] = box
  })

  ecs.on('delete', (id) => {
    if (entities[id]) {
      if (entities[id].mesh) worldscene.remove(entities[id].mesh)
      delete entities[id]
    }
  })

  ecs.on('display delta', (id, dt) => {
    // if (id % 60 == 0) console.log('rendering')
    worldcamera.getWorldQuaternion(axiscamera.quaternion)
    axiscamera.position.set(0, 0, 1)
    axiscamera.position.applyQuaternion(axiscamera.quaternion)
    renderer.clear(true, true, true)
    renderer.setViewport(0, 0, canvas.width, canvas.height)
    renderer.render(worldscene, worldcamera)
    renderer.clear(false, true, false)
    renderer.setViewport(10, canvas.height - 60, 50, 50)
    renderer.render(axisscene, axiscamera)
  })
})
