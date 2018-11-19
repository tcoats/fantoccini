const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  const keys = {
    one: 49,
    two: 50,
    three: 51,
    four: 52,
    five: 53,
    swap: 81
  }
  let toolCurrent = 'select'
  let toolPrev = 'move'
  let menuIndex = null
  let toolIndex = null
  const menu = [
    ['select', 'info'],
    ['move', 'scale', 'rotate']
  ]
  let timeoutHandle = null
  const commitPrevious = () => {
    menuIndex = null
    toolIndex = null
    timeoutHandle = null
    ecs.emit('tool select', null, {
      current: toolCurrent,
      previous: toolPrev,
      menuIndex: menuIndex,
      toolIndex: toolIndex
    })
  }
  const timeoutCheck = () => {
    if (timeoutHandle) clearTimeout(timeoutHandle)
    else if (toolPrev != toolCurrent) toolPrev = toolCurrent
    timeoutHandle = setTimeout(commitPrevious, 1000)
  }
  const menuCheck = (index) => {
    if (menuIndex == index) {
      toolIndex++
      toolIndex %= menu[menuIndex].length
    } else {
      menuIndex = index
      toolIndex = 0
    }
    toolCurrent = menu[menuIndex][toolIndex]
    ecs.emit('tool select', null, {
      current: toolCurrent,
      previous: toolPrev,
      menuIndex: menuIndex,
      toolIndex: toolIndex
    })
  }
  const onkeyup = (e) => {
    switch (e.keyCode) {
      case keys.one:
        timeoutCheck()
        menuCheck(0)
        break
      case keys.two:
        timeoutCheck()
        menuCheck(1)
        break
      case keys.three:
        timeoutCheck()
        menuCheck(2)
        break
      case keys.four:
        timeoutCheck()
        menuCheck(3)
        break
      case keys.five:
        timeoutCheck()
        menuCheck(4)
        break
      case keys.swap:
        [toolCurrent, toolPrev] = [toolPrev, toolCurrent]
        menuIndex = null
        toolIndex = null
        if (timeoutHandle) {
          clearTimeout(timeoutHandle)
          timeoutHandle = null
        }
        ecs.emit('tool select', null, {
          current: toolCurrent,
          previous: toolPrev,
          menuIndex: menuIndex,
          toolIndex: toolIndex
        })
        break
    }
  }

  ecs.on('load', () => {
    ecs.emit('tools menu', null, menu)
    ecs.emit('tool select', null, {
      current: toolCurrent,
      previous: toolPrev,
      menuIndex: menuIndex,
      toolIndex: toolIndex
    })
  })
  ecs.on('tools enabled', () => {
    document.addEventListener('keyup', onkeyup)
  })
  ecs.on('tools disabled', () => {
    document.removeEventListener('keyup', onkeyup)
  })
})