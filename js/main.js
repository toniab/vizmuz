var canvas = document.getElementById('canvas');
var canvasWidth  = canvas.width;
var canvasHeight = canvas.height;
var ctx = canvas.getContext('2d');

var container;
var camera
  , scene
  , renderer;
var uniforms
  , material
  , mesh;

init();

var startTime = Date.now();

animate();
var WAT;

function init() {
  container = document.getElementById( 'container' );
  camera = new THREE.Camera();
  camera.position.z = 1;
  scene = new THREE.Scene();
  WAT = new THREE.Texture(canvas);
  uniforms = {
    time: { type: "f"
          , value: 1.0 }
  , resolution: { type: "v2", value: new THREE.Vector2() }
  , magic_tex: { type: "t", value: WAT }
  };
  material = new THREE.ShaderMaterial( {
    uniforms: uniforms,
    vertexShader: document.getElementById( 'vertexShader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentShader' ).textContent
  });
  mesh = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), material );
  scene.add( mesh );
  renderer = new THREE.WebGLRenderer();
  container.appendChild( renderer.domElement );
  uniforms.resolution.value.x = window.innerWidth;
  uniforms.resolution.value.y = window.innerHeight;
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  requestAnimationFrame( animate );
  render();
}

function render() {
  var elapsedMilliseconds = Date.now() - startTime;
  var elapsedSeconds = elapsedMilliseconds / 1000.;
  uniforms.time.value = 60. * elapsedSeconds;
  ctx.fillStyle = "rgb("+(parseInt(elapsedSeconds*100)%255)+",255,0)";
  ctx.fillRect(0,0,300,300);
  WAT.needsUpdate = true;
  renderer.render( scene, camera );
}