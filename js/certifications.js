/**
 * ASHAD PORTFOLIO — CERTIFICATIONS & ACHIEVEMENTS CAROUSEL CONTROLLER
 * Architecture: Data-driven, swipeable/draggable carousel, responsive, accessible.
 * Design Reference: Client Feedback section layout & navigation.
 */

const CERTIFICATIONS_DATA = [
    // -------------------------------------------------------------
    // 01 — DEGREE COMPLETED
    // -------------------------------------------------------------
    {
        id: "alagappa-bsc-visual-communication-degree",
        number: "01",
        title: "B.Sc. Visual Communication – Degree Completed",
        issuer: "Alagappa University",
        college: "Vismayam College of Art and Media",
        achievement: "Successfully completed the three-year Bachelor of Science degree in Visual Communication.",
        category: "degree",
        categoryLabel: "Degree",
        credentialType: "Bachelor of Science",
        date: "30 May 2026",
        imagePath: "assets/Alagappa University Logo.png",
        isEmblem: true,
        verifyUrl: null
    },

    // -------------------------------------------------------------
    // 02 — DEGREE COURSE COMPLETION CERTIFICATE
    // -------------------------------------------------------------
    {
        id: "alagappa-bsc-visual-communication-certificate",
        number: "02",
        title: "B.Sc. Visual Communication – Certificate of Completion",
        issuer: "Alagappa University",
        college: "Vismayam College of Art and Media",
        category: "degree",
        categoryLabel: "Degree",
        credentialType: "Certificate of Completion",
        date: "30 May 2026",
        imagePath: "assets/Certificate of Completion.jpg",
        isEmblem: false,
        verifyUrl: null
    },

    // -------------------------------------------------------------
    // CATEGORY 01 — WEB DEVELOPMENT
    // -------------------------------------------------------------
    {
        id: "offenso-ai-web-dev",
        title: "AI-Powered Web Development: Build, Host & Deploy",
        issuer: "Offenso Tech School",
        category: "web-dev",
        categoryLabel: "Web Development",
        credentialType: "Certificate of Appreciation",
        date: "31 October 2026",
        imagePath: "assets/AI-Powered Web Development Build, Host & Deploy.jpg",
        verifyUrl: null // No verification URL supplied
    },

    // -------------------------------------------------------------
    // CATEGORY 02 — CYBERSECURITY
    // -------------------------------------------------------------
    {
        id: "redteam360-ethical-hacking",
        title: "Ethical Hacking Associate",
        issuer: "RedTeam360",
        category: "cybersecurity",
        categoryLabel: "Cybersecurity",
        credentialType: "Certificate of Course Completion",
        date: "21 October 2024",
        imagePath: "assets/Ethical Hacking Associate.jpg",
        verifyUrl: null // No verification URL supplied
    },

    // -------------------------------------------------------------
    // CATEGORY 03 — ANTHROPIC / CLAUDE ACADEMY
    // -------------------------------------------------------------
    {
        id: "anthropic-claude-platform-101",
        title: "Claude Platform 101",
        issuer: "Anthropic / Claude Academy",
        category: "anthropic",
        categoryLabel: "Anthropic",
        credentialType: "Certificate of Completion",
        date: "November 2026",
        imagePath: "assets/Claude Platform 101.jpg",
        verifyUrl: "https://academy.claude.com/verify/4fb1ed316260a37fa49649030f2a1a68"
    },
    {
        id: "anthropic-claude-cowork",
        title: "Introduction to Claude Cowork",
        issuer: "Anthropic / Claude Academy",
        category: "anthropic",
        categoryLabel: "Anthropic",
        credentialType: "Certificate of Completion",
        date: "November 2026",
        imagePath: "assets/Introduction to Claude Cowork.jpg",
        verifyUrl: null
    },
    {
        id: "anthropic-building-claude-api",
        title: "Building with the Claude API",
        issuer: "Anthropic / Claude Academy",
        category: "anthropic",
        categoryLabel: "Anthropic",
        credentialType: "Course Completion Badge",
        date: "03 November 2026",
        imagePath: "assets/Building with the Claude API.jpg",
        verifyUrl: "https://academy.claude.com/verify/4fb1ed316260a37fa49649030f2a1a68"
    },
    {
        id: "anthropic-ai-fluency-framework",
        title: "AI Fluency: Framework and Foundations",
        issuer: "Anthropic / Claude Academy",
        category: "anthropic",
        categoryLabel: "Anthropic",
        credentialType: "Course Completion Badge",
        date: "03 November 2026",
        imagePath: "assets/AI Fluency Framework and foundations.jpg",
        verifyUrl: "https://academy.claude.com/verify/d46a255f912df1da10b212658ff9d92e"
    },
    {
        id: "anthropic-ai-fluency-educators",
        title: "AI Fluency for Educators",
        issuer: "Anthropic / Claude Academy",
        category: "anthropic",
        categoryLabel: "Anthropic",
        credentialType: "Course Completion Badge",
        date: "04 November 2026",
        imagePath: "assets/AI Fluency for educators.jpg",
        verifyUrl: "https://academy.claude.com/verify/a5447d8c8b1ae4b97f40c0f06098be3b"
    },
    {
        id: "anthropic-teaching-ai-fluency",
        title: "Teaching AI Fluency",
        issuer: "Anthropic / Claude Academy",
        category: "anthropic",
        categoryLabel: "Anthropic",
        credentialType: "Certificate of Completion",
        date: "November 2026",
        imagePath: "assets/Claude 101.jpg",
        verifyUrl: null
    },
    {
        id: "anthropic-ai-fluency-creative",
        title: "AI Fluency for Creative Work",
        issuer: "Anthropic / Claude Academy",
        category: "anthropic",
        categoryLabel: "Anthropic",
        credentialType: "Course Completion Badge",
        date: "04 November 2026",
        imagePath: "assets/AI Fluency for creative work.jpg",
        verifyUrl: "https://academy.claude.com/verify/d103b625f2e33016715b48b90e589ea1"
    },
    {
        id: "anthropic-claude-code-101",
        title: "Claude Code 101",
        issuer: "Anthropic / Claude Academy",
        category: "anthropic",
        categoryLabel: "Anthropic",
        credentialType: "Certificate of Completion",
        date: "November 2026",
        imagePath: "assets/Claude code 101.jpg",
        verifyUrl: null
    },
    {
        id: "anthropic-claude-code-in-action",
        title: "Claude Code in Action",
        issuer: "Anthropic / Claude Academy",
        category: "anthropic",
        categoryLabel: "Anthropic",
        credentialType: "Certificate of Completion",
        date: "November 2026",
        imagePath: "assets/Claude Code in Action.jpg",
        verifyUrl: null
    },

    // -------------------------------------------------------------
    // CATEGORY 04 — GOOGLE CLOUD / GOOGLE SKILLS
    // -------------------------------------------------------------
    {
        id: "gcp-cloud-vision-api",
        title: "Analyze Images with the Cloud Vision API",
        issuer: "Google Cloud / Google Skills",
        category: "google-cloud",
        categoryLabel: "Google Cloud",
        credentialType: "Skill Badge • Introductory",
        date: "October 2026",
        imagePath: "assets/Analyze Images with the Cloud Vision API.png",
        verifyUrl: "https://www.skills.google/public_profiles/dbe64b24-4217-4c26-92b9-76caee8ff23a/badges/29030216"
    },
    {
        id: "gcp-speech-language-apis",
        title: "Analyze Speech and Language with Google APIs",
        issuer: "Google Cloud / Google Skills",
        category: "google-cloud",
        categoryLabel: "Google Cloud",
        credentialType: "Skill Badge • Introductory",
        date: "October 2026",
        imagePath: "assets/Analyze Speech and Language with Google APIs.png",
        verifyUrl: "https://www.skills.google/public_profiles/dbe64b24-4217-4c26-92b9-76caee8ff23a/badges/29082189"
    },
    {
        id: "gcp-load-balancing-solutions",
        title: "Build Global and Regional Load Balancing Solutions",
        issuer: "Google Cloud / Google Skills",
        category: "google-cloud",
        categoryLabel: "Google Cloud",
        credentialType: "Skill Badge • Intermediate",
        date: "October 2026",
        imagePath: "assets/Build Global and Regional Load Balancing Solutions.png",
        verifyUrl: "https://www.skills.google/public_profiles/dbe64b24-4217-4c26-92b9-76caee8ff23a/badges/29085224"
    },
    {
        id: "gcp-kubernetes-applications",
        title: "Deploy Kubernetes Applications on Google Cloud",
        issuer: "Google Cloud / Google Skills",
        category: "google-cloud",
        categoryLabel: "Google Cloud",
        credentialType: "Skill Badge • Intermediate",
        date: "October 2026",
        imagePath: "assets/Deploy Kubernetes Applications on Google Cloud.png",
        verifyUrl: "https://www.skills.google/public_profiles/dbe64b24-4217-4c26-92b9-76caee8ff23a/badges/29086111"
    },
    {
        id: "gcp-develop-network",
        title: "Develop Your Google Cloud Network",
        issuer: "Google Cloud / Google Skills",
        category: "google-cloud",
        categoryLabel: "Google Cloud",
        credentialType: "Skill Badge • Intermediate",
        date: "October 2026",
        imagePath: "assets/Develop Your Google Cloud Network.png",
        verifyUrl: "https://www.skills.google/public_profiles/dbe64b24-4217-4c26-92b9-76caee8ff23a/badges/29121128"
    },
    {
        id: "gcp-event-driven-messaging",
        title: "Implement Event-Driven Messaging and Automation Workflows",
        issuer: "Google Cloud / Google Skills",
        category: "google-cloud",
        categoryLabel: "Google Cloud",
        credentialType: "Skill Badge • Intermediate",
        date: "October 2026",
        imagePath: "assets/Implement Event-Driven Messaging and Automation Workflows.png",
        verifyUrl: "https://www.skills.google/public_profiles/dbe64b24-4217-4c26-92b9-76caee8ff23a/badges/29122368"
    },
    {
        id: "gcp-speech-language-solutions",
        title: "Implement Speech and Language Solutions with Pre-trained APIs",
        issuer: "Google Cloud / Google Skills",
        category: "google-cloud",
        categoryLabel: "Google Cloud",
        credentialType: "Skill Badge • Intermediate",
        date: "October 2026",
        imagePath: "assets/Implement Speech and Language Solutions with Pre-trained APIs.png",
        verifyUrl: "https://www.skills.google/public_profiles/dbe64b24-4217-4c26-92b9-76caee8ff23a/badges/29151999"
    },
    {
        id: "gcp-cloud-speech-api",
        title: "Using the Google Cloud Speech API",
        issuer: "Google Cloud / Google Skills",
        category: "google-cloud",
        categoryLabel: "Google Cloud",
        credentialType: "Skill Badge • Introductory",
        date: "October 2026",
        imagePath: "assets/Using the Google Cloud Speech API.png",
        verifyUrl: "https://www.skills.google/public_profiles/dbe64b24-4217-4c26-92b9-76caee8ff23a/badges/29210895"
    },
    {
        id: "gcp-arcade-adventure-oct-2026",
        title: "Arcade Adventure — October 2026",
        issuer: "Google Cloud / Google Skills",
        category: "google-cloud",
        categoryLabel: "Google Cloud",
        credentialType: "Arcade Game Badge",
        date: "October 2026",
        imagePath: "assets/Arcade Adventure Google Cloud ML APIs.png",
        verifyUrl: "https://www.skills.google/public_profiles/dbe64b24-4217-4c26-92b9-76caee8ff23a/badges/29082166"
    },
    {
        id: "gcp-arcade-trail-oct-2026",
        title: "Arcade Trail — October 2026",
        issuer: "Google Cloud / Google Skills",
        category: "google-cloud",
        categoryLabel: "Google Cloud",
        credentialType: "Arcade Game Badge",
        date: "October 2026",
        imagePath: "assets/Arcade Trail Containers & Load Balancing.png",
        verifyUrl: "https://www.skills.google/public_profiles/dbe64b24-4217-4c26-92b9-76caee8ff23a/badges/29122353"
    },
    {
        id: "gcp-arcade-voyage-oct-2026",
        title: "Arcade Voyage — October 2026",
        issuer: "Google Cloud / Google Skills",
        category: "google-cloud",
        categoryLabel: "Google Cloud",
        credentialType: "Arcade Game Badge",
        date: "October 2026",
        imagePath: "assets/Arcade Voyage Language, Voice, and Multimodal Processing.png",
        verifyUrl: "https://www.skills.google/public_profiles/dbe64b24-4217-4c26-92b9-76caee8ff23a/badges/29210877"
    },
    {
        id: "gcp-arcade-base-camp-oct-2026",
        title: "Arcade Base Camp — October 2026",
        issuer: "Google Cloud / Google Skills",
        category: "google-cloud",
        categoryLabel: "Google Cloud",
        credentialType: "Arcade Game Badge",
        date: "October 2026",
        imagePath: "assets/Arcade Base Camp October 2026.png",
        verifyUrl: "https://www.skills.google/public_profiles/dbe64b24-4217-4c26-92b9-76caee8ff23a"
    }
];

