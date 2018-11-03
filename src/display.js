// https://threejs.org/
// https://threejs.org/docs/

const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  const three = require('three')
  const canvas = document.getElementById('root')

  let entities = {}
  let camera = null
  let scene = null
  let renderer = null

  ecs.on('init', () => {
    camera = new three.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000)
    scene = new three.Scene()
    material = new three.MeshLambertMaterial({ color: 0xdddddd })
    scene.fog = new three.Fog(0x000000, 0, 500)
    const ambient = new three.AmbientLight(0x111111)
    scene.add(ambient)
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
    scene.add(light)

    renderer = new three.WebGLRenderer({ canvas: canvas })
    renderer.shadowMap.enabled = true
    renderer.shadowMapSoft = true
    renderer.setSize(645, 405)
    renderer.setClearColor(scene.fog.color, 1)
  })

  ecs.on('load ground', (id, ground) => {
    ground.geometry = new three.PlaneGeometry(300, 300, 50, 50)
    ground.geometry.applyMatrix(new three.Matrix4().makeRotationX(-Math.PI / 2))
    ground.mesh = new three.Mesh(ground.geometry, material)
    ground.mesh.castShadow = true
    ground.mesh.receiveShadow = true
    scene.add(ground.mesh)
    entities[id] = ground
  })

  ecs.on('load player', (id, player) => {
    player.body = new three.Object3D()
    scene.add(player.body)
    player.head = new three.Object3D()
    player.head.add(camera)
    player.body.position.y = 2
    player.body.add(player.head)
  })

  ecs.on('load box', (id, box) => {
    const halfExtents = new three.Vector3(1, 1, 1)
    box.geometry = new three.BoxGeometry(
      halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2)
    box.mesh = new three.Mesh(box.geometry, material)
    scene.add(box.mesh)
    box.mesh.castShadow = true
    box.mesh.receiveShadow = true
    entities[id] = box
  })

  ecs.on('delete', (id) => {
    if (entities[id]) delete entities[id]
  })

  ecs.on('display delta', (id, dt) => {
    renderer.render(scene, camera)
  })
})
