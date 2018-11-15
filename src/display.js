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

  let groundMaterial = null
  let boxMaterial = null

  ecs.on('init', () => {
    worldcamera = new three.PerspectiveCamera(
      75, canvas.width / canvas.height, 0.1, 1000)
    world = new three.Scene()
    groundMaterial = new three.MeshLambertMaterial({ color: 0xFD9148 })
    boxMaterial = new three.MeshLambertMaterial({ color: 0x6297D0 })
    // world.fog = new three.Fog(0xffffff, 0, 200)

    // Three Point Lighting
    const keyLight = new three.DirectionalLight(0xffffff, 1)
    keyLight.position.set(-1, 1, 1)
    world.add(keyLight)

    const fillLight = new three.DirectionalLight(0xffffff, 0.5)
    fillLight.position.set(1, 1, -1)
    world.add(fillLight)

    const backLight = new three.AmbientLight(0xffffff, 0.2)
    world.add(backLight)

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
  })

  ecs.on('load ground', (id, ground) => {
    ground.geometry = new three.PlaneGeometry(3000, 3000, 50, 50)
    ground.geometry.applyMatrix(new three.Matrix4().makeRotationX(-Math.PI / 2))
    ground.mesh = new three.Mesh(ground.geometry, groundMaterial)
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
    box.mesh = new three.Mesh(box.geometry, boxMaterial)
    world.add(box.mesh)
    box.mesh.castShadow = true
    box.mesh.receiveShadow = true
    entities[id] = box
  })

  const raycast = (coords, camera) => {
    const raycaster = new three.Raycaster()
    raycaster.setFromCamera(crosshair, camera)
    return raycaster.intersectObjects(world.children)
  }

  ecs.on('delete', (id) => {
    if (entities[id]) delete entities[id]
  })

  const crosshair = new three.Vector2(0, 0)
  ecs.on('display delta', (id, dt) => {
    const intersects = raycast(crosshair, worldcamera)
    if (intersects.length > 0) {
      const spotlight = intersects[0]
      console.log(spotlight.object.id)
    }
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
