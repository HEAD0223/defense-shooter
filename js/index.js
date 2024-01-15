const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector('#scoreEl');
const startGameBtn = document.querySelector('#startGameBtn');
const modalEl = document.querySelector('#modalEl');
const bigScoreEl = document.querySelector('#bigScoreEl');

const canvasCenter = { x: canvas.width / 2, y: canvas.height / 2 };

let player = new Player({
	position: { x: canvasCenter.x, y: canvasCenter.y },
	radius: 10,
	color: 'white',
});
let projectiles = [];
let enemies = [];
let particles = [];

function init() {
	player = new Player({
		position: { x: canvasCenter.x, y: canvasCenter.y },
		radius: 10,
		color: 'white',
	});
	projectiles = [];
	enemies = [];
	particles = [];
	scoreEl.innerHTML = 0;
}

function spawnEnemies() {
	setInterval(() => {
		const radius = Math.random() * (30 - 4) + 4;
		const color = `hsl(${Math.random() * 360},50%,50%)`;

		let x, y;
		if (Math.random() < 0.5) {
			x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
			y = Math.random() * canvas.height;
		} else {
			x = Math.random() * canvas.width;
			y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
		}

		const angle = Math.atan2(canvasCenter.y - y, canvasCenter.x - x);
		const velocity = { x: Math.cos(angle), y: Math.sin(angle) };

		enemies.push(
			new Enemy({
				position: { x, y },
				radius,
				color,
				velocity,
			}),
		);
	}, 1000);
}

let animationId;
function animate() {
	animationId = requestAnimationFrame(animate);

	ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	player.draw();
	particles.forEach((particle, particleIndex) => {
		// Remove particles
		if (particle.alpha <= 0) {
			setTimeout(() => {
				particles.splice(particleIndex, 1);
			}, 0);
		} else particle.update();
	});
	projectiles.forEach((projectile, projectileIndex) => {
		projectile.update();

		// Remove projectiles when they are out of screen
		if (
			projectile.position.x + projectile.radius < 0 ||
			projectile.position.x - projectile.radius > canvas.width ||
			projectile.position.y + projectile.radius < 0 ||
			projectile.position.y - projectile.radius > canvas.height
		) {
			setTimeout(() => {
				projectiles.splice(projectileIndex, 1);
			}, 0);
		}
	});

	enemies.forEach((enemy, enemyIndex) => {
		enemy.update();
		// Player and enemies collision
		const distance = Math.hypot(
			player.position.x - enemy.position.x,
			player.position.y - enemy.position.y,
		);
		// When enemies touch player
		if (distance - enemy.radius - player.radius < 1) {
			// End Game
			cancelAnimationFrame(animationId);
			modalEl.style.display = 'flex';
			bigScoreEl.innerHTML = scoreEl.innerHTML;
		}
		// Projectiles and enemies collision
		projectiles.forEach((projectile, projectileIndex) => {
			const distance = Math.hypot(
				projectile.position.x - enemy.position.x,
				projectile.position.y - enemy.position.y,
			);
			// When projectiles touch enemy
			if (distance - enemy.radius - projectile.radius < 1) {
				// Create explosions
				for (let i = 0; i < enemy.radius * 2; i++) {
					particles.push(
						new Particle({
							position: { x: projectile.position.x, y: projectile.position.y },
							radius: Math.random() * 2,
							color: enemy.color,
							velocity: {
								x: (Math.random() - 0.5) * (Math.random() * 6),
								y: (Math.random() - 0.5) * (Math.random() * 6),
							},
						}),
					);
				}
				if (enemy.radius - 10 > 5) {
					// Shrink enemy
					gsap.to(enemy, {
						radius: enemy.radius - 10,
					});
					// Increase score - Shrink
					scoreEl.innerHTML = parseInt(scoreEl.innerHTML) + 100;
					setTimeout(() => {
						projectiles.splice(projectileIndex, 1);
					}, 0);
				} else {
					// Remove enemy
					setTimeout(() => {
						enemies.splice(enemyIndex, 1);
						projectiles.splice(projectileIndex, 1);
					}, 0);
					// Increase score - Remove
					scoreEl.innerHTML = parseInt(scoreEl.innerHTML) + 250;
				}
			}
		});
	});
}

startGameBtn.addEventListener('click', () => {
	init();
	animate();
	spawnEnemies();
	modalEl.style.display = 'none';
});
