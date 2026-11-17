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

// ─── Mobile Navigation Overlay Toggle ─────────────────────────────────────────

// Extra safety: ensure desktop nav links never render on mobile viewports
const desktopNav = document.getElementById('desktopNavLinks');
if (desktopNav) {
    const syncNavState = () => {
        if (window.innerWidth <= 900) {
            desktopNav.style.display = 'none';
            desktopNav.setAttribute('aria-hidden', 'true');
        } else {
            desktopNav.style.display = '';
            desktopNav.removeAttribute('aria-hidden');
        }
    };
    syncNavState();
    window.addEventListener('resize', syncNavState);
}

const navToggle = document.getElementById('navToggle');
const mobileNavOverlay = document.getElementById('mobileNavOverlay');
const mobileNavClose = document.getElementById('mobileNavClose');

if (navToggle && mobileNavOverlay) {
    const toggleMobileMenu = (open) => {
        const isOpen = open !== undefined ? open : !mobileNavOverlay.classList.contains('active');
        mobileNavOverlay.classList.toggle('active', isOpen);
        navToggle.classList.toggle('active', isOpen);
        navToggle.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
        document.documentElement.style.overflow = isOpen ? 'hidden' : '';
    };

    navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMobileMenu();
    });

    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMobileMenu(false);
        });
    }

    // Close menu when any mobile navigation item is clicked
    mobileNavOverlay.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggleMobileMenu(false);
        });
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileNavOverlay.classList.contains('active')) {
            toggleMobileMenu(false);
        }
    });

    // Close when tapping on the overlay backdrop outside the panel
    mobileNavOverlay.addEventListener('click', (e) => {
        if (e.target === mobileNavOverlay) {
            toggleMobileMenu(false);
        }
    });

    mobileNavOverlay.addEventListener('touchstart', (e) => {
        if (e.target === mobileNavOverlay) {
            toggleMobileMenu(false);
        }
    }, { passive: true });
}


// Unified Intersection Observer for Scroll Reveals
const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.04, rootMargin: "0px 0px 60px 0px" });

document.querySelectorAll('.reveal-on-scroll, .timeline-item').forEach(el => {
    revealObserver.observe(el);
});

// Robust visibility handler to guarantee tall/dynamic sections never remain hidden
function checkScrollVisibility() {
    document.querySelectorAll('.reveal-on-scroll:not(.visible), .timeline-item:not(.visible)').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 100 && rect.bottom > -100) {
            el.classList.add('visible');
            if (typeof revealObserver !== 'undefined' && revealObserver) {
                revealObserver.unobserve(el);
            }
        }
    });
}
window.addEventListener('scroll', checkScrollVisibility, { passive: true });
window.addEventListener('resize', checkScrollVisibility, { passive: true });
setTimeout(checkScrollVisibility, 100);
setTimeout(checkScrollVisibility, 500);

// Custom Cursor Logic
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');

const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia('(hover: none) and (pointer: coarse)').matches;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!isTouchDevice && !prefersReduced && cursorDot && cursorOutline) {
    let mouseX = -100;
    let mouseY = -100;
    let outlineX = -100;
    let outlineY = -100;
    let rafId = null;
    let isInitialized = false;

    const render = () => {
        // Dot follows instantly with precise sub-pixel centering
        cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

        // Outline smoothly chases mouse position with high-precision damping
        const dx = mouseX - outlineX;
        const dy = mouseY - outlineY;

        outlineX += dx * 0.18;
        outlineY += dy * 0.18;

        cursorOutline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate(-50%, -50%)`;

        if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
            rafId = requestAnimationFrame(render);
        } else {
            rafId = null;
        }
    };

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!isInitialized) {
            outlineX = mouseX;
            outlineY = mouseY;
            isInitialized = true;
            document.body.classList.add('cursor-active');
        }

        if (!rafId) {
            rafId = requestAnimationFrame(render);
        }
    }, { passive: true });

    document.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-active');
    });

    document.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-active');
    });

    // Event Delegation for Interactive and Text Hover States
    document.addEventListener('mouseover', (e) => {
        const target = e.target;
        if (!target) return;

        // Interactive elements: links, buttons, form controls, cards, interactive triggers
        const isClickable = target.closest('a, button, [role="button"], input, textarea, select, .portfolio-item, .skill-card, .contact-card, .cert-card, .feedback-card, .footer-nav-item, .chat-whatsapp-btn, .filter-btn, .modal-close, .nav-btn, .hamburger, .social-icon-btn, .tag');

        if (isClickable) {
            document.body.classList.add('cursor-hover');
            document.body.classList.remove('cursor-text');
            return;
        }

        // Text elements: headings, paragraphs, labels, spans with content (when not inside clickable)
        const isText = target.closest('p, h1, h2, h3, h4, h5, h6, blockquote, label, .terminal-text, .contact-subtitle, .about-highlight');
        if (isText && !isClickable) {
            document.body.classList.add('cursor-text');
            document.body.classList.remove('cursor-hover');
            return;
        }

        // Default surface
        document.body.classList.remove('cursor-hover');
        document.body.classList.remove('cursor-text');
    }, { passive: true });

    // Cursor Click Effect
    window.addEventListener('mousedown', () => {
        document.body.classList.add('cursor-clicking');
    }, { passive: true });

    window.addEventListener('mouseup', () => {
        document.body.classList.remove('cursor-clicking');
    }, { passive: true });
} else if (cursorDot && cursorOutline) {
    // Hide cursors entirely on touch / reduced motion
    cursorDot.style.display = 'none';
    cursorOutline.style.display = 'none';
}

// 3D Tilt Effect (Optimized with requestAnimationFrame)
const tiltElements = document.querySelectorAll('.skill-card, .portfolio-item, .contact-card');

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

// About Skills Chips Staggered Entrance Animation
const skillChips = document.querySelectorAll('.about-skill-chip');
if (skillChips.length > 0) {
    const chipsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                skillChips.forEach((chip, index) => {
                    setTimeout(() => {
                        chip.classList.add('visible');
                    }, index * 90);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    const skillsSection = document.querySelector('.about-skills-section') || document.getElementById('about');
    if (skillsSection) chipsObserver.observe(skillsSection);
}

// Subtle 3D Depth for Portrait Frame ONLY (Stable front-facing portrait, NO flip on click or hover)
const portraitFrame = document.querySelector('.about-portrait-frame');
if (portraitFrame) {
    // Explicitly prevent any click flip behavior
    portraitFrame.addEventListener('click', (e) => {
        e.preventDefault();
    });

    if (!isMobile) {
        let frameTicking = false;
        portraitFrame.addEventListener('mousemove', (e) => {
            if (!frameTicking) {
                window.requestAnimationFrame(() => {
                    const rect = portraitFrame.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    // Subtle tilt on frame ONLY (max 4.5 degrees)
                    const rotX = ((y - centerY) / centerY) * -4.5;
                    const rotY = ((x - centerX) / centerX) * 4.5;

                    portraitFrame.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-2px)`;
                    frameTicking = false;
                });
                frameTicking = true;
            }
        });

        portraitFrame.addEventListener('mouseleave', () => {
            portraitFrame.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    }
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
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
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
        question.setAttribute('aria-expanded', 'false');
        question.addEventListener('click', () => {
            const currentItem = question.parentElement;
            const answer = currentItem.querySelector('.faq-answer');
            const isActive = currentItem.classList.contains('active');
            
            // Close all items smoothly
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                const qBtn = item.querySelector('.faq-question');
                if (qBtn) qBtn.setAttribute('aria-expanded', 'false');
                const aDiv = item.querySelector('.faq-answer');
                if (aDiv) aDiv.style.maxHeight = null;
            });
            
            // If it wasn't active, expand it smoothly
            if (!isActive) {
                currentItem.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
                if (answer) {
                    answer.style.maxHeight = (answer.scrollHeight + 35) + 'px';
                }
            }
        });
    });
}


