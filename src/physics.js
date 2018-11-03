// http://schteppe.github.io/cannon.js/
// http://schteppe.github.io/cannon.js/docs/

const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  const cannon = require('cannon')

  let world = null
  let entities = {}

  ecs.on('init', () => {
    world = new cannon.World()
    world.quatNormalizeSkip = 0
    world.quatNormalizeFast = false
    const solver = new cannon.GSSolver()
    world.defaultContactMaterial.contactEquationStiffness = 1e9
    world.defaultContactMaterial.contactEquationRelaxation = 4
    solver.iterations = 7
    solver.tolerance = 0.1
    world.solver = new cannon.SplitSolver(solver)
    world.gravity.set(0,-9.8,0)
    world.broadphase = new cannon.NaiveBroadphase()

    const physicsMaterial = new cannon.Material('slipperyMaterial')
    world.addContactMaterial(
      new cannon.ContactMaterial(physicsMaterial, physicsMaterial, 0.0, 0.3))

  })

  ecs.on('load ground', (id, ground) => {
    ground.shape = new cannon.Plane()
    ground.body = new cannon.Body({ mass: 0 })
    ground.body.addShape(ground.shape)
    ground.body.quaternion.setFromAxisAngle(
      new cannon.Vec3(1, 0, 0), -Math.PI / 2)
    world.addBody(ground.body)
    // entities[id] = ground
  })

  ecs.on('load player', (id, player) => {
    player.shape = new cannon.Sphere(1.3)
    player.physics = new cannon.Body({ mass: 5 })
    player.physics.addShape(player.shape)
    player.physics.position.set(0, 5, 0)
    player.physics.linearDamping = 0.9
    world.addBody(player.physics)
  })

  ecs.on('load box', (id, box) => {
    const halfExtents = new cannon.Vec3(1, 1, 1)
    box.shape = new cannon.Box(halfExtents)
    box.body = new cannon.Body({ mass: 5 })
    box.body.addShape(box.shape)
    box.body.position.set(
      (Math.random() - 0.5) * 20,
      1 + (Math.random() - 0.5) * 1,
      (Math.random() - 0.5) * 20)
    world.addBody(box.body)
    entities[id] = box
  })

  ecs.on('delete', (id) => {
    if (entities[id]) {
      world.removeBody(entities[id])
      delete entities[id]
    }
  })

  ecs.on('physics delta', (id, dt) => {
    world.step(1.0 / 60.0, dt / 1000, 3)
    for (let shape of Object.values(entities)) {
      shape.mesh.position.copy(shape.body.position)
      shape.mesh.quaternion.copy(shape.body.quaternion)
    }
  })
})