const CERTIFICATION_CATEGORIES = [
    { key: "all", label: "All" },
    { key: "degree", label: "Degree" },
    { key: "web-dev", label: "Web Development" },
    { key: "cybersecurity", label: "Cybersecurity" },
    { key: "anthropic", label: "Anthropic" },
    { key: "google-cloud", label: "Google Cloud" }
];

class CertificationsCarousel {
    constructor() {
        this.carouselWrapper = document.getElementById("certCarousel");
        this.viewport = document.getElementById("certViewport");
        this.track = document.getElementById("certificationsTrack");
        this.prevBtn = document.getElementById("certPrevBtn");
        this.nextBtn = document.getElementById("certNextBtn");
        this.paginationContainer = document.getElementById("certPagination");
        this.filtersContainer = document.getElementById("certificationsFilters");

        // Lightbox modal elements
        this.modalBackdrop = document.getElementById("certModalBackdrop");
        this.modalTitle = document.getElementById("certModalTitle");
        this.modalImage = document.getElementById("certModalImage");
        this.modalCategory = document.getElementById("certModalCategory");
        this.modalIssuer = document.getElementById("certModalIssuer");
        this.modalDate = document.getElementById("certModalDate");
        this.modalVerifyLink = document.getElementById("certModalVerifyLink");
        this.modalCloseBtn = document.getElementById("certModalCloseBtn");

        this.currentFilter = "all";
        this.currentItems = [...CERTIFICATIONS_DATA];
        this.currentIndex = 0;

        // Gestures tracking (touch & mouse)
        this.isInteracting = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.dragDistance = 0;
        this.isDragging = false;

        this.init();
    }

