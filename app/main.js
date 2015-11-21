define(function (require) {

  var G = {
    canvas: document.getElementById('canvas')
  , ctx: this.canvas.getContext('2d')
  , camera: null
  , scene: null
  , renderer: null
  , shaderTexture: null
  , uniforms: null
  }

  function setPixel(imageData, x, y, r, g, b, a) {
      index = (x + y * imageData.width) * 4;
      imageData.data[index+0] = r;
      imageData.data[index+1] = g;
      imageData.data[index+2] = b;
      imageData.data[index+3] = a;
  }

  function draw_canvas(eq) {
    var pos = 0;
    var img = G.ctx.createImageData(256,20);
    var x, y, r, g, b;
    for (var i = 0; i < eq.length; i++) {
      x = i;
      y = 0;
      r = eq[i];
      g = 0;
      b = 0;
      setPixel(img, x, y, r, g, b, 255);
    }
    G.ctx.putImageData(img, 0, 0);
  }

  var A = require('./audio');
  A.audioAnalyzer(function (eq) {
    draw_canvas(eq);
  });

  function init() {
    var container = document.getElementById( 'container' );
    G.camera = new THREE.Camera();
    G.camera.position.z = 1;
    G.scene = new THREE.Scene();
    G.shaderTexture = new THREE.Texture(canvas);
    G.uniforms = {
      time: { type: "f"
            , value: 1.0 }
    , resolution: { type: "v2", value: new THREE.Vector2() }
    , magic_tex: { type: "t", value: G.shaderTexture }
    };
    var material = new THREE.ShaderMaterial( {
      uniforms: G.uniforms,
      vertexShader: document.getElementById( 'vertexShader' ).textContent,
      fragmentShader: document.getElementById( 'fragmentShader' ).textContent
    });
    var mesh = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), material );
    G.scene.add( mesh );
    renderer = new THREE.WebGLRenderer();
    container.appendChild( renderer.domElement );
    G.uniforms.resolution.value.x = window.innerWidth;
    G.uniforms.resolution.value.y = window.innerHeight;
    renderer.setSize( window.innerWidth, window.innerHeight );
  }

  function animate() {
    requestAnimationFrame( animate );
    render();
  }

  var startTime = Date.now();
  function render() {
    var elapsedMilliseconds = Date.now() - startTime;
    var elapsedSeconds = elapsedMilliseconds / 1000.;
    G.uniforms.time.value = 60. * elapsedSeconds;
    G.shaderTexture.needsUpdate = true;
    renderer.render( G.scene, G.camera );
  }

  init();
  animate();

  document.getElementById("kick_test").onclick = function() {
    // A.play("main");
    A.play("kick_test");
  }


});