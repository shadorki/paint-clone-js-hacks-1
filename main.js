// State
const state = {
  selectedColor: null,
  selectedTool: null,
  drawnHistory: [],
  currentEvents: [],
  mouseCoords: {
    x: 0,
    y: 0
  },
  linePoint: {
    startingX: null,
    startingY: null,
    endingX: null,
    endingY: null
  },
  rectanglePoint: {
    startingX: null,
    startingY: null,
    width: null,
    height: null
  },
  circlePoint: {
    startingX: null,
    startingY: null,
    radius: null
  },
  globalAlpha: 1
}


// DOM Elements
const $toolBarContainer = document.querySelector('.tool-bar')
const $colorPalette = document.querySelector('.color-palette')
const $currentColor = document.querySelector('.current-color')
const $optionsContainer = document.querySelector('.options')
const $canvas = document.querySelector('#realCanvas')
const $fakeCanvas = document.querySelector('#fakeCanvas')
const $opacitySlider = document.getElementById('opacity-slider')

// initialization
const ctx = $canvas.getContext('2d')
const fakeCtx = $fakeCanvas.getContext('2d')
init()

// Events
$optionsContainer.addEventListener('click', handleOption)
$colorPalette.addEventListener('click', switchColor)
$toolBarContainer.addEventListener('click', switchTool)
$opacitySlider.addEventListener('input', setGlobalAlpha)

function init() {
  // setup toolbar images
  for(let i = 0; i < $toolBarContainer.children.length; i++) {
    const toolElement = $toolBarContainer.children[i]
    const { tool } =  toolElement.dataset
    toolElement.style.backgroundImage = `url('assets/images/icons/${tool}.png')`
  }
  // setup color palette
  for (let i = 0; i < $colorPalette.children.length; i++) {
    const colorElement = $colorPalette.children[i]
    const { color } = colorElement.dataset
    colorElement.style.backgroundColor = color
  }
  // setup initial selected color
  if(state.selectedColor === null) {
    state.selectedColor = 'black'
  }
  $currentColor.style.backgroundColor = state.selectedColor
  // setup initial selected tool
  if(state.selectedTool === null) {
    state.selectedTool = document.querySelector('div[data-tool=pencil]')
  } else {
    state.selectedTool = document.querySelector(`div[data-tool=${state.selectedTool}]`)
  }
  state.selectedTool.classList.add('selected')
  setCanvasListenersBasedOffTool(state.selectedTool.dataset.tool)
}

function handleOption(e) {
  if(!('option' in e.target.dataset)) return;
  const { option } = e.target.dataset
  const optionsHandler = {
    reset,
    export: null,
    save: null
  }
  optionsHandler[option]()
}

function reset() {
  state.drawnHistory = []
  clearCanvas()
}

function draw(e) {
  if (e.buttons !== 1) return;
  ctx.globalAlpha = state.globalAlpha
  ctx.beginPath()
  ctx.strokeStyle = state.selectedColor
  ctx.lineWidth = 3
  const startingX = state.mouseCoords.x
  const startingY = state.mouseCoords.y
  ctx.moveTo(startingX, startingY)
  setMouseCoords(e)
  ctx.lineTo(state.mouseCoords.x, state.mouseCoords.y)
  ctx.stroke()
  saveDrawing('line', state.selectedColor, 3, startingX, startingY, state.globalAlpha, state.mouseCoords.x, state.mouseCoords.y)
}
function brush(e) {
  if(e.buttons !== 1) return;
  setMouseCoords(e)
  ctx.beginPath();
  ctx.globalAlpha = state.globalAlpha
  ctx.arc(state.mouseCoords.x, state.mouseCoords.y, 10, 0, 2 * Math.PI);
  ctx.fillStyle = state.selectedColor
  ctx.strokeStyle = state.selectedColor
  ctx.fill()
  ctx.stroke();
  saveDrawing('solid-circle', state.selectedColor, 10, state.mouseCoords.x, state.mouseCoords.y, state.globalAlpha)
}

function line(e) {
  if (e.buttons !== 1) return;
  clearFakeCanvas()
  fakeCtx.globalAlpha = state.globalAlpha
  fakeCtx.beginPath()
  fakeCtx.strokeStyle = state.selectedColor
  fakeCtx.lineWidth = 3
  const {startingX, startingY, endingX, endingY} = state.linePoint
  if(startingX === null && startingY === null) {
    const bounds = e.target.getBoundingClientRect()
    state.linePoint.startingX = e.clientX - Math.floor(bounds.left)
    state.linePoint.startingY = e.clientY - Math.floor(bounds.top)
  }
  fakeCtx.moveTo(state.linePoint.startingX, state.linePoint.startingY)
  setMouseCoords(e)
  fakeCtx.lineTo(state.mouseCoords.x, state.mouseCoords.y)
  fakeCtx.stroke()
}

