/*
Based on Joel Besada's lovely experiment
https://twitter.com/JoelBesada/status/670343885655293952
 */

;(function () {
	var shakeTime = 0,
		shakeTimeMax = 0,
		shakeIntensity = 3,
		lastTime = 0,
		particles = [],
		particlePointer = 0,
		MAX_PARTICLES = 500,
		PARTICLE_NUM_RANGE = { min: 5, max: 12 },
		PARTICLE_GRAVITY = 0.07,
		PARTICLE_ALPHA_FADEOUT = 0.96,
		PARTICLE_VELOCITY_RANGE = {
			x: [-1, 1],
			y: [-3.5, -1.5]
		},
		w = window.innerWidth,
		h = window.innerHeight;

	var cmNode;
	var ctx;
	var throttledShake = throttle(shake, 100);
	var throttledSpawnParticles = throttle(spawnParticles, 25);

	function initCanvas() {
		var canvas = document.createElement('canvas');
		ctx = canvas.getContext('2d'),

		canvas.style.position = 'absolute';
		canvas.style.top = 0;
		canvas.style.left = 0;
		canvas.style.zIndex = 1;
		canvas.style.pointerEvents = 'none';
		canvas.width = w;
		canvas.height = h;

		document.body.appendChild(canvas);
	}

	function getRGBComponents(node) {
		var color = getComputedStyle(node).color;
		if (color) {
			try {
				return color.match(/(\d+), (\d+), (\d+)/).slice(1);
			} catch(e) {
				return [255, 255, 255];
			}
		} else {
			return [255, 255, 255];
		}
	}

	function spawnParticles(type) {
		var cursorPos = cm.getCursor();
		var pos = cm.cursorCoords();
		var node = document.elementFromPoint(pos.left - 5, pos.top + 5);
		type = cm.getTokenAt(cursorPos);
		if (type) { type = type.type; };
		var numParticles = random(PARTICLE_NUM_RANGE.min, PARTICLE_NUM_RANGE.max);
		color = getRGBComponents(node);
		for (var i = numParticles; i--;) {
			particles[particlePointer] = createParticle(pos.left + 10, pos.top, color);
			particlePointer = (particlePointer + 1) % MAX_PARTICLES;
		}
	}

	function createParticle(x, y, color) {
		return {
			x: x,
			y: y + 10,
			alpha: 1,
			color: color,
			velocity: {
				x: PARTICLE_VELOCITY_RANGE.x[0] + Math.random() *
					(PARTICLE_VELOCITY_RANGE.x[1] - PARTICLE_VELOCITY_RANGE.x[0]),
				y: PARTICLE_VELOCITY_RANGE.y[0] + Math.random() *
					(PARTICLE_VELOCITY_RANGE.y[1] - PARTICLE_VELOCITY_RANGE.y[0])
			}
		};
	}

	function drawParticles(timeDelta) {
		var particle;
		for (var i = particles.length; i--;) {
			particle = particles[i];
			if (!particle || particle.alpha <= 0.1) { continue; }

			particle.velocity.y += PARTICLE_GRAVITY;
			particle.x += particle.velocity.x;
			particle.y += particle.velocity.y;
			particle.alpha *= PARTICLE_ALPHA_FADEOUT;

			ctx.fillStyle = 'rgba('+ particle.color[0] +','+ particle.color[1] +','+ particle.color[2] + ',' + particle.alpha + ')';
			ctx.fillRect(Math.round(particle.x - 1), Math.round(particle.y - 1), 3, 3);
		}
	}

	function shake(time) {
		shakeTime = shakeTimeMax = time;
	}

	function random(min, max) {
		if (!max) { max = min; min = 0; }
		return min + ~~(Math.random() * (max - min + 1))
	}

	function throttle (callback, limit) {
		var wait = false;
		return function () {
			if (!wait) {
				callback.call();
				wait = true;
				setTimeout(function () {
					wait = false;
				}, limit);
			}
		}
	}

	function loop() {
		ctx.clearRect(0, 0, w, h);

		// get the time past the previous frame
		var current_time = new Date().getTime();
		if(!lastTime) last_time = current_time;
		var dt = (current_time - lastTime) / 1000;
		lastTime = current_time;

		if (shakeTime > 0) {
			shakeTime -= dt;
			var magnitude = (shakeTime / shakeTimeMax) * shakeIntensity;
			var shakeX = random(-magnitude, magnitude);
			var shakeY = random(-magnitude, magnitude);
			cmNode.style.transform = 'translate(' + shakeX + 'px,' + shakeY + 'px)';
		}
		drawParticles();
		requestAnimationFrame(loop);
	}

	CodeMirror.defineOption("blastCode", false, function(cm, val, old) {
		if (val) {
			cm.state.blastCode = val;
			cm = cm;
			cmNode = cm.getWrapperElement();
			initCanvas();
			loop();
			cm.on("change", function (instance, change) {
				throttledShake(0.3);
				throttledSpawnParticles();
			});
		}
	});
})();