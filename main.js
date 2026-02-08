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

// 3D Tilt Effect
const tiltElements = document.querySelectorAll('.skill-card, .portfolio-item, .about-img, .contact-form, .hero-image-container');

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

// Floating Particles Generation
const particlesContainer = document.getElementById('particles');
const particleCount = 50;

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

