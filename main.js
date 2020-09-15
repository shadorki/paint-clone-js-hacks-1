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
  }
}


// DOM Elements
const $toolBarContainer = document.querySelector('.tool-bar')
const $colorPalette = document.querySelector('.color-palette')
const $currentColor = document.querySelector('.current-color')
const $canvas = document.querySelector('canvas')

// initialization
const ctx = $canvas.getContext('2d')
init()

// Events
$colorPalette.addEventListener('click', switchColor)
$toolBarContainer.addEventListener('click', switchTool)

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

function draw(e) {
  if (e.buttons !== 1) return;
  ctx.beginPath()
  ctx.strokeStyle = state.selectedColor
  ctx.lineWidth = 3
  const startingX = state.mouseCoords.x
  const startingY = state.mouseCoords.y
  ctx.moveTo(startingX, startingY)
  setMouseCoords(e)
  ctx.lineTo(state.mouseCoords.x, state.mouseCoords.y)
  ctx.stroke()
  saveDrawing('line', state.selectedColor, 3, startingX, startingY, state.mouseCoords.x, state.mouseCoords.y)
}

function line(e) {
  if (e.buttons !== 1) return;
  clearCanvas()
  ctx.strokeStyle = state.selectedColor
  ctx.lineWidth = 3
  const {startingX, startingY, endingX, endingY} = state.linePoint
  if(startingX === null && startingY === null) {
    const bounds = e.target.getBoundingClientRect()
    state.linePoint.startingX = e.clientX - Math.floor(bounds.left)
    state.linePoint.startingY = e.clientY - Math.floor(bounds.top)
  }
  ctx.moveTo(state.linePoint.startingX, state.linePoint.startingY)
  setMouseCoords(e)
  ctx.lineTo(state.mouseCoords.x, state.mouseCoords.y)
  ctx.stroke()
  redrawLines()
}

function lineMouseUp(e) {
  const bounds = e.target.getBoundingClientRect()
  ctx.strokeStyle = state.selectedColor
  ctx.lineWidth = 3
  state.linePoint.endingX = e.clientX - Math.floor(bounds.left)
  state.linePoint.endingY = e.clientY - Math.floor(bounds.top)
  ctx.moveTo(state.linePoint.startingX, state.linePoint.startingY)
  ctx.lineTo(state.linePoint.endingX, state.linePoint.endingY)
  ctx.stroke()
  saveDrawing('line', state.selectedColor, 3, state.linePoint.startingX, state.linePoint.startingY, state.linePoint.endingX, state.linePoint.endingY)
  state.linePoint.startingX = null
  state.linePoint.startingY = null
  state.linePoint.endingX = null
  state.linePoint.endingY = null
}

function spray(e) {
  setMouseCoords(e)
  ctx.beginPath();
  ctx.arc(state.mouseCoords.x, state.mouseCoords.y, 10, 0, 2 * Math.PI);
  ctx.fillStyle = state.selectedColor
  ctx.strokeStyle = state.selectedColor
  ctx.fill()
  ctx.stroke();
  saveDrawing('circle', state.selectedColor, 10, state.mouseCoords.x, state.mouseCoords.y)
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
  saveDrawing('circle', 'white', 10, state.mouseCoords.x, state.mouseCoords.y)
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
      addCanvasEventListener('mousemove', draw)
      addCanvasEventListener('mousedown', setMouseCoords)
      addCanvasEventListener('mouseenter', setMouseCoords)
    break;
    case 'line':
      addCanvasEventListener('mousemove', line)
      addCanvasEventListener('mouseup', lineMouseUp)
    break;
    case 'spray':
      addCanvasEventListener('click', spray)
    break;
    case 'eraser':
      addCanvasEventListener('mousemove', erase)
  }
}

function addCanvasEventListener(type, cb) {
  state.currentEvents.push({
    type,
    cb
  })
  $canvas.addEventListener(type, cb)
}

function removeAllCanvasEventListeners() {
  state.currentEvents.forEach(e => $canvas.removeEventListener(e.type, e.cb))
  state.currentEvents = []
}

function saveDrawing(type, color, width, startingX, startingY, endingX, endingY) {
  state.drawnHistory.push({
    type,
    color,
    width,
    startingX,
    startingY,
    endingX,
    endingY
  })
}
function redrawLines() {
  state.drawnHistory.forEach(data => {
    switch(data.type) {
      case 'line':
        ctx.beginPath()
        ctx.strokeStyle = data.color
        ctx.lineWidth = data.width
        ctx.moveTo(data.startingX, data.startingY)
        ctx.lineTo(data.endingX, data.endingY)
        ctx.stroke()
      break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(data.startingX, data.startingY, data.width, 0, 2 * Math.PI);
        ctx.fillStyle = data.color
        ctx.strokeStyle = data.color
        ctx.fill()
        ctx.stroke();
      break;
    }
  })
}
function clearCanvas() {
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, $canvas.width, $canvas.height);
}