    init() {
        if (!this.carouselWrapper || !this.track) return;

        this.renderFilters();
        this.renderCards(this.currentItems);
        this.bindEvents();
        this.bindModalEvents();

        // Ensure section visibility immediately
        const section = document.getElementById("certifications");
        if (section) {
            section.classList.add("visible");
        }
    }

    getCategoryCounts() {
        const counts = { all: CERTIFICATIONS_DATA.length };
        CERTIFICATION_CATEGORIES.forEach(cat => {
            if (cat.key !== "all") counts[cat.key] = 0;
        });

        CERTIFICATIONS_DATA.forEach(item => {
            if (counts[item.category] !== undefined) {
                counts[item.category]++;
            } else {
                counts[item.category] = 1;
            }
        });
        return counts;
    }

    renderFilters() {
        if (!this.filtersContainer) return;
        const counts = this.getCategoryCounts();

        // Check if pre-rendered filter buttons exist in HTML
        const existingButtons = this.filtersContainer.querySelectorAll(".cert-filter-btn");
        if (existingButtons.length === CERTIFICATION_CATEGORIES.length) {
            existingButtons.forEach(btn => {
                const filterKey = btn.getAttribute("data-filter");
                const countBadge = btn.querySelector(".cert-filter-count");
                if (countBadge && counts[filterKey] !== undefined) {
                    countBadge.textContent = counts[filterKey];
                }
                btn.classList.toggle("active", filterKey === this.currentFilter);
                btn.onclick = () => {
                    if (this.currentFilter === filterKey) return;
                    this.setCategory(filterKey);
                };
            });
            return;
        }

        // Fallback: render dynamically if not pre-rendered
        this.filtersContainer.innerHTML = "";

        CERTIFICATION_CATEGORIES.forEach(cat => {
            const count = counts[cat.key] || 0;
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = `cert-filter-btn ${cat.key === this.currentFilter ? "active" : ""}`;
            btn.setAttribute("data-filter", cat.key);
            btn.setAttribute("aria-label", `Filter by ${cat.label} (${count} credentials)`);
            btn.innerHTML = `
                <span>${cat.label.toUpperCase()}</span>
                <span class="cert-filter-count">${count}</span>
            `;

            btn.addEventListener("click", () => {
                if (this.currentFilter === cat.key) return;
                this.setCategory(cat.key);
            });

            this.filtersContainer.appendChild(btn);
        });
    }

