const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  const THREE = require('three')
  const CANNON = require('cannon')
  const canvas = document.getElementById('root')
  let player, world, boxes=[], boxMeshes=[]
  let camera, scene, renderer
  let geometry, material, mesh
  let element = document.body

  ecs.on('init', () => {
    world = new CANNON.World()
    world.quatNormalizeSkip = 0
    world.quatNormalizeFast = false
    const solver = new CANNON.GSSolver()
    world.defaultContactMaterial.contactEquationStiffness = 1e9
    world.defaultContactMaterial.contactEquationRelaxation = 4
    solver.iterations = 7
    solver.tolerance = 0.1
    world.solver = new CANNON.SplitSolver(solver)
    world.gravity.set(0,-9.8,0)
    world.broadphase = new CANNON.NaiveBroadphase()

    // world = new CANNON.World()
    // world.defaultContactMaterial.contactEquationStiffness = 1e6
    // world.defaultContactMaterial.contactEquationRegularizationTime = 3
    // world.solver.iterations = 20
    // world.gravity.set(0, -9.82, 0)
    // world.allowSleep = false
    // world.broadphase = new CANNON.SAPBroadphase(world)

    const physicsMaterial = new CANNON.Material('slipperyMaterial')
    world.addContactMaterial(
      new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, 0.0, 0.3))

    const groundShape = new CANNON.Plane()
    const groundBody = new CANNON.Body({ mass: 0 })
    groundBody.addShape(groundShape)
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    world.addBody(groundBody)
    camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000)
    scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x000000, 0, 500)
    const ambient = new THREE.AmbientLight(0x111111)
    scene.add(ambient)
    light = new THREE.SpotLight(0xffffff)
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

    player = {}
    player.shape = new CANNON.Sphere(1.3)
    player.physics = new CANNON.Body({ mass: 5 })
    player.physics.addShape(player.shape)
    player.physics.position.set(0, 5, 0)
    // player.physics.linearDamping = 0.9
    world.addBody(player.physics)

    player.body = new THREE.Object3D()
    scene.add(player.body)
    player.head = new THREE.Object3D()
    player.head.add(camera)
    player.body.position.y = 2
    player.body.add(player.head)
    ecs.emit('player', null, player)

    geometry = new THREE.PlaneGeometry(300, 300, 50, 50)
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2))
    material = new THREE.MeshLambertMaterial({ color: 0xdddddd })
    mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    scene.add(mesh)

    renderer = new THREE.WebGLRenderer({ canvas: canvas })
    renderer.shadowMap.enabled = true
    renderer.shadowMapSoft = true
    renderer.setSize(645, 405)
    renderer.setClearColor(scene.fog.color, 1)
    const halfExtents = new CANNON.Vec3(1, 1, 1)
    const boxShape = new CANNON.Box(halfExtents)
    const boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2)
    for (let i = 0; i < 7; i++) {
      const x = (Math.random()-0.5)*20
      const y = 1 + (Math.random()-0.5)*1
      const z = (Math.random()-0.5)*20
      const boxBody = new CANNON.Body({ mass: 5 })
      boxBody.addShape(boxShape)
      const boxMesh = new THREE.Mesh(boxGeometry, material)
      world.addBody(boxBody)
      scene.add(boxMesh)
      boxBody.position.set(x, y, z)
      boxMesh.position.set(x, y, z)
      boxMesh.castShadow = true
      boxMesh.receiveShadow = true
      boxes.push(boxBody)
      boxMeshes.push(boxMesh)
    }
  })

  // ecs.on('new sphere body', (id, body) => {
  //   const shape = seen.Shapes.sphere(1)
  //   shape._id = id
  //   shape.scale(1)
  //   shape.bake()
  //   model.add(shape)
  //   shapes[id] = { shape: shape, body: body }
  // })

  // ecs.on('delete', (id) => {
  //   if (shapes[id]) {
  //     model.remove(shapes[id].shape)
  //     delete shapes[id]
  //   }
  // })

  ecs.on('physics delta', (id, dt) => {
    world.step(1.0 / 60.0, dt / 1000, 3)
    for (let i = 0; i < boxes.length; i++) {
      boxMeshes[i].position.copy(boxes[i].position)
      boxMeshes[i].quaternion.copy(boxes[i].quaternion)
    }
  })
  ecs.on('display delta', (id, dt) => {
    renderer.render(scene, camera)
  })
})
