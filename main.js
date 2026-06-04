// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Intersection Observer for fade-in
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
        }
    });
});

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = 0;
    section.style.transform = 'translateY(50px)';
    section.style.transition = 'all 1s ease-out';
    observer.observe(section);
});

// Custom Cursor Logic
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');

window.addEventListener('mousemove', function (e) {
    const posX = e.clientX;
    const posY = e.clientY;

    // Dot follows instantly
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Outline follows with animation
    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
});

// Cursor Hover Effect
const interactiveElements = document.querySelectorAll('a, button, input, textarea, .portfolio-item, .skill-card, .hero-image-container'); // Added hero image to interactive

interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});

// Cursor Click Effect
window.addEventListener('mousedown', () => document.body.classList.add('clicking'));
window.addEventListener('mouseup', () => document.body.classList.remove('clicking'));

// 3D Tilt Effect (Only for Cards now)
const tiltElements = document.querySelectorAll('.skill-card, .portfolio-item, .contact-form');

tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element.
        const y = e.clientY - rect.top;  // y position within the element.

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; // Max rotation deg
        const rotateY = ((x - centerX) / centerX) * 10;

        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
});

// ─── Liquid Scratch Reveal ───────────────────────────────────────────────────
const revealContainer = document.getElementById('revealContainer');
const revealCanvas = document.getElementById('revealCanvas');
const faceImage = document.getElementById('faceImage');

if (revealContainer && revealCanvas && faceImage) {
    const ctx = revealCanvas.getContext('2d');

    // Helmet image drawn on canvas
    const helmetImg = new Image();
    helmetImg.src = './assets/robot-helmet.png';

    // Tracks drawn erase spots for smooth restore
    let eraseSpots = []; // [{x, y, r, opacity}]
    let animFrame = null;
    let isHovering = false;

    const BRUSH_RADIUS = 170;    // px – large soft erase brush
    const RESTORE_SPEED = 0.022;  // slow, liquid fill-back
    const MAX_OPACITY_DIP = 0.97; // near-complete erase at brush centre

    function resizeCanvas() {
        const rect = faceImage.getBoundingClientRect();
        // Match canvas resolution to displayed image size
        revealCanvas.width = faceImage.naturalWidth || rect.width;
        revealCanvas.height = faceImage.naturalHeight || rect.height;
        revealCanvas.style.width = '100%';
        revealCanvas.style.height = '100%';
        drawHelmet();
    }

    function drawHelmet() {
        ctx.clearRect(0, 0, revealCanvas.width, revealCanvas.height);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        ctx.drawImage(helmetImg, 0, 0, revealCanvas.width, revealCanvas.height);
        applyEraseSpots();
    }

    function applyEraseSpots() {
        eraseSpots.forEach(spot => {
            if (spot.opacity <= 0) return;
            // Soft radial gradient erase brush
            const grad = ctx.createRadialGradient(
                spot.x, spot.y, 0,
                spot.x, spot.y, spot.r
            );
            grad.addColorStop(0, `rgba(0,0,0,${spot.opacity})`);
            grad.addColorStop(0.4, `rgba(0,0,0,${spot.opacity * 0.7})`);
            grad.addColorStop(0.75, `rgba(0,0,0,${spot.opacity * 0.2})`);
            grad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        });
    }

    // Convert mouse position → canvas pixel coords
    function toCanvasCoords(e) {
        const rect = faceImage.getBoundingClientRect();
        const scaleX = revealCanvas.width / rect.width;
        const scaleY = revealCanvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    // ── Erase on mouse move ──
    revealContainer.addEventListener('mousemove', (e) => {
        const { x, y } = toCanvasCoords(e);
        // Add/update spot near current mouse position
        const existing = eraseSpots.find(s =>
            Math.hypot(s.x - x, s.y - y) < BRUSH_RADIUS * 0.5
        );
        if (existing) {
            existing.x = x;
            existing.y = y;
            existing.opacity = Math.min(existing.opacity + 0.28, MAX_OPACITY_DIP);
        } else {
            eraseSpots.push({ x, y, r: BRUSH_RADIUS, opacity: 0.35 }); // start visible immediately
        }
        drawHelmet();
    });

    // ── Restore on mouse leave ──
    revealContainer.addEventListener('mouseleave', () => {
        isHovering = false;
        cancelAnimationFrame(animFrame);
        animateRestore();
    });

    revealContainer.addEventListener('mouseenter', () => {
        isHovering = true;
        cancelAnimationFrame(animFrame);
    });

    function animateRestore() {
        let anyAlive = false;
        eraseSpots.forEach(spot => {
            if (spot.opacity > 0) {
                spot.opacity = Math.max(0, spot.opacity - RESTORE_SPEED);
                if (spot.opacity > 0) anyAlive = true;
            }
        });
        // Prune fully-restored spots
        eraseSpots = eraseSpots.filter(s => s.opacity > 0);

        drawHelmet();

        if (anyAlive && !isHovering) {
            animFrame = requestAnimationFrame(animateRestore);
        }
    }

    // ── Init ──
    helmetImg.onload = () => {
        resizeCanvas();
    };
    if (helmetImg.complete) {
        resizeCanvas();
    }

    window.addEventListener('resize', resizeCanvas);
}
// ─────────────────────────────────────────────────────────────────────────────


// Floating Particles Generation
const particlesContainer = document.getElementById('particles');
const particleCount = 50;

if (particlesContainer) {
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        // Random positioning
        const x = Math.random() * 100;
        const delay = Math.random() * 10;
        const duration = 10 + Math.random() * 20;
        const size = Math.random() * 3;

        particle.style.left = `${x}%`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        particlesContainer.appendChild(particle);
    }
}

