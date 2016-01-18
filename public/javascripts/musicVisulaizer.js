function MusicVisualizer (obj) {
	this.source = null;

	this.count = 0;

	this.analyser = MusicVisualizer.ac.createAnalyser();
	this.size = obj.size;
	this.analyser.fftsize = this.size * 2;

	this.gainNode = MusicVisualizer.ac[MusicVisualizer.ac.createGain ? "createGain" : "createGainNode"](0);
	this.gainNode.connect(MusicVisualizer.ac.destination);

	this.analyser.connect(this.gainNode);

	this.xhr = new XMLHttpRequest();

	this.visualizer = obj.visualizer;

	this.visulize();
}

MusicVisualizer.ac = new(window.AudioContext || window.webkitAudioContext);

MusicVisualizer.prototype.load = function (url) {
	this.xhr.abort();
	this.xhr.open("GET", url);
	this.xhr.responseType = "arraybuffer";
	var self = this;
	this.xhr.onload = functioin () {
		fun(self.xhr.response);
	}
	this.xhr.send();
}

MusicVisualizer.prototype.decode = function (arraybuffer, fun) {
	MusicVisualizer.ac.decodeAudio(arraybuffer, function (buffer) {
		fun(buffer)
	}, function (err) {
		console.log(err);
	});
}

MusicVisualizer.prototype.play = function (url) {
	var n = ++ this.count;
	var self = this;
	this.source && this.stop();
	this.load(url, function (arraybuffer) {
		self.decode(arraybuffer, function (buffer) {
			var bs = MusicVisualizer.ac.createBufferSource();
			bs.connect(self.analyser);
			bs.buffer = buffer;
			bs[bs.start ? "start" : "nodeOn"](0);
			self.source = bs;
		});
	});
}

MusicVisualizer.prototype.stop = function () {
	this.source[this.source.stop ? "stop" : "noteOff"](0);
}

MusicVisualizer.prototype.changeVolume = function (percent) {
	this.gainNode.gain.value = percent * percent;
}

MusicVisualizer.prototype.visualize = function () {
	var arr = new Uint8Array(this.analyser.frequencyBinCount);
	requestAnimationFrame = window.requestAnimationFrame ||
							window.webkitrequestAnimationFrame ||
							window.mozRequestAnimationFrame;
	var self = this;
	function v () {
		self.analyser.getByteFrequencyData(arr);
		requestAnimationFrame(v);
		self.visualizer(arr);
	}
	requestAnimationFrame(v);
}