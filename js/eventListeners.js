window.addEventListener('click', (e) => {
	const angle = Math.atan2(e.clientY - canvasCenter.y, e.clientX - canvasCenter.x);
	const velocity = { x: Math.cos(angle) * 5, y: Math.sin(angle) * 5 };
	projectiles.push(
		new Projectile({
			position: { x: canvasCenter.x, y: canvasCenter.y },
			radius: 5,
			color: 'white',
			velocity,
		}),
	);
});