    setCategory(categoryKey) {
        this.currentFilter = categoryKey;

        // Update active filter button styling
        if (this.filtersContainer) {
            this.filtersContainer.querySelectorAll(".cert-filter-btn").forEach(b => {
                b.classList.toggle("active", b.getAttribute("data-filter") === categoryKey);
            });
        }

        // Filter items
        this.currentItems = categoryKey === "all"
            ? [...CERTIFICATIONS_DATA]
            : CERTIFICATIONS_DATA.filter(item => item.category === categoryKey);

        // Reset to first slide after changing category
        this.currentIndex = 0;

        // Fade transition on track
        this.track.style.opacity = "0.2";
        this.track.style.transform = "translateY(6px)";

        setTimeout(() => {
            this.renderCards(this.currentItems);
            this.track.style.opacity = "1";
            this.track.style.transform = "translateY(0)";
            this.updateCarouselState();
        }, 180);
    }

    renderCards(items) {
        this.track.innerHTML = "";

        if (items.length === 0) {
            this.track.innerHTML = `
                <div style="flex: 0 0 100%; text-align: center; padding: 50px 20px; color: rgba(224, 224, 245, 0.6); font-family: var(--font-body);">
                    No credentials found in this category.
                </div>
            `;
            this.renderPagination();
            return;
        }

        items.forEach((item, index) => {
            const card = document.createElement("article");
            card.className = "cert-card" + (item.isEmblem ? " cert-card-academic" : "");
            card.setAttribute("data-id", item.id);
            card.setAttribute("data-category", item.category);

            const numberLabel = item.number || String(index + 1).padStart(2, "0");

            let badgeClass = "cert-badge-web-dev";
            if (item.category === "degree") badgeClass = "cert-badge-degree";
            else if (item.category === "cybersecurity") badgeClass = "cert-badge-cybersecurity";
            else if (item.category === "anthropic") badgeClass = "cert-badge-anthropic";
            else if (item.category === "google-cloud") badgeClass = "cert-badge-google-cloud";

            let verifyBtnHtml = "";
            if (item.verifyUrl) {
                verifyBtnHtml = `
                    <a href="${item.verifyUrl}" target="_blank" rel="noopener noreferrer" class="cert-btn cert-btn-verify" aria-label="Verify credential for ${item.title}">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            <polyline points="9 12 11 14 15 10"></polyline>
                        </svg>
                        <span>Verify</span>
                    </a>
                `;
            }

            card.innerHTML = `
                <div class="cert-card-media" role="button" tabindex="0" aria-label="Preview ${item.title}">
                    <span class="cert-card-number">${numberLabel}</span>
                    <img src="${item.imagePath}" alt="${item.title} — ${item.issuer}" loading="lazy" draggable="false" class="${item.isEmblem ? 'cert-emblem-img' : ''}">
                    <div class="cert-media-overlay">
                        <span class="cert-zoom-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                <line x1="11" y1="8" x2="11" y2="14"></line>
                                <line x1="8" y1="11" x2="14" y2="11"></line>
                            </svg>
                            View
                        </span>
                    </div>
                </div>
                <div class="cert-card-body">
                    <div class="cert-card-meta">
                        <span class="cert-category-badge ${badgeClass}">${item.categoryLabel}</span>
                        <span class="cert-type-pill">${item.credentialType}</span>
                    </div>
                    <h3 class="cert-card-title" title="${item.title}">${item.title}</h3>
                    <div class="cert-card-issuer">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                        <span>${item.issuer}</span>
                    </div>
                    ${item.college ? `
                    <div class="cert-card-college">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                        </svg>
                        <span>${item.college}</span>
                    </div>` : ""}
                    ${item.achievement ? `
                    <div class="cert-card-achievement" title="${item.achievement}">
                        <span>${item.achievement}</span>
                    </div>` : ""}
                    ${item.date ? `<div class="cert-card-date">${item.date}</div>` : ""}
                    <div class="cert-card-actions">
                        <button type="button" class="cert-btn cert-btn-preview cert-action-view" aria-label="View full certificate for ${item.title}">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <span>View</span>
                        </button>
                        ${verifyBtnHtml}
                    </div>
                </div>
            `;

            // Card click & keyboard preview
            const media = card.querySelector(".cert-card-media");
            const viewBtn = card.querySelector(".cert-action-view");

            const handleOpenModal = (e) => {
                if (this.dragDistance > 10) return; // Prevent opening when dragging
                this.openModal(item);
            };

            if (media) media.addEventListener("click", handleOpenModal);
            if (viewBtn) viewBtn.addEventListener("click", handleOpenModal);

            this.track.appendChild(card);
        });

        this.renderPagination();
        this.updateCarouselState();
    }

