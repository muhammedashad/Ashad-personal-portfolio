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


// Upgraded Cosmic Particle Starfield Canvas
const canvas = document.createElement('canvas');
canvas.id = 'cosmicBg';
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100vw';
canvas.style.height = '100vh';
canvas.style.zIndex = '-2';
canvas.style.pointerEvents = 'none';
document.body.appendChild(canvas);

const glCtx = canvas.getContext('2d');
let stars = [];
const STAR_COUNT = 100;
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

class Star {
    constructor() {
        this.reset();
        this.y = Math.random() * height;
    }
    reset() {
        this.x = Math.random() * width;
        this.y = -10;
        this.size = Math.random() * 2 + 0.5;
        this.speedY = Math.random() * 0.4 + 0.1;
        this.speedX = (Math.random() - 0.5) * 0.1;
        this.alpha = Math.random() * 0.6 + 0.2;
        this.glow = Math.random() > 0.85;
    }
    update(mouse) {
        this.y += this.speedY;
        this.x += this.speedX;
        
        // Mouse drift influence
        if (mouse.x && mouse.y) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 150) {
                const force = (150 - dist) / 150;
                this.x += (dx / dist) * force * 1.5;
                this.y += (dy / dist) * force * 1.5;
            }
        }

        if (this.y > height || this.x < 0 || this.x > width) {
            this.reset();
        }
    }
    draw() {
        glCtx.globalAlpha = this.alpha;
        glCtx.fillStyle = this.glow ? '#00f3ff' : '#ffffff';
        if (this.glow) {
            glCtx.shadowBlur = 10;
            glCtx.shadowColor = '#00f3ff';
        } else {
            glCtx.shadowBlur = 0;
        }
        glCtx.beginPath();
        glCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        glCtx.fill();
    }
}

for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(new Star());
}

let mousePos = { x: null, y: null };
window.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
});

function animateStars() {
    glCtx.clearRect(0, 0, width, height);
    stars.forEach(star => {
        star.update(mousePos);
        star.draw();
    });
    drawNebula();
    requestAnimationFrame(animateStars);
}

function drawNebula() {
    glCtx.shadowBlur = 0;
    glCtx.globalAlpha = 0.08;
    const grad = glCtx.createRadialGradient(
        width * 0.7, height * 0.4, 0,
        width * 0.7, height * 0.4, Math.max(width, height) * 0.5
    );
    grad.addColorStop(0, '#bc13fe');
    grad.addColorStop(0.5, '#00f3ff');
    grad.addColorStop(1, 'transparent');
    glCtx.fillStyle = grad;
    glCtx.fillRect(0, 0, width, height);
}

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

animateStars();

// About Core Metrics Scroll Animation
const metricBars = document.querySelectorAll('.metric-bar');
const aboutSection = document.getElementById('about');

const animateMetrics = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            metricBars.forEach(bar => {
                const target = bar.getAttribute('data-progress');
                bar.style.width = `${target}%`;
            });
            observer.unobserve(entry.target);
        }
    });
};

const metricsObserver = new IntersectionObserver(animateMetrics, {
    threshold: 0.2
});

if (aboutSection) {
    metricsObserver.observe(aboutSection);
}

// Portfolio Filter Logic
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        portfolioItems.forEach(item => {
            if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, 50);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    });
});

// Project Modals Data & Operations
const projectData = {
    'neon-branding': {
        title: 'Cyberpunk Branding Identity',
        category: 'Graphic Design',
        software: 'Illustrator / Photoshop / Midjourney',
        desc: 'A complete branding package for a next-gen digital startup. Features neon typographic layouts, geometric vector artwork, and generative assets aligned with a dark cybernetic aesthetic.',
        bgClass: 'design-bg',
        link: 'https://behance.net'
    },
    'scifi-motion': {
        title: 'Sci-Fi Cinematic Motion Reel',
        category: 'Video Edit & VFX',
        software: 'After Effects / Premiere Pro / Blender',
        desc: 'A premium compilation and sizzle reel featuring futuristic visual assets, high-tech HUD overlays, holographic particle simulations, and dynamic sound design integration.',
        bgClass: 'video-bg',
        link: 'https://vimeo.com'
    },
    'growth-hack': {
        title: 'Quantum Social Growth Campaign',
        category: 'Digital Marketing',
        software: 'Meta Ads Manager / Semrush / Figma',
        desc: 'A comprehensive growth campaign targeting web enthusiasts. Leveraged highly stylized neon creatives and search term optimizations to increase organic reach and search conversion rate.',
        bgClass: 'marketing-bg',
        link: 'https://google.com'
    }
};

const modal = document.getElementById('projectModal');
const modalClose = document.querySelector('.modal-close');
const modalTitle = document.getElementById('modalTitle');
const modalCategory = document.getElementById('modalCategory');
const modalSoftware = document.getElementById('modalSoftware');
const modalDesc = document.getElementById('modalDesc');
const modalImg = document.getElementById('modalImg');
const modalLink = document.getElementById('modalLink');

portfolioItems.forEach(item => {
    item.addEventListener('click', () => {
        const projKey = item.getAttribute('data-project');
        const data = projectData[projKey];

        if (data) {
            modalTitle.textContent = data.title;
            modalCategory.textContent = data.category;
            modalSoftware.textContent = data.software;
            modalDesc.textContent = data.desc;
            modalLink.href = data.link;

            modalImg.className = `modal-placeholder-img ${data.bgClass}`;
            modalImg.textContent = item.querySelector('.placeholder-img').textContent;

            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('open');
            }, 10);
        }
    });
});

if (modalClose && modal) {
    modalClose.addEventListener('click', () => {
        modal.classList.remove('open');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('open');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    });
}

// Google Form Submission Handling
const contactForm = document.querySelector('.contact-form');
const formStatus = document.getElementById('formStatus');

if (contactForm && formStatus) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        
        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        formStatus.textContent = '';
        formStatus.className = 'form-status';
        formStatus.style.opacity = '1';

        const formData = new FormData(contactForm);
        const searchParams = new URLSearchParams(formData);

        fetch(contactForm.action, {
            method: 'POST',
            body: searchParams,
            mode: 'no-cors'
        })
        .then(() => {
            // Success
            formStatus.textContent = 'Message sent successfully!';
            formStatus.classList.add('success');
            contactForm.reset();
        })
        .catch(err => {
            console.error('Submission error:', err);
            formStatus.textContent = 'Oops! Something went wrong. Please try again.';
            formStatus.classList.add('error');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
            
            // Fade out message after 5 seconds
            setTimeout(() => {
                formStatus.style.opacity = '0';
                setTimeout(() => {
                    formStatus.textContent = '';
                    formStatus.className = 'form-status';
                    formStatus.style.opacity = '1';
                }, 500);
            }, 5000);
        });
    });
}

