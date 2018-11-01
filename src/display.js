// http://seenjs.io
// http://seenjs.io/docco/seen.html

const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  const seen = require('seen')
  seen.Q = (...args) => new seen.Quaternion(...args)
  seen.Quaternion.prototype.multiply = function(q) {
    this.q = seen.P(
      this.q.w * q.q.x + this.q.x * q.q.w
      + this.q.y * q.q.z - this.q.z * q.q.y,
      this.q.w * q.q.y + this.q.y * q.q.w
      + this.q.z * q.q.x - this.q.x * q.q.z,
      this.q.w * q.q.z + this.q.z * q.q.w
      + this.q.x * q.q.y - this.q.y * q.q.x,
      this.q.w * q.q.w - this.q.x * q.q.x
      - this.q.y * q.q.y - this.q.z * q.q.z)
    return this
  }

  let model = null
  let scene = null
  let camera = null
  let cameraOrientation = seen.Q(-0.4893291878182305, -0.5363491731998858, -0.4716018208232713, 0.5004780044647168)
  let cameraPosition = seen.P(12, 0, 0)
  const shapes = {}

  // const lookat = (target) => {
  //   const up = seen.P(0, 1, 0)
  //   const z = cameraPosition.copy().subtract(target).normalize()
  //   const x = up.cross(z).normalize()
  //   const y = z.copy().cross(x)
  //   cameraOrientation = seen.M()
  //   cameraOrientation.m[0] = x.x
  //   cameraOrientation.m[1] = y.x
  //   cameraOrientation.m[2] = z.x

  //   cameraOrientation.m[4] = x.y
  //   cameraOrientation.m[5] = y.y
  //   cameraOrientation.m[6] = z.y

  //   cameraOrientation.m[8] = x.z
  //   cameraOrientation.m[9] = y.z
  //   cameraOrientation.m[10] = z.z
  // }
  // lookat(seen.P(0, 0, 0))

  ecs.on('init', () => {
    const canvas = document.getElementById('root')

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

    camera = new seen.Camera({ projection: seen.Projections.perspectiveFov(60) })
    scene = new seen.Scene({
      model: model,
      viewport: {
        prescale: seen.M(),
        postscale: seen.M()
          .scale(300, 300, 300)
          .translate(canvas.width / 2, canvas.height / 2, 0)
      },
      camera: camera,
      fractionalPoints: true
    })

    ecs.emit('camera orientation', null, cameraOrientation)
    ecs.emit('camera position', null, cameraPosition)
  })

  ecs.on('new sphere body', (id, body) => {
    const shape = seen.Shapes.sphere(1)
    shape._id = id
    shape.scale(1)
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

  let frame = 0
  ecs.on('display delta', (id, dt) => {
    frame++
    if (frame % 60 == 0) console.log(`(${cameraPosition.x.toFixed(2)}, ${cameraPosition.y.toFixed(2)}, ${cameraPosition.z.toFixed(2)}) (${cameraOrientation.q.x.toFixed(2)}, ${cameraOrientation.q.y.toFixed(2)}, ${cameraOrientation.q.z.toFixed(2)}, ${cameraOrientation.q.w.toFixed(2)})`)
    camera.reset()
    const translation = cameraPosition.copy().multiply(-1)
    camera.translate(translation.x, translation.y, translation.z)
    camera.transform(cameraOrientation.toMatrix())
    for (let s of Object.values(shapes)) {
      s.shape.reset()
      const a = s.body.quaternion.toArray()
      s.shape.matrix(seen.Q(...a).toMatrix().m)
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