function lineMouseUp(e) {
  clearFakeCanvas()
  const bounds = e.target.getBoundingClientRect()
  ctx.beginPath()
  ctx.globalAlpha = state.globalAlpha
  ctx.strokeStyle = state.selectedColor
  ctx.lineWidth = 3
  state.linePoint.endingX = e.clientX - Math.floor(bounds.left)
  state.linePoint.endingY = e.clientY - Math.floor(bounds.top)
  ctx.moveTo(state.linePoint.startingX, state.linePoint.startingY)
  ctx.lineTo(state.linePoint.endingX, state.linePoint.endingY)
  ctx.stroke()
  saveDrawing('line', state.selectedColor, 3, state.linePoint.startingX, state.linePoint.startingY, state.globalAlpha, state.linePoint.endingX, state.linePoint.endingY)
  state.linePoint.startingX = null
  state.linePoint.startingY = null
  state.linePoint.endingX = null
  state.linePoint.endingY = null
}

function rectangle(e) {
  if (e.buttons !== 1) return;
  clearFakeCanvas()
  fakeCtx.globalAlpha = state.globalAlpha
  fakeCtx.beginPath()
  fakeCtx.strokeStyle = state.selectedColor
  fakeCtx.lineWidth = 3
  const {startingX, startingY} = state.rectanglePoint
  if(startingX === null && startingY === null) {
    const bounds = e.target.getBoundingClientRect()
    state.rectanglePoint.startingX = e.clientX - Math.floor(bounds.left)
    state.rectanglePoint.startingY = e.clientY - Math.floor(bounds.top)
  }
  setMouseCoords(e)
  state.rectanglePoint.width = state.mouseCoords.x - state.rectanglePoint.startingX
  state.rectanglePoint.height = state.mouseCoords.y - state.rectanglePoint.startingY
  fakeCtx.rect(state.rectanglePoint.startingX, state.rectanglePoint.startingY, state.rectanglePoint.width, state.rectanglePoint.height)
  fakeCtx.stroke()
}
function rectangleMouseUp() {
  clearFakeCanvas()
  ctx.beginPath()
  ctx.globalAlpha = state.globalAlpha
  ctx.strokeStyle = state.selectedColor
  ctx.lineWidth = 3
  ctx.rect(state.rectanglePoint.startingX, state.rectanglePoint.startingY, state.rectanglePoint.width, state.rectanglePoint.height)
  saveDrawing('rectangle', state.selectedColor, 3, state.rectanglePoint.startingX, state.rectanglePoint.startingY, state.globalAlpha, state.rectanglePoint.width, state.rectanglePoint.height)
  ctx.stroke()
  state.rectanglePoint.startingX = null
  state.rectanglePoint.startingY = null
  state.rectanglePoint.width = null
  state.rectanglePoint.height = null
}
function circle(e) {
  if(e.buttons !== 1) return;
  clearFakeCanvas()
  setMouseCoords(e)
  fakeCtx.beginPath();
  fakeCtx.globalAlpha = state.globalAlpha
  fakeCtx.strokeStyle = state.selectedColor
  fakeCtx.lineWidth = 3
  const {startingX, startingY} = state.circlePoint
  if(startingX === null && startingY === null) {
    state.circlePoint.startingX = state.mouseCoords.x
    state.circlePoint.startingY = state.mouseCoords.y
  }
  state.circlePoint.radius = Math.abs((state.circlePoint.startingX + state.circlePoint.startingY) - (state.mouseCoords.x + state.mouseCoords.y))
  fakeCtx.arc(state.circlePoint.startingX, state.circlePoint.startingY, state.circlePoint.radius, 0, 2 * Math.PI);
  fakeCtx.stroke()
}

function circleMouseUp(e) {
  clearFakeCanvas()
  ctx.beginPath()
  ctx.globalAlpha = state.globalAlpha
  ctx.strokeStyle = state.selectedColor
  ctx.lineWidth = 3
  ctx.arc(state.circlePoint.startingX, state.circlePoint.startingY, state.circlePoint.radius, 0, 2 * Math.PI);
  saveDrawing('circle', state.selectedColor, 3, state.circlePoint.startingX, state.circlePoint.startingY, state.globalAlpha, state.circlePoint.radius)
  ctx.stroke()
  state.circlePoint.startingX = null
  state.circlePoint.startingY = null
  state.circlePoint.radius = null
}

function spray(e) {
  setMouseCoords(e)
  ctx.beginPath();
  ctx.globalAlpha = state.globalAlpha
  ctx.arc(state.mouseCoords.x, state.mouseCoords.y, 10, 0, 2 * Math.PI);
  ctx.fillStyle = state.selectedColor
  ctx.strokeStyle = state.selectedColor
  ctx.fill()
  ctx.stroke();
  saveDrawing('solid-circle', state.selectedColor, 10, state.mouseCoords.x, state.mouseCoords.y, state.globalAlpha)
}

function erase(e) {
  if(e.buttons !== 1) return;
  setMouseCoords(e)
  ctx.beginPath();
  ctx.arc(state.mouseCoords.x, state.mouseCoords.y, 10, 0, 2 * Math.PI);
  ctx.fillStyle = 'white'
  ctx.strokeStyle = 'white'
  ctx.fill()
  ctx.stroke();
  saveDrawing('solid-circle', 'white', 10, state.mouseCoords.x, state.mouseCoords.y)
}

