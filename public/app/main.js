define(function (require) {

  var G = {
    canvas: document.getElementById('canvas')
  , ctx: this.canvas.getContext('2d')
  , camera: null
  , scene: null
  , renderer: null
  , shaderTexture: null
  , uniforms: null
  , face_model: null
  , shader_material: null
  }

  G.push_map = {1: "kick",
                4: "clap",
                5: "treble"}

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

  var M = require('./model');

  function init() {
    var container = document.getElementById( 'container' );
    //G.camera = new THREE.Camera();
    var SCREEN_WIDTH = window.innerWidth;
    var SCREEN_HEIGHT = window.innerHeight;
    G.camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 100000);
    G.camera.position.z = 1;
    G.scene = new THREE.Scene();
    G.shaderTexture = new THREE.Texture(canvas);
    G.uniforms = {
      time: { type: "f"
            , value: 1.0 }
    , resolution: { type: "v2"
                  , value: new THREE.Vector2() }
    , stretched: { type: "v3"
                  , value: new THREE.Vector3() }
    , music_tex: { type: "t"
                 , value: G.shaderTexture }
    , face_tex: { type: "t"
                , value: THREE.ImageUtils.loadTexture('images/nicholas-cage.jpg') }
    };
    // TODO: add uniform type v3 to use for stretching on dial

    G.shader_material = new THREE.ShaderMaterial( {
      uniforms: G.uniforms,
      vertexShader: document.getElementById( 'vertexShader' ).textContent,
      fragmentShader: document.getElementById( 'fragmentShader' ).textContent
    });

    // LIGHTS
    var ambient = new THREE.AmbientLight(0x666666);
    G.scene.add(ambient);

    var directionalLight = new THREE.DirectionalLight(0xffeedd);
    directionalLight.position.set(0, 70, 100).normalize();
    G.scene.add(directionalLight);

    var loader = new THREE.JSONLoader();
    var callbackKey = function(geometry) {createScene(geometry,  0, -.75, -1.75, .9,"../images/nicholas-cage.jpg")};
    loader.load("../models/face.json", callbackKey);

    /* TODO: tween + particle button models */

    var mesh = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), G.shader_material );
    //G.scene.add( mesh );
    renderer = new THREE.WebGLRenderer();
    container.appendChild( renderer.domElement );
    G.uniforms.resolution.value.x = window.innerWidth;
    G.uniforms.resolution.value.y = window.innerHeight;

    G.uniforms.stretched.value.x = 1;
    G.uniforms.stretched.value.y = 1;
    G.uniforms.stretched.value.z = 1;
    renderer.setSize( window.innerWidth, window.innerHeight );
  }

  function createScene(geometry, x, y, z, scale, tmap) {
    G.face_model = new THREE.Mesh(geometry, G.shader_material);
    //G.face_model = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial());
    G.face_model.position.set(x, y, z);
    G.face_model.scale.set(scale, scale, scale);
    G.scene.add(G.face_model);
  }

  function animate() {
    if (G.face_model) {
      G.face_model.rotation.y += .01;
    }

    requestAnimationFrame( animate );
    render();
  }

  var startTime = Date.now();
  function render() {
    var elapsedMilliseconds = Date.now() - startTime;
    var elapsedSeconds = elapsedMilliseconds / 1000.;

    /* TODO: use A.pbr value to determine stretch amounts with linmap
      
    G.uniforms.stretched.value.x = elapsedSeconds;
    G.uniforms.stretched.value.y = 1/elapsedSeconds;
    G.uniforms.stretched.value.z = 1;*/

    G.uniforms.time.value = 60. * elapsedSeconds;
    G.shaderTexture.needsUpdate = true;
    renderer.render( G.scene, G.camera );
  }

  init();
  animate();

  var socket = io();
  socket.on('push', function (data) {
      A.play(G.push_map[data.button]);
  });

  socket.on('stop', function (data) {
      A.stop(G.push_map[data.button]);
  });

  socket.on("dial", function(data) {
    A.update_pbr(data.dial);
  })

  socket.on("slider", function (data) {
      A.update_filter(data.slider);
  })

});