    getVisibleCardsCount() {
        const width = window.innerWidth;
        if (width > 1024) return 3;
        if (width > 768) return 2;
        return 1;
    }

    getMaxIndex() {
        const total = this.currentItems.length;
        const visible = this.getVisibleCardsCount();
        return Math.max(0, total - visible);
    }

    renderPagination() {
        if (!this.paginationContainer) return;
        this.paginationContainer.innerHTML = "";

        const totalDots = this.getMaxIndex() + 1;
        if (totalDots <= 1) return; // No pagination needed if all fit on screen

        for (let i = 0; i < totalDots; i++) {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = `cert-pagination-dot ${i === this.currentIndex ? "active" : ""}`;
            dot.setAttribute("role", "tab");
            dot.setAttribute("aria-label", `Slide ${i + 1} of ${totalDots}`);
            dot.setAttribute("aria-selected", i === this.currentIndex ? "true" : "false");

            dot.addEventListener("click", () => {
                this.goToSlide(i);
            });

            this.paginationContainer.appendChild(dot);
        }
    }

    updateCarouselState() {
        const maxIdx = this.getMaxIndex();
        if (this.currentIndex > maxIdx) {
            this.currentIndex = maxIdx;
        }

        const cards = this.track.querySelectorAll(".cert-card");
        if (cards.length > 0) {
            const cardWidth = cards[0].getBoundingClientRect().width;
            const gap = 20; // 20px gap defined in CSS
            const offset = this.currentIndex * (cardWidth + gap);
            this.track.style.transform = `translateX(-${offset}px)`;
        } else {
            this.track.style.transform = "translateX(0px)";
        }

        // Arrow button states (Both stay active & glowing, enabling infinite cycling)
        if (this.prevBtn) {
            this.prevBtn.disabled = false;
            this.prevBtn.setAttribute("aria-disabled", "false");
        }
        if (this.nextBtn) {
            this.nextBtn.disabled = false;
            this.nextBtn.setAttribute("aria-disabled", "false");
        }

        // Update pagination dots
        if (this.paginationContainer) {
            const dots = this.paginationContainer.querySelectorAll(".cert-pagination-dot");
            dots.forEach((dot, idx) => {
                const isActive = idx === this.currentIndex;
                dot.classList.toggle("active", isActive);
                dot.setAttribute("aria-selected", isActive ? "true" : "false");
            });
        }
    }

