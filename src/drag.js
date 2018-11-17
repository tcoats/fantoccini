const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  const three = require('three')

  let dragStartPosition = new three.Vector3()
  let dragStartQuaternion = new three.Quaternion()
  let mouseIsDown = false
  let mouseDownAt = null
  let worldcamera = null
  const dragPosition = new three.Vector3()
  const dragQuaternion = new three.Quaternion()
  const dragDeltaPosition = new three.Vector3()
  const dragDeltaQuaternion = new three.Quaternion()
  const dragCalc = () => {
    worldcamera.getWorldPosition(dragPosition)
    worldcamera.getWorldQuaternion(dragQuaternion)
    dragDeltaPosition.copy(dragPosition).sub(dragStartPosition)
    dragDeltaQuaternion.copy(dragStartQuaternion).inverse().multiply(dragQuaternion)
    return {
      startPosition: dragStartPosition,
      startQuaternion: dragStartQuaternion,
      deltaPosition: dragDeltaPosition,
      deltaQuaternion: dragDeltaQuaternion,
      position: dragPosition,
      quaternion: dragQuaternion
    }
  }
  const onmousedown = (e) => {
    mouseIsDown = true
    mouseDownAt = Date.now()
    worldcamera.getWorldPosition(dragStartPosition)
    worldcamera.getWorldQuaternion(dragStartQuaternion)
  }
  const onmouseup = (e) => {
    mouseIsDown = false
    if (mouseDownAt && Date.now() - mouseDownAt < 200) {
      mouseDownAt = null
      ecs.emit('pointer click')
      return
    }
    const drag = dragCalc()
    ecs.emit('dragging finished', null, drag)
  }
  const onmove = (e) => {
    if (!mouseIsDown) return
    const drag = dragCalc()
    if (mouseDownAt && (Date.now() - mouseDownAt > 200 || drag.deltaPosition.lengthSq() > 0.1 || drag.deltaQuaternion.lengthSq() > 0.1))
      mouseDownAt = null
  }
  ecs.on('load world camera', (id, c) => worldcamera = c)
  ecs.on('pointer captured', () => {
    document.addEventListener('mousedown', onmousedown)
    document.addEventListener('mouseup', onmouseup)
    document.addEventListener('mousemove', onmove)
  })
  ecs.on('pointer released', () => {
    document.removeEventListener('mousedown', onmousedown)
    document.removeEventListener('mouseup', onmouseup)
    document.removeEventListener('mousemove', onmove)
  })
  ecs.on('event delta', (id, dt) => {
    if (mouseIsDown) {
      if (mouseDownAt && (Date.now() - mouseDownAt > 200))
        mouseDownAt = null
      if (!mouseDownAt) ecs.emit('dragging', null, dragCalc())
    }
  })
})