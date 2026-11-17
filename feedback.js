/**
 * ASHAD PORTFOLIO — CLIENT FEEDBACK COMPONENT
 * Premium 5-Position Testimonial Carousel Module
 * Separates testimonial data registry from presentation/interaction logic.
 */

(function () {
    'use strict';

    /**
     * FIVE-CARD GENUINE TESTIMONIAL REGISTRY
     * All 5 reviews are verified authentic Google reviews in specified order:
     * 01. Nijabath Rahman
     * 02. Sali Cmd
     * 03. Mohammed Favas VK
     * 04. Shibil Ak
     * 05. Abdul Hadi
     */
    const TESTIMONIALS_REGISTRY = [
        {
            id: 1,
            name: "Nijabath Rahman",
            profileUrl: "https://www.google.com/maps/contrib/106664449515730235394/reviews?hl=en-GB",
            rating: 5,
            initials: "NR",
            source: "Google Review",
            isSample: false,
            verified: true,
            text: "I’m Nijabath Rahman, COO of Skill Arcadia, and I’m delighted to recommend Ashad for his exceptional creativity, dedication, and professionalism.\n\nHaving worked with Ashad for over a year as a Creative Designer at Skill Arcadia, what has always stood out to me is his ability to go beyond the brief. He doesn’t simply execute what is assigned to him; he brings his own creative vision, suggests fresh ideas, and consistently finds ways to make the final output even better.\n\nWhat I admire most about Ashad is his sense of ownership. He approaches every assignment as if the success of the work were his own personal achievement. His initiative, attention to detail, and commitment to delivering quality make him far more than just a designer; he is someone who genuinely contributes to the growth of the team and the brand.\n\nIt has been a pleasure working with someone who combines creativity with such a strong sense of responsibility. I would highly recommend Ashad to any team looking for a creative professional who doesn’t just complete tasks but takes ownership, adds value, and strives to make every piece of work exceptional.",
            published: true
        },
        {
            id: 2,
            name: "Sali Cmd",
            profileUrl: "https://www.google.com/maps/contrib/100132800354520087874/reviews?hl=en-GB",
            rating: 5,
            initials: "SC",
            source: "Google Review",
            isSample: false,
            verified: true,
            text: "Working with Ashad ,my senior graphic designer has been a great experience. He has helped me so much, shared valuable knowledge, and guided me whenever I needed support. I’ve learned a lot from his creativity, experience, and professionalism. He is always supportive and encourages me to improve my design skills. I’m truly grateful for all the help and guidance he has given me. Highly recommended for anyone looking for creative and professional design work....",
            published: true
        },
        {
            id: 3,
            name: "Mohammed Favas VK",
            profileUrl: "https://www.google.com/maps/contrib/110766320495810648440/reviews?hl=en-GB",
            rating: 5,
            initials: "MF",
            source: "Google Review",
            isSample: false,
            verified: true,
            text: "Amazing experience working with such a talented and creative graphic designer! The designs are truly impressive, with great attention to detail, creativity, and professionalism. My friend always understands the requirements perfectly and delivers beautiful work with a lot of dedication and passion. Highly recommended to anyone looking for unique, high-quality, and eye-catching designs. Keep up the great work and wishing you lots of success ahead.",
            published: true
        },
        {
            id: 4,
            name: "Shibil Ak",
            profileUrl: "https://www.google.com/maps/contrib/116688691356186532304/reviews?hl=en-GB",
            rating: 5,
            initials: "SA",
            source: "Google Review",
            isSample: false,
            verified: true,
            text: "Creative designs and good communication. The work was delivered professionally and on time.",
            published: true
        },
        {
            id: 5,
            name: "Abdul Hadi",
            profileUrl: "https://www.google.com/maps/contrib/112745954721194370355/reviews?hl=en-GB",
            rating: 5,
            initials: "AH",
            source: "Google Review",
            isSample: false,
            verified: true,
            text: "Great experience working with ASHAD. The designs were creative, professional, and matched my requirements perfectly.",
            published: true
        }
    ];

    class FeedbackCarousel {
        constructor() {
            this.carouselWrapper = document.getElementById('feedbackCarousel');
            if (!this.carouselWrapper) return;

            this.viewport = document.getElementById('feedbackViewport');
            this.track = document.getElementById('feedbackTrack');
            this.prevBtn = document.getElementById('feedbackPrevBtn');
            this.nextBtn = document.getElementById('feedbackNextBtn');
            this.paginationContainer = document.getElementById('feedbackPagination');

            this.currentIndex = 0;

            // Touch gesture tracking for mobile swiping
            this.touchStartX = 0;
            this.touchStartY = 0;
            this.touchEndX = 0;
            this.touchEndY = 0;
            this.isSwiping = false;

            this.init();
        }

        getCards() {
            if (!this.track) return [];
            return Array.from(this.track.querySelectorAll('.feedback-card:not(.feedback-card--unpublished)'));
        }

        getVisibleCardsCount() {
            const width = window.innerWidth;
            if (width > 1024) return 3;
            if (width > 768) return 2;
            return 1;
        }

        getMaxIndex() {
            const totalCards = this.getCards().length;
            const visible = this.getVisibleCardsCount();
            return Math.max(0, totalCards - visible);
        }

        init() {
            this.initReadMoreButtons();
            this.renderPagination();
            this.updateCarouselState();
            this.bindEvents();
            // Note: Auto-scrolling completely disabled per design requirement.
            // Transitions occur ONLY on direct visitor interaction.
        }

        initReadMoreButtons() {
            const readMoreBtns = document.querySelectorAll('.feedback-read-more-btn');
            readMoreBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Never trigger carousel click or swipe
                    const targetId = btn.getAttribute('aria-controls');
                    const wrapper = targetId ? document.getElementById(targetId) : btn.previousElementSibling;
                    const isExpanded = btn.getAttribute('aria-expanded') === 'true';
                    const newExpanded = !isExpanded;

                    btn.setAttribute('aria-expanded', newExpanded ? 'true' : 'false');
                    btn.classList.toggle('is-expanded', newExpanded);

                    const textSpan = btn.querySelector('.btn-text');
                    if (textSpan) {
                        textSpan.textContent = newExpanded ? 'Read Less' : 'Read More';
                    }

                    if (wrapper) {
                        wrapper.classList.toggle('expanded', newExpanded);
                        wrapper.classList.toggle('collapsed', !newExpanded);
                    }
                });
            });
        }

        bindEvents() {
            // Previous & Next Arrow Buttons
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => {
                    this.prevSlide();
                });
            }

            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => {
                    this.nextSlide();
                });
            }

            // Keyboard navigation
            this.carouselWrapper.setAttribute('tabindex', '0');
            this.carouselWrapper.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.prevSlide();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.nextSlide();
                }
            });

            // Touch swiping on viewport (Mobile touch gestures)
            if (this.viewport) {
                this.viewport.addEventListener('touchstart', (e) => {
                    // Do not interfere if user is tapping a button inside a card
                    if (e.target.closest('.feedback-read-more-btn') || e.target.closest('a')) return;

                    this.touchStartX = e.touches[0].clientX;
                    this.touchStartY = e.touches[0].clientY;
                    this.touchEndX = this.touchStartX;
                    this.touchEndY = this.touchStartY;
                    this.isSwiping = true;
                }, { passive: true });

                this.viewport.addEventListener('touchmove', (e) => {
                    if (!this.isSwiping) return;
                    this.touchEndX = e.touches[0].clientX;
                    this.touchEndY = e.touches[0].clientY;
                }, { passive: true });

                this.viewport.addEventListener('touchend', (e) => {
                    if (!this.isSwiping) return;
                    this.isSwiping = false;

                    const deltaX = this.touchEndX - this.touchStartX;
                    const deltaY = this.touchEndY - this.touchStartY;

                    // Ensure horizontal swipe is dominant and passes threshold
                    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
                        if (deltaX < 0) {
                            this.nextSlide();
                        } else {
                            this.prevSlide();
                        }
                    }
                }, { passive: true });
            }

            // Window resize with debounce
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    const maxIndex = this.getMaxIndex();
                    if (this.currentIndex > maxIndex) {
                        this.currentIndex = maxIndex;
                    }
                    this.renderPagination();
                    this.updateCarouselState();
                }, 100);
            });
        }

        renderPagination() {
            if (!this.paginationContainer) return;
            this.paginationContainer.innerHTML = '';

            const maxIndex = this.getMaxIndex();
            const totalDots = maxIndex + 1;

            for (let i = 0; i < totalDots; i++) {
                const dot = document.createElement('button');
                dot.className = `pagination-dot ${i === this.currentIndex ? 'active' : ''}`;
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-selected', i === this.currentIndex ? 'true' : 'false');
                dot.setAttribute('aria-label', `Go to review slide ${i + 1}`);

                dot.addEventListener('click', () => {
                    this.goToSlide(i);
                });

                this.paginationContainer.appendChild(dot);
            }
        }

        updateCarouselState() {
            if (!this.track) return;

            const visible = this.getVisibleCardsCount();
            const maxIndex = this.getMaxIndex();

            if (this.currentIndex > maxIndex) {
                this.currentIndex = maxIndex;
            }

            // Calculate translation percentage + gap offset
            const translation = `calc(-1 * ${this.currentIndex} * (100% + 20px) / ${visible})`;
            this.track.style.transform = `translateX(${translation})`;

            // Update arrow disabled states: wrap-around enabled if maxIndex > 0
            if (this.prevBtn) {
                this.prevBtn.disabled = (maxIndex === 0);
                this.prevBtn.setAttribute('aria-disabled', maxIndex === 0 ? 'true' : 'false');
            }
            if (this.nextBtn) {
                this.nextBtn.disabled = (maxIndex === 0);
                this.nextBtn.setAttribute('aria-disabled', maxIndex === 0 ? 'true' : 'false');
            }

            // Update active pagination dots
            if (this.paginationContainer) {
                const dots = this.paginationContainer.querySelectorAll('.pagination-dot');
                dots.forEach((dot, index) => {
                    const isActive = (index === this.currentIndex);
                    dot.classList.toggle('active', isActive);
                    dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
                });
            }
        }

        goToSlide(index) {
            const maxIndex = this.getMaxIndex();
            if (index < 0) {
                this.currentIndex = maxIndex;
            } else if (index > maxIndex) {
                this.currentIndex = 0;
            } else {
                this.currentIndex = index;
            }
            this.updateCarouselState();
        }

        nextSlide() {
            const maxIndex = this.getMaxIndex();
            if (maxIndex === 0) return;
            const nextIdx = (this.currentIndex + 1 > maxIndex) ? 0 : this.currentIndex + 1;
            this.goToSlide(nextIdx);
        }

        prevSlide() {
            const maxIndex = this.getMaxIndex();
            if (maxIndex === 0) return;
            const prevIdx = (this.currentIndex - 1 < 0) ? maxIndex : this.currentIndex - 1;
            this.goToSlide(prevIdx);
        }
    }

    // Expose registry and controller to window for updates / extensibility
    window.AshadFeedback = {
        registry: TESTIMONIALS_REGISTRY,
        FeedbackCarousel: FeedbackCarousel,
        instance: null
    };

    // Auto-init on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.AshadFeedback.instance = new FeedbackCarousel();
        });
    } else {
        window.AshadFeedback.instance = new FeedbackCarousel();
    }
})();
