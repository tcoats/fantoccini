const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  const seen = require('seen')

  let canvas = null
  let model = null
  let projection = null
  let scene = null
  const shapes = {}

  ecs.on('init', () => {
    canvas = document.getElementById('root')

    model = new seen.Model()
    model._id = ecs.id()
    model.add(seen.Lights.directional({
      normal: seen.P(-1, 1, 1).normalize(),
      color: seen.Colors.hsl(0.1, 0.3, 0.7),
      intensity : 0.002
    }))
    model.add(seen.Lights.directional({
      normal: seen.P(1, 1, -1).normalize(),
      intensity: 0.001
    }))
    model.add(seen.Lights.ambient({
      intensity: 0.0015
    }))

    projection = seen.Projections.perspective(-1, 1, -1, 1)

    scene = new seen.Scene({
      model: model,
      viewport: seen.Viewports.center(canvas.width, canvas.height),
      camera: new seen.Camera({ projection: projection }),
      fractionalPoints: true
    })
  })

  ecs.on('new sphere body', (id, body) => {
    const shape = seen.Shapes.sphere(1)
    shape._id = id
    shape.scale(canvas.height * 0.4)
    shape.bake()
    model.add(shape)
    shapes[id] = { shape: shape, body: body }
  })

  ecs.on('delete', (id) => {
    if (shapes[id]) {
      model.remove(shapes[id].shape)
      delete shapes[id]
    }
  })

  ecs.on('display delta', (id, dt) => {
    for (let s of Object.values(shapes)) {
      s.shape.reset()
      const a = s.body.quaternion.toArray()
      s.shape.matrix(new seen.Quaternion(...a).toMatrix().m)
      const p = s.body.position
      s.shape.translate(p.x, p.y, p.z)
    }
  })

  ecs.on('start', () => {
    const context = seen.Context('root')
    context.sceneLayer(scene)
    const animator = context.animate()
    animator.onBefore((t, dt) => {
      ecs.emit('event delta', null, dt)
      ecs.emit('physics delta', null, dt)
      ecs.emit('display delta', null, dt)
    })
    animator.start()
  })
})