// ─── Subtle Global Space Background (Stars, Cosmic Particles & Ambient Glow) ───
function initGlobalSpaceBackground() {
    const canvas = document.getElementById('globalSpaceCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let stars = [];
    let particles = [];
    const STAR_COUNT = 140;
    const PARTICLE_COUNT = 16;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        initElements();
    }

    function initElements() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            const isCyan = Math.random() < 0.16;
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: isCyan ? (Math.random() * 0.9 + 0.9) : (Math.random() * 0.7 + 0.5),
                baseAlpha: Math.random() * 0.4 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.008,
                twinklePhase: Math.random() * Math.PI * 2,
                isCyan: isCyan
            });
        }

        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.4 + 0.8,
                vx: (Math.random() - 0.5) * 0.12,
                vy: (Math.random() * -0.15) - 0.04,
                alpha: Math.random() * 0.25 + 0.15,
                color: Math.random() < 0.6 ? 'rgba(0, 229, 255, ' : 'rgba(168, 85, 247, '
            });
        }
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    function render() {
        if (document.hidden) {
            requestAnimationFrame(render);
            return;
        }

        ctx.clearRect(0, 0, width, height);

        // 1. Deep Space Base
        ctx.fillStyle = '#050713';
        ctx.fillRect(0, 0, width, height);

        // 2. Extremely light atmospheric glow
        const gradCyan = ctx.createRadialGradient(width * 0.2, height * 0.25, 0, width * 0.2, height * 0.25, width * 0.65);
        gradCyan.addColorStop(0, 'rgba(0, 229, 255, 0.035)');
        gradCyan.addColorStop(1, 'transparent');
        ctx.fillStyle = gradCyan;
        ctx.fillRect(0, 0, width, height);

        const gradIndigo = ctx.createRadialGradient(width * 0.82, height * 0.75, 0, width * 0.82, height * 0.75, width * 0.55);
        gradIndigo.addColorStop(0, 'rgba(120, 80, 255, 0.025)');
        gradIndigo.addColorStop(1, 'transparent');
        ctx.fillStyle = gradIndigo;
        ctx.fillRect(0, 0, width, height);

        // 3. Draw Stars
        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            s.twinklePhase += s.twinkleSpeed;
            const a = Math.max(0.08, Math.min(0.85, s.baseAlpha + Math.sin(s.twinklePhase) * 0.22));

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            if (s.isCyan) {
                ctx.fillStyle = `rgba(0, 229, 255, ${a})`;
                ctx.shadowBlur = 4;
                ctx.shadowColor = '#00e5ff';
            } else {
                ctx.fillStyle = `rgba(224, 235, 255, ${a})`;
                ctx.shadowBlur = 0;
            }
            ctx.fill();
        }
        ctx.shadowBlur = 0;

        // 4. Slow Drift Particles
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < -10) p.y = height + 10;
            if (p.x < -10) p.x = width + 10;
            if (p.x > width + 10) p.x = -10;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `${p.color}${p.alpha})`;
            ctx.fill();
        }

        requestAnimationFrame(render);
    }

    render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobalSpaceBackground);
} else {
    initGlobalSpaceBackground();
}