    prevSlide() {
        const maxIdx = this.getMaxIndex();
        if (this.currentIndex > 0) {
            this.currentIndex--;
        } else {
            this.currentIndex = maxIdx;
        }
        this.updateCarouselState();
    }

    nextSlide() {
        const maxIdx = this.getMaxIndex();
        if (this.currentIndex < maxIdx) {
            this.currentIndex++;
        } else {
            this.currentIndex = 0;
        }
        this.updateCarouselState();
    }

    goToSlide(index) {
        const maxIdx = this.getMaxIndex();
        this.currentIndex = Math.max(0, Math.min(index, maxIdx));
        this.updateCarouselState();
    }

    bindEvents() {
        // Arrow buttons
        if (this.prevBtn) {
            this.prevBtn.addEventListener("click", () => this.prevSlide());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener("click", () => this.nextSlide());
        }

        // Keyboard navigation
        if (this.carouselWrapper) {
            this.carouselWrapper.addEventListener("keydown", (e) => {
                if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    this.prevSlide();
                } else if (e.key === "ArrowRight") {
                    e.preventDefault();
                    this.nextSlide();
                }
            });
        }

        // Window resize debounced
        let resizeTimer = null;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.renderPagination();
                this.updateCarouselState();
            }, 100);
        });

        // Touch swipe gestures
        if (this.viewport) {
            this.viewport.addEventListener("touchstart", (e) => {
                this.isInteracting = true;
                this.startX = e.touches[0].clientX;
                this.startY = e.touches[0].clientY;
                this.currentX = this.startX;
                this.currentY = this.startY;
                this.dragDistance = 0;
            }, { passive: true });

            this.viewport.addEventListener("touchmove", (e) => {
                if (!this.isInteracting) return;
                this.currentX = e.touches[0].clientX;
                this.currentY = e.touches[0].clientY;
                this.dragDistance = Math.abs(this.currentX - this.startX);
            }, { passive: true });

            this.viewport.addEventListener("touchend", () => {
                if (!this.isInteracting) return;
                this.isInteracting = false;
                const deltaX = this.currentX - this.startX;
                const deltaY = Math.abs(this.currentY - this.startY);

                if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > deltaY) {
                    if (deltaX < 0) this.nextSlide();
                    else this.prevSlide();
                }
            });

            // Desktop Mouse Dragging
            this.viewport.addEventListener("mousedown", (e) => {
                if (e.target.closest("button") || e.target.closest("a")) return;
                this.isDragging = true;
                this.startX = e.clientX;
                this.currentX = this.startX;
                this.dragDistance = 0;
                this.viewport.classList.add("is-dragging");
            });

            window.addEventListener("mousemove", (e) => {
                if (!this.isDragging) return;
                this.currentX = e.clientX;
                this.dragDistance = Math.abs(this.currentX - this.startX);
            });

            window.addEventListener("mouseup", (e) => {
                if (!this.isDragging) return;
                this.isDragging = false;
                this.viewport.classList.remove("is-dragging");

                const deltaX = this.currentX - this.startX;
                if (Math.abs(deltaX) > 45) {
                    if (deltaX < 0) this.nextSlide();
                    else this.prevSlide();
                }
            });
        }
    }

    bindModalEvents() {
        if (this.modalCloseBtn) {
            this.modalCloseBtn.addEventListener("click", () => this.closeModal());
        }

        if (this.modalBackdrop) {
            this.modalBackdrop.addEventListener("click", (e) => {
                if (e.target === this.modalBackdrop) {
                    this.closeModal();
                }
            });
        }

        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.modalBackdrop && this.modalBackdrop.classList.contains("active")) {
                this.closeModal();
            }
        });
    }

    openModal(item) {
        if (!this.modalBackdrop) return;

        this.modalTitle.textContent = item.title;
        this.modalImage.src = item.imagePath;
        this.modalImage.alt = `${item.title} — ${item.issuer}`;
        this.modalCategory.textContent = item.categoryLabel;
        this.modalCategory.className = `cert-category-badge cert-badge-${item.category}`;
        this.modalIssuer.textContent = item.college ? `${item.issuer} • ${item.college}` : item.issuer;
        this.modalDate.textContent = item.date || item.credentialType;

        if (item.verifyUrl) {
            this.modalVerifyLink.href = item.verifyUrl;
            this.modalVerifyLink.style.display = "inline-flex";
        } else {
            this.modalVerifyLink.href = "#";
            this.modalVerifyLink.style.display = "none";
        }

        this.modalBackdrop.classList.add("active");
        this.modalBackdrop.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        if (this.modalCloseBtn) this.modalCloseBtn.focus();
    }

    closeModal() {
        if (!this.modalBackdrop) return;
        this.modalBackdrop.classList.remove("active");
        this.modalBackdrop.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }
}

// Global instance exposure
window.AshadCertifications = {
    data: CERTIFICATIONS_DATA,
    categories: CERTIFICATION_CATEGORIES,
    instance: null
};

// Initialize when ready
function initCertifications() {
    window.AshadCertifications.instance = new CertificationsCarousel();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCertifications);
} else {
    initCertifications();
}
