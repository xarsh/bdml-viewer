import 'babel-polyfill'

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
document.getElementById('app').appendChild(renderer.domElement)

const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(200))
scene.add(new THREE.GridHelper(500, 50))

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 10000)
const controls = new THREE.OrbitControls(camera, renderer.domElement)
camera.position.set(180, 180, 360)
camera.add(new THREE.PointLight(0xffffff))
scene.add(camera)

const geometry = new THREE.Geometry()
const material = new THREE.MeshLambertMaterial({color: 0xffffff, side: THREE.DoubleSide})
scene.add(new THREE.Mesh(geometry, material))

const animate = () => {
  window.requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

let frames = []
let time = 0

const updateFrame = () => {
  const frame = frames[time]
  document.getElementById('frame-counter').innerText = `time: ${frame.time}`
  geometry.vertices = frame.vertices
  geometry.faces = frame.faces
  geometry.verticesNeedUpdate = true
  geometry.elementsNeedUpdate = true
  geometry.computeFaceNormals()
}

document.getElementById('time').oninput = e => {
  time = Math.floor((e.target.value / 100) * frames.length)
  updateFrame()
}

document.getElementById('auto').onchange = e => {
  if (e.target.checked) {
    window.interval = setInterval(() => {
      time = (time + 1) % frames.length
      document.getElementById('time').value = (time / frames.length) * 100
      updateFrame()
    }, 200)
  } else {
    clearInterval(window.interval)
  }
}

document.querySelector('select[name="type"]').onchange = async e => {
  document.getElementById('frame-counter').innerText = 'Loading...'
  const res = await (await window.fetch(`./dist/components/${e.target.value}.json`)).json()
  frames = res.frames.map(frame => ({
    time: frame.time,
    vertices: frame.positions.map(v => new THREE.Vector3(...v)),
    faces: frame.cells.map(f => new THREE.Face3(...f))
  }))
  updateFrame()
  animate()
}
