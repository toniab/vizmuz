define(function () {
	var A = {
		ctx: null,
		analyser: null,
		sproc: null
	};

	var SOUNDS = {};

	var load_handler = function (id) {
		console.log(id);
		return function (buffer) {

			if(!buffer) {
				alert('Error decoding file data');
				return;
			}

			SOUNDS[id] = buffer;

			if (id == 'main') {
				play("main");
			}
		}
	};

	var request_on_load_maker = function(id, request) {
		return function () {
			A.ctx.decodeAudioData(
				request.response,
				load_handler(id),
				function(error) {
					alert('Decoding error:' + error);
				}
			);
		}
	};

	var audioAnalyzer = function(cb) {
		var boost = 0;
		var urls = [{id: "main", url: '../audio/song.mp3'},
				{id: "kick_test", url: '../audio/kick.wav'}
				];

		try {
			A.ctx = new AudioContext();
		}
		catch(e) {
			alert('Web Audio API is not supported in this browser');
		}

		A.sproc = A.ctx.createScriptProcessor(2048, 1, 1);
		window.PREVENTGC = A.sproc;

		A.sproc.connect(A.ctx.destination);
		A.analyser = A.ctx.createAnalyser();
		A.analyser.smoothingTimeConstant = 0.6;
		A.analyser.fftSize = 512;

		var eq = new Uint8Array(A.analyser.frequencyBinCount);
		A.sproc.onaudioprocess = function(e) {
			A.analyser.getByteFrequencyData(eq);
			boost = 0;
			for (var i = 0; i < eq.length; i++) {
	            boost += eq[i];
	        }
	        boost = boost / eq.length;
	        cb(eq);
		};


		for (var i = 0; i < urls.length; i++) {
			var request = new XMLHttpRequest();
			request.open("GET", urls[i].url, true);
			request.responseType = "arraybuffer";

			request.onload = request_on_load_maker(urls[i].id, request);

			request.onerror = function() {
				alert('buffer: XHR error');
			};

			request.send();
		}
	};

	var play = function(id) {
		if (SOUNDS[id]) {
			var buffer = SOUNDS[id];
			var source = A.ctx.createBufferSource();
			source.buffer = buffer;

			if (id == 'main') {
				// A.sproc.buffer = buffer;
				source.loop = true;
			}

			source.connect(A.analyser);
			A.analyser.connect(A.sproc);
			source.connect(A.ctx.destination);
			source.start(0);
		}
	};

	return {
		audioAnalyzer: audioAnalyzer,
		play: play
	};
});