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
  const onxaxisdown = () => {
    if (pressedxaxis) return
    pressedxaxis = true
    onaxisdown()
  }
  const onyaxisdown = () => {
    if (pressedyaxis) return
    pressedyaxis = true
    onaxisdown()
  }
  const onzaxisdown = () => {
    if (pressedzaxis) return
    pressedzaxis = true
    onaxisdown()
  }
  const onxaxisup = () => {
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
  }
  const onyaxisup = () => {
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
  }
  const onzaxisup = () => {
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
  }
  const onkeydown = (e) => {
    switch (e.keyCode) {
      case keys.xaxis: onxaxisdown(); break;
      case keys.yaxis: onyaxisdown(); break;
      case keys.zaxis: onzaxisdown(); break;
    }
  }
  const onkeyup = (e) => {
    switch (e.keyCode) {
      case keys.xaxis: onxaxisup(); break;
      case keys.yaxis: onyaxisup(); break;
      case keys.zaxis: onzaxisup(); break;
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