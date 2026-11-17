/**
 * ASHAD — 3D CREATIVE UNIVERSE
 * Project Viewer Controller
 * 
 * - Individual Image Viewer (Fit to Screen default, Zoom, Fit Screen, Fullscreen)
 * - Multi-Image Collection Viewer (Slide-by-slide, Real Pointer Events Touch & Mouse Drag Swipe, Clickable Dots, Position Counter)
 * - Image-based Document Viewer (Page-by-page, Real Pointer Events Touch & Mouse Drag Swipe, Clickable Dots, Page Counter)
 * - Neutral Naming: CREATIVE 001, COLLECTION 01, DOCUMENT 01
 * - Preserves original image aspect ratio (object-fit: contain)
 * - Native Mouse Cursor visible everywhere, grab/grabbing inside slider
 * - Zero interference with the 3D globe in the background
 */

class ProjectViewer {
    constructor(options = {}) {
        this.manifest = options.manifest || window.ASHAD_WORKS_DATA || { projects: [] };
        this.onCloseCallback = options.onClose || null;

        this.currentProject = null;
        this.currentSlideIndex = 0;
        this.currentSlides = [];
        this.zoomScale = 1.0;
        this.isFitScreen = true;

        // Pointer / Drag State for Swipe
        this.isPointerDown = false;
        this.isDragging = false;
        this.pointerStartX = 0;
        this.pointerStartY = 0;
        this.dragDeltaX = 0;
        this.activePointerId = null;

        // Pre-filter by type
        this.images = this.manifest.projects.filter(p => p.type === 'image');
        this.collections = this.manifest.projects.filter(p => p.type === 'collection');
        this.documents = this.manifest.projects.filter(p => p.type === 'document');

        this.createModalDOM();
        this.bindEvents();
    }

    createModalDOM() {
        if (document.getElementById('universeModalBackdrop')) return;

        const modal = document.createElement('div');
        modal.id = 'universeModalBackdrop';
        modal.className = 'universe-modal-backdrop';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-hidden', 'true');

        modal.innerHTML = `
            <div class="universe-modal-header">
                <div class="universe-modal-header-left">
                    <span class="universe-modal-badge" id="universeModalBadge">IMAGE</span>
                    <h3 class="universe-modal-title" id="universeModalTitle">CREATIVE 001</h3>
                </div>
                <div class="universe-modal-header-actions">
                    <button type="button" class="universe-control-btn" id="modalZoomOutBtn" title="Zoom Out" aria-label="Zoom Out">&minus;</button>
                    <button type="button" class="universe-control-btn" id="modalZoomResetBtn" title="Reset Zoom" aria-label="Reset Zoom">100%</button>
                    <button type="button" class="universe-control-btn" id="modalZoomInBtn" title="Zoom In" aria-label="Zoom In">+</button>
                    <button type="button" class="universe-control-btn active" id="modalFitScreenBtn" title="Fit to Screen" aria-label="Fit to Screen">Fit Screen</button>
                    <button type="button" class="universe-control-btn" id="modalFullscreenBtn" title="Toggle Fullscreen" aria-label="Toggle Fullscreen">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                        </svg>
                    </button>
                    <button type="button" class="universe-modal-close-btn" id="universeModalCloseBtn" title="Close (Escape)" aria-label="Close Viewer">&times;</button>
                </div>
            </div>

            <div class="universe-modal-body" id="universeModalBody">
                <button type="button" class="universe-modal-arrow arrow-prev" id="universeModalPrev" aria-label="Previous Slide / Image" title="Previous (Left Arrow)">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <button type="button" class="universe-modal-arrow arrow-next" id="universeModalNext" aria-label="Next Slide / Image" title="Next (Right Arrow)">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>

                <div class="universe-slider-viewport" id="universeSliderViewport">
                    <div class="universe-slider-track" id="universeSliderTrack"></div>
                </div>
            </div>

            <div class="universe-modal-footer" id="universeModalFooter">
                <div class="universe-modal-info" id="universeModalInfo">CREATIVE</div>
                <div class="universe-modal-pagination" id="universeModalPagination"></div>
            </div>
        `;

        document.body.appendChild(modal);

        this.backdrop = modal;
        this.titleEl = document.getElementById('universeModalTitle');
        this.badgeEl = document.getElementById('universeModalBadge');
        this.viewportEl = document.getElementById('universeSliderViewport');
        this.trackEl = document.getElementById('universeSliderTrack');
        this.infoEl = document.getElementById('universeModalInfo');
        this.paginationEl = document.getElementById('universeModalPagination');
        this.prevBtn = document.getElementById('universeModalPrev');
        this.nextBtn = document.getElementById('universeModalNext');
        this.closeBtn = document.getElementById('universeModalCloseBtn');
        this.fitScreenBtn = document.getElementById('modalFitScreenBtn');
    }

