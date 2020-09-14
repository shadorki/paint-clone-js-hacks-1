const $toolBarContainer = document.querySelector('.tool-bar')
const $colorPalette = document.querySelector('.color-palette')
const $currentColor = document.querySelector('.current-color')
const state = {
  selectedColor: 'black',
}

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
  $currentColor.style.backgroundColor = state.selectedColor
}
