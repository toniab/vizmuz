define(function (require) {
  var DEBUG = true;

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

  G.push_map = {1: {id: "kick", model: "../models/pyramid.json", texture: "../images/pyramid-gradient.png"},
                4: {id:"clap"},
                5: {id:"treble", model: "../models/diamond.json", texture: "../images/diamond-gradient.png"}
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

  //var M = require('./model');

  function init() {
    var container = document.getElementById( 'container' );
    //G.camera = new THREE.Camera();
    var SCREEN_WIDTH = window.innerWidth;
    var SCREEN_HEIGHT = window.innerHeight;
    G.camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, .1, 100000);
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

    //bass model
    loader.load(G.push_map[1].model, function(geometry) {G.push_map[1].geometry = geometry});
    G.push_map[1].material = new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture(G.push_map[1].texture)});
    //treble model
    loader.load(G.push_map[5].model, function(geometry) {G.push_map[5].geometry = geometry;});
    G.push_map[5].material = new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture(G.push_map[5].texture)});

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
    G.face_model.position.set(x, y, z);
    G.face_model.scale.set(scale, scale, scale);
    G.scene.add(G.face_model);
  }

  function anim_button_push(d) {
      for ( var i = 0; i < 10; i++ ) {
          var particle;
          if (G.push_map[d].model.endsWith("json")) {
            if (G.push_map[d].geometry)
              particle = new THREE.Mesh(G.push_map[d].geometry, G.push_map[d].material);
              //TODO: add image as material
          } else if (G.push_map[d].model.endsWith("dae")) {
              // TODO: BG IMAGE/COLOR/ANIM? ROTATE? IDK? COLOR CHANGE?
          }

          if (particle) {
            initParticle( particle, i * 10 );
            G.scene.add( particle );
          }
      }
  }

  function initParticle( particle, delay ) {

    var particle = this instanceof THREE.Mesh ? this : particle;
    var delay = delay !== undefined ? delay : 0;

    particle.position.set( 0, 0, 0 );
    particle.scale.x = particle.scale.y = /*particle.scale.z =*/ Math.random() * 25 + 16;

    new TWEEN.Tween( particle )
      .delay( delay )
      .to( {}, 10000 )
      //.onComplete( initParticle ) 
      .start();
      // re-enable the above to allow looping of the landscape;

    new TWEEN.Tween( particle.position )
      .delay( delay )
      .to( { x: Math.random() * 4000 - 2000, y: Math.random() * 1000 - 500, z: Math.random() * 4000 - 2000 }, 10000 )
      .start();

    new TWEEN.Tween( particle.scale )
      .delay( delay )
      .to( { x: 0.01, y: 0.01, /*z: 0.01*/ }, 12000 )
      .onComplete(function(){G.scene.remove( particle )})
      .start();

    new TWEEN.Tween( particle.rotation )
      .delay( delay )
      .to( { y: getRandomArbitrary(-1,1) * Math.PI * 2}, 10000 )
      .start();

  }


  function linMap (inputStart, inputEnd, outputStart, outputEnd, inputValue) {
      return (inputValue-inputStart)/(inputEnd - inputStart) * (outputEnd - outputStart) + outputStart;
  }

  function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
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

    TWEEN.update();

    /* TODO: use A.pbr value to determine stretch amounts with linmap
    G.uniforms.stretched.value.y = 1/elapsedSeconds;
    G.uniforms.stretched.value.z = 1;*/

    G.uniforms.time.value = 60. * elapsedSeconds;
    G.shaderTexture.needsUpdate = true;
    renderer.render( G.scene, G.camera );
  }

  function dial_moved(d) {
      A.update_pbr(d);
      G.uniforms.stretched.value.x = linMap(0,2,4,0,d);
      G.uniforms.stretched.value.y = linMap(0,2,.5,1.5,d);
  }

  init();
  animate();

  var socket = io();
  socket.on('push', function (data) {
      A.play(G.push_map[data.button].id);
      if (G.push_map[data.button].model) {
        anim_button_push(data.button);
      }
  });

  socket.on('stop', function (data) {
      A.stop(G.push_map[data.button].id);
  });

  socket.on("dial", function(data) {
    dial_moved(data.dial);
  })

  socket.on("slider", function (data) {
      A.update_filter(data.slider);
  })

  //74J 75K 76L 
  /* DEBUG KEYBOARD CONTROLS */
  if (DEBUG) {
    window.onkeydown = function(e) {
        if (e.keyCode == 74) {
          A.play(G.push_map[1].id);
          if (G.push_map[1].model) {
            anim_button_push(1);
          }
        } else if (e.keyCode == 75) {
          A.play(G.push_map[4].id);
          if (G.push_map[4].model) {
            anim_button_push(4);
          }
        } else if (e.keyCode == 76) {
          A.play(G.push_map[5].id);
          if (G.push_map[5].model) {
            anim_button_push(5);
          }
        }
    };

    window.onkeyup = function(e) {
      if (e.keyCode == 76) {
        A.stop(G.push_map[5].id);
      }
    };

    window.onmousemove = function(e) {
      var mouseX = e.clientX;
      var mouseY = e.clientY;
      var val = linMap (0, window.innerWidth, 0, 2, mouseX);
      dial_moved(val);
    }
  }

});