    bindEvents() {
        if (!this.backdrop) return;

        // Close on close button
        this.closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.close();
        });

        // Close on backdrop click (outside image)
        this.backdrop.addEventListener('click', (e) => {
            if (e.target === this.backdrop || e.target.id === 'universeModalBody' || e.target.classList.contains('universe-slide-item')) {
                this.close();
            }
        });

        // Prevent click bubbling from content
        this.viewportEl.addEventListener('click', (e) => {
            if (this.isDragging) {
                e.stopPropagation();
                e.preventDefault();
            }
        });

        // Navigation Arrows
        this.prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.navigatePrev();
        });
        this.nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.navigateNext();
        });

        // Keyboard Controls
        window.addEventListener('keydown', (e) => {
            if (!this.isOpen()) return;
            if (e.key === 'Escape') {
                e.preventDefault();
                this.close();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.navigatePrev();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.navigateNext();
            }
        });

        // Zoom & Fullscreen Controls
        document.getElementById('modalZoomInBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.setZoom(this.zoomScale + 0.25);
        });
        document.getElementById('modalZoomOutBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.setZoom(Math.max(0.4, this.zoomScale - 0.25));
        });
        document.getElementById('modalZoomResetBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.setZoom(1.0);
        });
        if (this.fitScreenBtn) {
            this.fitScreenBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFitScreen();
            });
        }
        document.getElementById('modalFullscreenBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFullscreen();
        });

        // REAL WORKING POINTER EVENTS SWIPE (Touch & Desktop Mouse Drag)
        this.bindSliderPointerEvents();
    }

    bindSliderPointerEvents() {
        const vp = this.viewportEl;
        if (!vp) return;

        vp.addEventListener('pointerdown', (e) => {
            if (e.button !== 0 && e.pointerType === 'mouse') return;
            if (this.zoomScale > 1.05 || !this.isFitScreen) return;
            if (this.currentSlides.length <= 1) return;

            this.isPointerDown = true;
            this.isDragging = false;
            this.pointerStartX = e.clientX;
            this.pointerStartY = e.clientY;
            this.dragDeltaX = 0;
            this.activePointerId = e.pointerId;

            this.trackEl.style.transition = 'none';
        });

        vp.addEventListener('pointermove', (e) => {
            if (!this.isPointerDown || e.pointerId !== this.activePointerId) return;

            const dx = e.clientX - this.pointerStartX;
            const dy = e.clientY - this.pointerStartY;

            if (!this.isDragging) {
                if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
                    if (Math.abs(dx) >= Math.abs(dy)) {
                        this.isDragging = true;
                        vp.classList.add('is-dragging');
                        try {
                            vp.setPointerCapture(e.pointerId);
                        } catch (_) {}
                    } else {
                        this.isPointerDown = false;
                        return;
                    }
                }
            }

            if (this.isDragging) {
                e.preventDefault();
                e.stopPropagation();
                this.dragDeltaX = dx;

                const isAtStart = this.currentSlideIndex === 0 && dx > 0;
                const isAtEnd = this.currentSlideIndex === this.currentSlides.length - 1 && dx < 0;
                const effectiveDx = (isAtStart || isAtEnd) ? dx * 0.35 : dx;

                const basePct = -this.currentSlideIndex * 100;
                this.trackEl.style.transform = `translateX(calc(${basePct}% + ${effectiveDx}px))`;
            }
        });

        const handlePointerEnd = (e) => {
            if (!this.isPointerDown || e.pointerId !== this.activePointerId) return;
            this.isPointerDown = false;

            if (this.isDragging) {
                e.preventDefault();
                e.stopPropagation();
                vp.classList.remove('is-dragging');
                try {
                    vp.releasePointerCapture(e.pointerId);
                } catch (_) {}

                const threshold = Math.min(window.innerWidth * 0.12, 50);
                const total = this.currentSlides.length;

                this.trackEl.style.transition = 'transform 0.32s cubic-bezier(0.2, 0.9, 0.3, 1)';

                if (this.dragDeltaX < -threshold && this.currentSlideIndex < total - 1) {
                    this.goToSlide(this.currentSlideIndex + 1);
                } else if (this.dragDeltaX > threshold && this.currentSlideIndex > 0) {
                    this.goToSlide(this.currentSlideIndex - 1);
                } else {
                    this.goToSlide(this.currentSlideIndex);
                }

                setTimeout(() => {
                    this.isDragging = false;
                }, 80);
            }
        };

        vp.addEventListener('pointerup', handlePointerEnd);
        vp.addEventListener('pointercancel', handlePointerEnd);
    }

    isOpen() {
        return this.backdrop && this.backdrop.classList.contains('is-open');
    }

    open(project, initialSlideIndex = 0) {
        if (!project) return;
        this.currentProject = project;
        this.zoomScale = 1.0;
        this.isFitScreen = true;
        this.currentSlideIndex = initialSlideIndex || 0;

        this.backdrop.classList.add('is-open');
        this.backdrop.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        if (this.fitScreenBtn) {
            this.fitScreenBtn.classList.add('active');
            this.fitScreenBtn.textContent = 'Fit Screen';
        }

        if (project.type === 'collection') {
            this.openCollection(project, initialSlideIndex);
        } else if (project.type === 'document') {
            this.openDocument(project, initialSlideIndex);
        } else {
            this.openImage(project);
        }
    }

    close() {
        if (!this.isOpen()) return;
        const lastIndex = this.currentSlideIndex;
        this.backdrop.classList.remove('is-open');
        this.backdrop.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        this.trackEl.innerHTML = '';
        this.currentProject = null;
        this.currentSlides = [];

        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }

        if (typeof this.onCloseCallback === 'function') {
            this.onCloseCallback(lastIndex);
        }
    }

    /* -------------------------------------------------------------
       1. INDIVIDUAL IMAGE VIEWER
       ------------------------------------------------------------- */
    openImage(project) {
        this.badgeEl.textContent = 'IMAGE';
        this.badgeEl.className = 'universe-modal-badge';
        this.titleEl.textContent = project.label;

        this.currentSlides = [project.fullPath || project.thumbPath];
        this.currentSlideIndex = 0;

        this.prevBtn.style.display = 'flex';
        this.nextBtn.style.display = 'flex';
        this.prevBtn.title = 'Previous Image (Left Arrow)';
        this.nextBtn.title = 'Next Image (Right Arrow)';

        this.renderSliderTrack();
        this.updateImageFooter();
    }

    updateImageFooter() {
        const p = this.currentProject;
        this.infoEl.textContent = `${p.filename} • ${p.width || 1080} × ${p.height || 1440} px`;
        this.paginationEl.innerHTML = `
            <div style="font-size: 11px; color: var(--uni-cyan); letter-spacing: 1px; font-family: var(--uni-font-heading);">
                USE ARROWS OR KEYS TO BROWSE
            </div>
        `;
    }

    /* -------------------------------------------------------------
       2. MULTI-IMAGE COLLECTION VIEWER (Carousel 1-30)
       ------------------------------------------------------------- */
    openCollection(project, initialSlideIndex = 0) {
        this.badgeEl.textContent = 'COLLECTION';
        this.badgeEl.className = 'universe-modal-badge badge-collection';
        this.titleEl.textContent = project.label;

        this.currentSlides = project.slides || [project.fullPath];
        this.currentSlideIndex = Math.min(Math.max(0, initialSlideIndex || 0), this.currentSlides.length - 1);

        this.prevBtn.style.display = 'flex';
        this.nextBtn.style.display = 'flex';
        this.prevBtn.title = 'Previous Slide (Drag / Swipe Right)';
        this.nextBtn.title = 'Next Slide (Drag / Swipe Left)';

        this.renderSliderTrack(this.currentSlideIndex);
        this.updateCollectionFooter();
    }

    updateCollectionFooter() {
        const total = this.currentSlides.length;
        const curNum = String(this.currentSlideIndex + 1).padStart(2, '0');
        const totNum = String(total).padStart(2, '0');

        this.infoEl.textContent = `${this.currentProject.label} — SLIDE ${curNum} / ${totNum}`;
        this.renderPaginationDots(total, this.currentSlideIndex, 'Slide');
    }

    /* -------------------------------------------------------------
       3. IMAGE-BASED DOCUMENT VIEWER (PDF 1-9 Converted Pages)
       ------------------------------------------------------------- */
    openDocument(project, initialSlideIndex = 0) {
        this.badgeEl.textContent = 'DOCUMENT';
        this.badgeEl.className = 'universe-modal-badge badge-document';
        this.titleEl.textContent = project.label;

        this.currentSlides = project.slides || (project.pages ? project.pages.map(p => p.path) : [project.fullPath]);
        this.currentSlideIndex = Math.min(Math.max(0, initialSlideIndex || 0), this.currentSlides.length - 1);

        this.prevBtn.style.display = 'flex';
        this.nextBtn.style.display = 'flex';
        this.prevBtn.title = 'Previous Page (Drag / Swipe Right)';
        this.nextBtn.title = 'Next Page (Drag / Swipe Left)';

        this.renderSliderTrack(this.currentSlideIndex);
        this.updateDocumentFooter();
    }

    updateDocumentFooter() {
        const total = this.currentSlides.length;
        const curNum = String(this.currentSlideIndex + 1).padStart(2, '0');
        const totNum = String(total).padStart(2, '0');

        this.infoEl.textContent = `${this.currentProject.label} — PAGE ${curNum} / ${totNum}`;
        this.renderPaginationDots(total, this.currentSlideIndex, 'Page');
    }

    /* -------------------------------------------------------------
       PAGINATION DOTS & POSITION INDICATOR (01 / 04)
       ------------------------------------------------------------- */
    renderPaginationDots(total, activeIndex, itemType = 'Slide') {
        const curNum = String(activeIndex + 1).padStart(2, '0');
        const totNum = String(total).padStart(2, '0');

        this.paginationEl.innerHTML = `
            <div class="universe-pagination-wrapper">
                <div class="universe-dot-container" role="tablist" aria-label="${itemType} Navigation">
                    ${this.currentSlides.map((_, i) => `
                        <button type="button" 
                                class="universe-dot ${i === activeIndex ? 'active' : ''}" 
                                data-index="${i}" 
                                role="tab"
                                aria-selected="${i === activeIndex}"
                                aria-label="${itemType} ${i + 1}"
                                title="${itemType} ${i + 1}">
                        </button>
                    `).join('')}
                </div>
                <span class="universe-slide-counter">${curNum} / ${totNum}</span>
            </div>
        `;

        this.paginationEl.querySelectorAll('.universe-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(dot.getAttribute('data-index'), 10);
                if (idx !== this.currentSlideIndex) {
                    this.goToSlide(idx);
                }
            });
        });
    }

    /* -------------------------------------------------------------
       4. SLIDER TRACK RENDERING & SLIDE TRANSITIONS
       ------------------------------------------------------------- */
    renderSliderTrack(initialIndex = 0) {
        this.trackEl.style.transition = 'none';
        this.trackEl.style.transform = `translateX(0%)`;

        this.trackEl.innerHTML = this.currentSlides.map((src, i) => `
            <div class="universe-slide-item" data-slide-index="${i}">
                <div class="universe-slide-inner">
                    <img src="${src}" alt="Slide ${i + 1}" class="universe-viewer-img" draggable="false" loading="${i <= 1 ? 'eager' : 'lazy'}">
                </div>
            </div>
        `).join('');

        this.goToSlide(initialIndex, false);
    }

    goToSlide(index, animate = true) {
        const total = this.currentSlides.length;
        if (total === 0) return;

        this.currentSlideIndex = Math.max(0, Math.min(total - 1, index));

        if (animate) {
            this.trackEl.style.transition = 'transform 0.32s cubic-bezier(0.2, 0.9, 0.3, 1)';
        } else {
            this.trackEl.style.transition = 'none';
        }

        this.trackEl.style.transform = `translateX(-${this.currentSlideIndex * 100}%)`;

        // Update footer info & dots immediately
        if (this.currentProject) {
            if (this.currentProject.type === 'collection') {
                this.updateCollectionFooter();
            } else if (this.currentProject.type === 'document') {
                this.updateDocumentFooter();
            } else {
                this.updateImageFooter();
            }
        }

        this.applyZoom();
    }

    navigatePrev() {
        if (!this.currentProject) return;

        if (this.currentProject.type === 'image') {
            const idx = this.images.findIndex(p => p.id === this.currentProject.id);
            const prevIdx = (idx - 1 + this.images.length) % this.images.length;
            this.openImage(this.images[prevIdx]);
            this.currentProject = this.images[prevIdx];
        } else {
            if (this.currentSlideIndex > 0) {
                this.goToSlide(this.currentSlideIndex - 1);
            } else {
                this.goToSlide(this.currentSlides.length - 1);
            }
        }
    }

    navigateNext() {
        if (!this.currentProject) return;

        if (this.currentProject.type === 'image') {
            const idx = this.images.findIndex(p => p.id === this.currentProject.id);
            const nextIdx = (idx + 1) % this.images.length;
            this.openImage(this.images[nextIdx]);
            this.currentProject = this.images[nextIdx];
        } else {
            if (this.currentSlideIndex < this.currentSlides.length - 1) {
                this.goToSlide(this.currentSlideIndex + 1);
            } else {
                this.goToSlide(0);
            }
        }
    }

    /* -------------------------------------------------------------
       5. ZOOM & FULLSCREEN CONTROLS
       ------------------------------------------------------------- */
    setZoom(scale) {
        this.zoomScale = Math.max(0.4, Math.min(3.0, scale));
        const resetBtn = document.getElementById('modalZoomResetBtn');
        if (resetBtn) {
            resetBtn.textContent = `${Math.round(this.zoomScale * 100)}%`;
        }
        if (this.fitScreenBtn) {
            this.fitScreenBtn.classList.toggle('active', Math.abs(this.zoomScale - 1.0) < 0.05 && this.isFitScreen);
        }
        this.applyZoom();
    }

    toggleFitScreen() {
        this.isFitScreen = !this.isFitScreen;
        if (this.fitScreenBtn) {
            this.fitScreenBtn.classList.toggle('active', this.isFitScreen);
        }
        if (this.isFitScreen) {
            this.setZoom(1.0);
        }
        const activeImg = this.trackEl.querySelector(`.universe-slide-item[data-slide-index="${this.currentSlideIndex}"] .universe-viewer-img`);
        if (activeImg) {
            activeImg.classList.toggle('is-fit-width', !this.isFitScreen);
        }
    }

    applyZoom() {
        const activeImg = this.trackEl.querySelector(`.universe-slide-item[data-slide-index="${this.currentSlideIndex}"] .universe-viewer-img`);
        if (!activeImg) return;

        if (Math.abs(this.zoomScale - 1.0) < 0.01) {
            activeImg.style.transform = '';
            activeImg.style.cursor = 'default';
        } else {
            activeImg.style.transform = `scale(${this.zoomScale})`;
            activeImg.style.cursor = this.zoomScale > 1.0 ? 'zoom-out' : 'zoom-in';
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.backdrop.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    }
}

// Global exposure
window.ProjectViewer = ProjectViewer;
