// Utilities
const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Unified Intersection Observer for Scroll Reveals
const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

document.querySelectorAll('.reveal-on-scroll, .timeline-item').forEach(el => {
    revealObserver.observe(el);
});

// Custom Cursor Logic
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');

if (!isMobile && cursorDot && cursorOutline) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let outlineX = mouseX;
    let outlineY = mouseY;
    let isMoving = false;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Dot follows instantly
        cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        
        if (!isMoving) {
            isMoving = true;
            requestAnimationFrame(animateCursorOutline);
        }
    });

    function animateCursorOutline() {
        // Smooth interpolation for the outline
        const dx = mouseX - outlineX;
        const dy = mouseY - outlineY;
        
        outlineX += dx * 0.15;
        outlineY += dy * 0.15;
        
        cursorOutline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0)`;
        
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            requestAnimationFrame(animateCursorOutline);
        } else {
            isMoving = false;
        }
    }

    // Cursor Hover Effect
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .portfolio-item, .skill-card, .hero-image-container');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });

    // Cursor Click Effect
    window.addEventListener('mousedown', () => document.body.classList.add('clicking'));
    window.addEventListener('mouseup', () => document.body.classList.remove('clicking'));
} else if (cursorDot && cursorOutline) {
    // Hide cursors entirely on mobile
    cursorDot.style.display = 'none';
    cursorOutline.style.display = 'none';
}

// 3D Tilt Effect (Optimized with requestAnimationFrame)
const tiltElements = document.querySelectorAll('.skill-card, .portfolio-item, .contact-form');

if (!isMobile) {
    tiltElements.forEach(el => {
        let ticking = false;
        
        el.addEventListener('mousemove', (e) => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const rect = el.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    const rotateX = ((y - centerY) / centerY) * -10;
                    const rotateY = ((x - centerX) / centerX) * 10;

                    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
                    ticking = false;
                });
                ticking = true;
            }
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

// ─── Liquid Scratch Reveal (Optimized) ───────────────────────────────────────
const revealContainer = document.getElementById('revealContainer');
const revealCanvas = document.getElementById('revealCanvas');
const faceImage = document.getElementById('faceImage');

if (!isMobile && revealContainer && revealCanvas && faceImage) {
    const ctx = revealCanvas.getContext('2d');
    const helmetImg = new Image();
    helmetImg.src = './assets/robot-helmet.png';

    let eraseSpots = []; 
    let animFrame = null;
    let isHovering = false;
    let isDrawing = false;
    let lastMousePos = null;

    const BRUSH_RADIUS = 220;    // Larger brush for quicker reveal
    const RESTORE_SPEED = 0.03;  // Faster restore
    const MAX_OPACITY_DIP = 0.98;

    function resizeCanvas() {
        const rect = faceImage.getBoundingClientRect();
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
            const grad = ctx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, spot.r);
            grad.addColorStop(0, `rgba(0,0,0,${spot.opacity})`);
            grad.addColorStop(0.5, `rgba(0,0,0,${spot.opacity * 0.7})`);
            grad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        });
    }

    function toCanvasCoords(clientX, clientY) {
        const rect = faceImage.getBoundingClientRect();
        const scaleX = revealCanvas.width / rect.width;
        const scaleY = revealCanvas.height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    function processMouseDraw() {
        if (!isHovering || !lastMousePos) {
            isDrawing = false;
            return;
        }

        const { x, y } = toCanvasCoords(lastMousePos.x, lastMousePos.y);
        const existing = eraseSpots.find(s => Math.hypot(s.x - x, s.y - y) < BRUSH_RADIUS * 0.4);
        
        if (existing) {
            existing.x = x;
            existing.y = y;
            existing.opacity = Math.min(existing.opacity + 0.45, MAX_OPACITY_DIP);
        } else {
            eraseSpots.push({ x, y, r: BRUSH_RADIUS, opacity: 0.6 });
        }
        
        drawHelmet();
        
        // Only keep looping if mouse is moving
        isDrawing = false; 
    }

    revealContainer.addEventListener('mousemove', (e) => {
        lastMousePos = { x: e.clientX, y: e.clientY };
        if (!isDrawing) {
            isDrawing = true;
            requestAnimationFrame(processMouseDraw);
        }
    });

    revealContainer.addEventListener('mouseleave', () => {
        isHovering = false;
        lastMousePos = null;
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
        eraseSpots = eraseSpots.filter(s => s.opacity > 0);
        drawHelmet();

        if (anyAlive && !isHovering) {
            animFrame = requestAnimationFrame(animateRestore);
        }
    }

    helmetImg.onload = resizeCanvas;
    if (helmetImg.complete) resizeCanvas();
    window.addEventListener('resize', () => {
        if (!isMobile) resizeCanvas();
    });
} else if (isMobile && revealCanvas) {
    // Disable canvas mask on mobile completely
    revealCanvas.style.display = 'none';
}

// About Core Metrics Scroll Animation
const metricBars = document.querySelectorAll('.metric-bar');
if (metricBars.length > 0) {
    const metricsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                metricBars.forEach(bar => {
                    const target = bar.getAttribute('data-progress');
                    bar.style.width = `${target}%`;
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    const aboutSection = document.getElementById('about');
    if (aboutSection) metricsObserver.observe(aboutSection);
}

// Portfolio Filter Logic
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            portfolioItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    requestAnimationFrame(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    });
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        if (item.style.opacity === '0') {
                            item.style.display = 'none';
                        }
                    }, 300);
                }
            });
        });
    });
}

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

if (modal && portfolioItems.length > 0) {
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
                // Trigger reflow
                void modal.offsetWidth;
                modal.classList.add('open');
            }
        });
    });

    const closeModal = () => {
        modal.classList.remove('open');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    };

    if (modalClose) modalClose.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

// Google Form Submission Handling
const contactForm = document.querySelector('.contact-form');
const formStatus = document.getElementById('formStatus');

if (contactForm && formStatus) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        
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

// Stats Counter Animation (Optimized with requestAnimationFrame)
const statsSection = document.getElementById('stats');
const statNumbers = document.querySelectorAll('.stat-number');

if (statsSection && statNumbers.length > 0) {
    let hasAnimated = false;

    const animateStats = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                const duration = 2000;
                
                statNumbers.forEach(stat => {
                    const target = parseInt(stat.getAttribute('data-target'));
                    let startTime = null;
                    
                    const step = (timestamp) => {
                        if (!startTime) startTime = timestamp;
                        const progress = Math.min((timestamp - startTime) / duration, 1);
                        
                        // Ease out cubic
                        const easeProgress = 1 - Math.pow(1 - progress, 3);
                        const current = Math.floor(easeProgress * target);
                        
                        stat.textContent = current;
                        
                        if (progress < 1) {
                            requestAnimationFrame(step);
                        } else {
                            stat.textContent = target;
                        }
                    };
                    
                    requestAnimationFrame(step);
                });
                
                observer.unobserve(entry.target);
            }
        });
    };

    const statsObserver = new IntersectionObserver(animateStats, { threshold: 0.5 });
    statsObserver.observe(statsSection);
}

// FAQ Accordion Logic
const faqQuestions = document.querySelectorAll('.faq-question');
if (faqQuestions.length > 0) {
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const currentItem = question.parentElement;
            const isActive = currentItem.classList.contains('active');
            
            // Close all items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // If it wasn't active, open it
            if (!isActive) {
                currentItem.classList.add('active');
            }
        });
    });
}
