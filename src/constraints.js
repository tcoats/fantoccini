const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  const keys = {
    xaxis: 90,
    yaxis: 88,
    zaxis: 67
  }
  let pressedxaxis = false
  let pressedyaxis = false
  let pressedzaxis = false
  let constraints = { x: false, y: false, z: false }
  let constrainedAt = null
  let constraintsPrev = null

  const onaxisdown = () => {
    if (!constrainedAt) {
      constrainedAt = Date.now()
      constraintsPrev = constraints
    }
    ecs.emit('constrain axis', null, {
      x: !pressedxaxis,
      y: !pressedyaxis,
      z: !pressedzaxis
    })
  }
  const onkeydown = (e) => {
    switch (e.keyCode) {
      case keys.xaxis:
        if (pressedxaxis) return
        pressedxaxis = true
        onaxisdown()
        break
      case keys.yaxis:
        if (pressedyaxis) return
        pressedyaxis = true
        onaxisdown()
        break
      case keys.zaxis:
        if (pressedzaxis) return
        pressedzaxis = true
        onaxisdown()
        break
    }
  }
  const onkeyup = (e) => {
    switch (e.keyCode) {
      case keys.xaxis:
        pressedxaxis = false
        if (!constrainedAt || Date.now() - constrainedAt < 200) {
          ecs.emit('constrain axis', null, {
            x: !constraintsPrev.x,
            y: constraintsPrev.y,
            z: constraintsPrev.z
          })
          constraintsPrev = constraints
          constrainedAt = null
        } else if (!pressedyaxis && !pressedzaxis) {
          ecs.emit('constrain axis', null, constraintsPrev)
          constrainedAt = null
        } else ecs.emit('constrain axis', null, {
          x: true,
          y: constraints.y,
          z: constraints.z
        })
        break
      case keys.yaxis:
        pressedyaxis = false
        if (!constrainedAt || Date.now() - constrainedAt < 200) {
          ecs.emit('constrain axis', null, {
            x: constraintsPrev.x,
            y: !constraintsPrev.y,
            z: constraintsPrev.z
          })
          constraintsPrev = constraints
          constrainedAt = null
        } else if (!pressedxaxis && !pressedzaxis) {
          ecs.emit('constrain axis', null, constraintsPrev)
          constrainedAt = null
        } else ecs.emit('constrain axis', null, {
          x: constraints.x,
          y: true,
          z: constraints.z
        })
        break
      case keys.zaxis:
        pressedzaxis = false
        if (!constrainedAt || Date.now() - constrainedAt < 200) {
          ecs.emit('constrain axis', null, {
            x: constraintsPrev.x,
            y: constraintsPrev.y,
            z: !constraintsPrev.z
          })
          constraintsPrev = constraints
          constrainedAt = null
        } else if (!pressedxaxis && !pressedyaxis) {
          ecs.emit('constrain axis', null, constraintsPrev)
          constrainedAt = null
        } else ecs.emit('constrain axis', null, {
          x: constraints.x,
          y: constraints.y,
          z: true
        })
        break
    }
  }

  ecs.on('constrain axis', (id, c) => constraints = c)
  ecs.on('pointer captured', () => {
    document.addEventListener('keydown', onkeydown)
    document.addEventListener('keyup', onkeyup)
  })
  ecs.on('pointer released', () => {
    document.removeEventListener('keydown', onkeydown)
    document.removeEventListener('keyup', onkeyup)
  })
})