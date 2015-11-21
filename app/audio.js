define(function () {
	var analyzeAudioAndCB = function (context, cb) {
		return function (buffer) {
			if(!buffer) {
				alert('Error decoding file data');
				return;
			}

			var source, sourceJs;
			sourceJs = context.createScriptProcessor(2048, 1, 1);
			window.PREVENTGC = sourceJs;
			sourceJs.buffer = buffer;
			sourceJs.connect(context.destination);
			analyser = context.createAnalyser();
			analyser.smoothingTimeConstant = 0.6;
			analyser.fftSize = 512;

			source = context.createBufferSource();
			source.buffer = buffer;
			source.loop = true;

			source.connect(analyser);
			analyser.connect(sourceJs);
			source.connect(context.destination);

			var eq = new Uint8Array(analyser.frequencyBinCount);
			sourceJs.onaudioprocess = function(e) {
				analyser.getByteFrequencyData(eq);
				boost = 0;
				for (var i = 0; i < eq.length; i++) {
		            boost += eq[i];
		        }
		        boost = boost / eq.length;
		        cb(eq);
			};

			// PLAY
			source.start(0);
		};

	};

	var audioAnalyzer = function(cb) {
		var context;
		var analyser;
		var url = '../audio/song.mp3';
		var boost = 0;

		try {
			context = new AudioContext();
		}
		catch(e) {
			alert('Web Audio API is not supported in this browser');
		}

		var request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.responseType = "arraybuffer";

		request.onload = function() {
			context.decodeAudioData(
				request.response,
				analyzeAudioAndCB(context, cb),
				function(error) {
					alert('Decoding error:' + error);
				}
			);
		};

		request.onerror = function() {
			alert('buffer: XHR error');
		};

		request.send();
	};

	return {
		audioAnalyzer: audioAnalyzer
	};
});