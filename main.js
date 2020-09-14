// DOM Elements
const $toolBarContainer = document.querySelector('.tool-bar')
const $colorPalette = document.querySelector('.color-palette')
const $currentColor = document.querySelector('.current-color')
const $canvas = document.querySelector('canvas')

// Events
$canvas.addEventListener('mousemove', draw)
$canvas.addEventListener('mousedown', setMouseCoords)
$canvas.addEventListener('mouseenter', setMouseCoords)

// State
const state = {
  selectedColor: null,
  selectedTool: null,
  mouseCoords: {
    x: 0,
    y: 0
  }
}

// initialization
const ctx = $canvas.getContext('2d')
init()

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
}

function draw(e) {
  if(e.buttons !== 1) return;
  ctx.beginPath()
  ctx.strokeStyle = state.selectedColor
  ctx.lineWidth = 3
  ctx.moveTo(state.mouseCoords.x, state.mouseCoords.y)
  setMouseCoords(e)
  ctx.lineTo(state.mouseCoords.x, state.mouseCoords.y)
  ctx.stroke()
}

function setMouseCoords(e) {
  const bounds = e.target.getBoundingClientRect()
  // Theres probably a better way to do this, will refactor later
  state.mouseCoords = {
    x: e.clientX - Math.floor(bounds.left),
    y: e.clientY - Math.floor(bounds.top)
  }
}