function setMouseCoords(e) {
  const bounds = e.target.getBoundingClientRect()
  // Theres probably a better way to do this, will refactor later
  state.mouseCoords = {
    x: e.clientX - Math.floor(bounds.left),
    y: e.clientY - Math.floor(bounds.top)
  }
}

function switchColor(e) {
  if(!('color' in e.target.dataset)) return;
  const { color } = e.target.dataset
  state.selectedColor = color
  $currentColor.style.backgroundColor = color
}

function switchTool(e) {
  if (!('tool' in e.target.dataset)) return;
  removeAllCanvasEventListeners()
  state.selectedTool.classList.remove('selected')
  state.selectedTool = e.target
  state.selectedTool.classList.add('selected')
  setCanvasListenersBasedOffTool(state.selectedTool.dataset.tool)
}

function setCanvasListenersBasedOffTool(tool) {
  switch(tool) {
    case 'pencil':
      hideFakeCanvas()
      addCanvasEventListener('mousemove', draw, false)
      addCanvasEventListener('mousedown', setMouseCoords, false)
      addCanvasEventListener('mouseenter', setMouseCoords, false)
    break;
    case 'line':
      triggerFakeCanvas()
      addCanvasEventListener('mousemove', line, true)
      addCanvasEventListener('mouseup', lineMouseUp, true)
    break;
    case 'spray':
      hideFakeCanvas()
      addCanvasEventListener('click', spray, false)
    break;
    case 'eraser':
      hideFakeCanvas()
      addCanvasEventListener('mousemove', erase, false)
    break;
    case 'box':
      triggerFakeCanvas()
      addCanvasEventListener('mousemove', rectangle, true)
      addCanvasEventListener('mouseup', rectangleMouseUp, true)
    break;
    case 'circle':
      triggerFakeCanvas()
      addCanvasEventListener('mousemove', circle, true)
      addCanvasEventListener('mouseup', circleMouseUp, true)
    break;
    case 'brush':
      hideFakeCanvas()
      addCanvasEventListener('mousemove', brush, false)
    break;
  }
}

function addCanvasEventListener(type, cb, isFake = false) {
  state.currentEvents.push({
    type,
    cb,
    isFake
  })
  if(isFake) {
    $fakeCanvas.addEventListener(type, cb)
  } else {
    $canvas.addEventListener(type, cb)
  }
}

function removeAllCanvasEventListeners() {
  state.currentEvents.forEach(e => e.isFake ? $fakeCanvas.removeEventListener(e.type, e.cb) : $canvas.removeEventListener(e.type, e.cb))
  state.currentEvents = []
}

function saveDrawing(type, color, lineWidth, startingX, startingY, globalAlpha, endingX, endingY) {
  state.drawnHistory.push({
    type,
    color,
    lineWidth,
    startingX,
    startingY,
    globalAlpha,
    endingX,
    endingY
  })
}
  // This logic uses property names inappropriately, it bugs the crap out of me, but its a hackathon ¯\_(ツ)_/¯
function redrawLines() {
  state.drawnHistory.forEach(data => {
    switch(data.type) {
      case 'line':
        ctx.beginPath()
        ctx.globalAlpha = data.globalAlpha || 1
        ctx.strokeStyle = data.color
        ctx.lineWidth = data.lineWidth
        ctx.moveTo(data.startingX, data.startingY)
        ctx.lineTo(data.endingX, data.endingY)
        ctx.stroke()
      break;
      // This is so bad
      case 'solid-circle':
        ctx.beginPath();
        ctx.globalAlpha = data.globalAlpha || 1
        ctx.arc(data.startingX, data.startingY, data.lineWidth, 0, 2 * Math.PI);
        ctx.fillStyle = data.color
        ctx.strokeStyle = data.color
        ctx.fill()
        ctx.stroke();
      break;
      case 'circle':
        ctx.beginPath()
        ctx.globalAlpha = data.globalAlpha
        ctx.arc(data.startingX, data.startingY, data.endingX, 0, 2 * Math.PI)
        ctx.strokeStyle = data.color
        ctx.lineWidth = data.lineWidth
        ctx.stroke()
      break;
      case 'rectangle':
        ctx.beginPath()
        ctx.globalAlpha = data.globalAlpha
        ctx.strokeStyle = data.color
        ctx.lineWidth = data.lineWidth
        ctx.rect(data.startingX, data.startingY, data.endingX, data.endingY)
        ctx.stroke()
    }
  })
}
function clearCanvas() {
  ctx.clearRect(0, 0, $canvas.width, $canvas.height);
}
function clearFakeCanvas() {
  fakeCtx.clearRect(0, 0, $fakeCanvas.width, $fakeCanvas.height);
}
function setGlobalAlpha(e) {
  state.globalAlpha = Number(e.target.value)
}
function triggerFakeCanvas() {
    $fakeCanvas.className = ''
}
function hideFakeCanvas() {
  $fakeCanvas.className = 'hidden'
}
