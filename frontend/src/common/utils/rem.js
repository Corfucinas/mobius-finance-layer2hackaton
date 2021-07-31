const baseSize = 16
function setRem () {
  if ((navigator.userAgent.match(/(iPhone|iPod|Android|ios|iOS|iPad|Backerry|WebOS|Symbian|Windows Phone|Phone)/i))) {
    const scale = document.documentElement.clientWidth / 375
    document.documentElement.style.fontSize = baseSize * Math.min(scale, 2) + 'px'
  } else {
    const scale = document.documentElement.clientWidth / 1920
    document.documentElement.style.fontSize = baseSize * Math.min(scale, 2) + 'px'
  }
}

setRem()
window.onresize = function () {
  setRem()
}