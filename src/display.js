// https://threejs.org/
// https://threejs.org/docs/

const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  const three = require('three')
  const canvas = document.getElementById('canvas')

  let entities = {}
  let world = null
  let renderer = null
  let worldcamera = null
  let axiscamera = null
  let axisscene = null

  ecs.on('init', () => {
    worldcamera = new three.PerspectiveCamera(
      75, canvas.width / canvas.height, 0.1, 1000)
    world = new three.Scene()
    material = new three.MeshLambertMaterial({ color: 0xdddddd })
    world.fog = new three.Fog(0x000000, 0, 500)
    const ambient = new three.AmbientLight(0x111111)
    world.add(ambient)
    light = new three.SpotLight(0xffffff)
    light.position.set(10, 30, 20)
    light.target.position.set(0, 0, 0)
    light.castShadow = true
    light.shadow.camera.cear = 20
    light.shadow.camera.far = 50
    light.shadow.camera.fov = 40
    light.shadowMapBias = 0.1
    light.shadowMapDarkness = 0.7
    light.shadow.mapSize.width = 2 * 512
    light.shadow.mapSize.height = 2 * 512
    world.add(light)
    // world.add(new three.AxesHelper(1))

    renderer = new three.WebGLRenderer({ canvas: canvas })
    renderer.shadowMap.enabled = true
    renderer.shadowMapSoft = true
    renderer.setSize(canvas.width, canvas.height, false)
    renderer.setClearColor(0x000000, 1)
    renderer.autoClear = false

    axiscamera = new three.OrthographicCamera(-1, 1, 1, -1, 0, 2)
    axisscene = new three.Scene()
    axisscene.add(new three.AmbientLight(0x111111))
    axisscene.add(new three.AxesHelper(1))
  })

  ecs.on('load', () => {
    ecs.emit('load world camera', null, worldcamera)
  })

  ecs.on('load ground', (id, ground) => {
    ground.geometry = new three.PlaneGeometry(300, 300, 50, 50)
    ground.geometry.applyMatrix(new three.Matrix4().makeRotationX(-Math.PI / 2))
    ground.mesh = new three.Mesh(ground.geometry, material)
    ground.mesh.castShadow = true
    ground.mesh.receiveShadow = true
    world.add(ground.mesh)
    entities[id] = ground
  })

  ecs.on('load camera', (id, camera) => {
    camera.body = new three.Object3D()
    world.add(camera.body)
    camera.head = new three.Object3D()
    camera.head.add(worldcamera)
    camera.body.position.y = 2
    camera.body.add(camera.head)
  })

  ecs.on('load box', (id, box) => {
    const halfExtents = box.halfExtents
      ? box.halfExtents : new three.Vector3(1, 1, 1)
    box.geometry = new three.BoxGeometry(
      halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2)
    box.mesh = new three.Mesh(box.geometry, material)
    world.add(box.mesh)
    box.mesh.castShadow = true
    box.mesh.receiveShadow = true
    entities[id] = box
  })

  ecs.on('delete', (id) => {
    if (entities[id]) delete entities[id]
  })

  ecs.on('display delta', (id, dt) => {
    worldcamera.getWorldQuaternion(axiscamera.quaternion)
    axiscamera.position.set(0, 0, 1)
    axiscamera.position.applyQuaternion(axiscamera.quaternion)
    renderer.clear(true, true, true)
    renderer.setViewport(0, 0, canvas.width, canvas.height)
    renderer.render(world, worldcamera)
    renderer.clear(false, true, false)
    renderer.setViewport(0, canvas.height - 50, 50, 50)
    renderer.render(axisscene, axiscamera)
  })
})
