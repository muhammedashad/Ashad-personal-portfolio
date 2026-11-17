/**
 * ASHAD — 3D CREATIVE UNIVERSE
 * Three.js 3D Globe Controller & Interactive Preview Manager
 * 
 * - Full Globe Visibility (Top & Bottom completely in-frame)
 * - 100% Real Image Textures (using Base64 data URIs for zero-CORS reliability across file:// and http://)
 * - Neutral Naming: CREATIVE 001, COLLECTION 01, DOCUMENT 01
 * - Native Mouse Cursor visible everywhere
 * - Desktop right-side preview panel; mobile properly sized full-screen preview
 * - Background starry & glowing cyan animation with prefers-reduced-motion support
 * - Preview panel appears only on cell selection; closes on outside click, X, or Escape
 * - Never auto-opens a project on load or reset
 */

class UniverseSpaceBackground {
    constructor(canvasId = 'universeSpaceCanvas') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animId = null;
        this.isPaused = false;
        this.isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.resize();
        this.createParticles();
        this.bindEvents();
        this.start();
    }

    resize() {
        if (!this.canvas) return;
        const parent = this.canvas.parentElement || document.getElementById('portfolio') || document.body;
        const rect = parent.getBoundingClientRect();
        this.width = rect.width || window.innerWidth;
        this.height = rect.height || 820;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
    }

    createParticles() {
        this.particles = [];
        // 1. Subtle Moving Stars (White / Light Cyan)
        const starCount = Math.min(75, Math.floor((this.width * this.height) / 12000));
        for (let i = 0; i < starCount; i++) {
            this.particles.push({
                type: 'star',
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                r: Math.random() * 1.0 + 0.6,
                alpha: Math.random() * 0.6 + 0.25,
                baseAlpha: Math.random() * 0.5 + 0.25,
                twinkleOffset: Math.random() * Math.PI * 2,
                vx: (Math.random() - 0.5) * 0.15,
                vy: -(Math.random() * 0.2 + 0.05),
                color: Math.random() > 0.35 ? '#ffffff' : '#bbf2f6'
            });
        }

        // 2. Glowing Cyan Micro-particles
        const cyanCount = Math.min(25, Math.floor((this.width * this.height) / 36000));
        for (let i = 0; i < cyanCount; i++) {
            this.particles.push({
                type: 'glow',
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                r: Math.random() * 1.6 + 1.2,
                alpha: Math.random() * 0.55 + 0.2,
                vx: (Math.random() - 0.5) * 0.25,
                vy: -(Math.random() * 0.35 + 0.1),
                glowColor: 'rgba(0, 240, 255, '
            });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            if (this.isReducedMotion) this.drawStatic();
        });

        if (window.matchMedia) {
            const media = window.matchMedia('(prefers-reduced-motion: reduce)');
            media.addEventListener('change', (e) => {
                this.isReducedMotion = e.matches;
                if (this.isReducedMotion) {
                    this.stop();
                    this.drawStatic();
                } else {
                    this.start();
                }
            });
        }

        const portfolio = document.getElementById('portfolio');
        if (portfolio && 'IntersectionObserver' in window) {
            const obs = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    this.isPaused = !entry.isIntersecting;
                });
            }, { threshold: 0.05 });
            obs.observe(portfolio);
        }

        document.addEventListener('visibilitychange', () => {
            this.isPaused = document.hidden;
        });
    }

    drawStatic() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        for (const p of this.particles) {
            if (p.type === 'star') {
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = p.baseAlpha;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.8);
                grad.addColorStop(0, p.glowColor + (p.alpha) + ')');
                grad.addColorStop(1, p.glowColor + '0)');
                this.ctx.fillStyle = grad;
                this.ctx.globalAlpha = 1;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.r * 2.8, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        this.ctx.globalAlpha = 1;
    }

    start() {
        if (this.isReducedMotion) {
            this.drawStatic();
            return;
        }

        let lastTime = performance.now();
        let phase = 0;

        const loop = (now) => {
            this.animId = requestAnimationFrame(loop);
            if (this.isPaused) return;

            const dt = Math.min((now - lastTime) / 1000, 0.1);
            lastTime = now;
            phase += dt * 0.8;

            this.ctx.clearRect(0, 0, this.width, this.height);

            // Subtle Ambient Cyan Pulsing Glow
            const cx1 = this.width * 0.5 + Math.sin(phase * 0.5) * 80;
            const cy1 = this.height * 0.45 + Math.cos(phase * 0.5) * 40;
            const rad1 = this.ctx.createRadialGradient(cx1, cy1, 10, cx1, cy1, Math.min(this.width, this.height) * 0.6);
            rad1.addColorStop(0, 'rgba(0, 240, 255, 0.045)');
            rad1.addColorStop(0.5, 'rgba(0, 140, 255, 0.02)');
            rad1.addColorStop(1, 'rgba(0, 240, 255, 0)');
            this.ctx.fillStyle = rad1;
            this.ctx.fillRect(0, 0, this.width, this.height);

            // Draw Stars & Glowing Cyan Particles
            for (const p of this.particles) {
                p.x += p.vx * dt * 60;
                p.y += p.vy * dt * 60;

                if (p.x < 0) p.x = this.width;
                if (p.x > this.width) p.x = 0;
                if (p.y < 0) p.y = this.height;
                if (p.y > this.height) p.y = 0;

                if (p.type === 'star') {
                    const twinkle = Math.sin(phase * 2 + p.twinkleOffset);
                    const currentAlpha = Math.max(0.1, p.baseAlpha + twinkle * 0.25);

                    this.ctx.fillStyle = p.color;
                    this.ctx.globalAlpha = currentAlpha;
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    this.ctx.fill();
                } else {
                    const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.8);
                    grad.addColorStop(0, p.glowColor + (p.alpha) + ')');
                    grad.addColorStop(0.5, p.glowColor + (p.alpha * 0.35) + ')');
                    grad.addColorStop(1, p.glowColor + '0)');

                    this.ctx.fillStyle = grad;
                    this.ctx.globalAlpha = 1;
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, p.r * 2.8, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
            this.ctx.globalAlpha = 1;
        };

        this.animId = requestAnimationFrame(loop);
    }

    stop() {
        if (this.animId) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
        }
    }
}

class CreativeUniverseGlobe {
    constructor(containerId = 'universeCanvasContainer', options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('CreativeUniverseGlobe: container not found:', containerId);
            return;
        }

        this.data = options.data || window.ASHAD_WORKS_DATA || { projects: [] };
        this.viewer = options.viewer || null;

        // Globe configuration
        this.radius = 175;
        this.cameraDistance = 520;
        this.autoRotateSpeed = 0.0016;
        this.currentSpeed = this.autoRotateSpeed;
        this.isAutoRotating = true;
        this.isUserInteracting = false;
        this.isPointerDown = false;
        this.isDragging = false;

        // Three.js Core
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.globeGroup = null;
        this.interactiveMeshes = [];
        this.meshByProject = new Map();
        this.hoveredMesh = null;
        this.selectedProject = null;
        this.selectedMesh = null;

        // Raycasting & Pointer
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2(-999, -999);
        this.pointerDownPos = { x: 0, y: 0 };
        this.dragVelocity = { x: 0, y: 0 };
        this.previousPointerPos = { x: 0, y: 0 };

        // Slerp Rotation Transition
        this.isFocusing = false;
        this.targetQuaternion = null;
        this.focusProgress = 0;

        // Texture Loader & Cache
        this.textureLoader = new THREE.TextureLoader();
        this.textureCache = new Map();

        // UI Elements
        this.tooltipEl = document.getElementById('universeTooltip');
        this.tooltipTitleEl = document.getElementById('universeTooltipTitle');
        this.tooltipMetaEl = document.getElementById('universeTooltipMeta');

        // Right Preview Panel Elements
        this.previewBackdrop = document.getElementById('universePreviewBackdrop');
        this.previewCard = document.getElementById('universePreviewCard');
        this.previewProjectId = document.getElementById('previewProjectId');
        this.previewMediaImg = document.getElementById('previewMediaImg');
        this.previewMediaBadge = document.getElementById('previewMediaBadge');
        this.previewTitle = document.getElementById('previewTitle');
        this.previewMetaLine = document.getElementById('previewMetaLine');
        this.previewCardDotsRow = document.getElementById('previewCardDotsRow');
        this.previewCardDots = document.getElementById('previewCardDots');
        this.previewNavPrev = document.getElementById('previewNavPrev');
        this.previewNavNext = document.getElementById('previewNavNext');
        this.previewCloseBtn = document.getElementById('previewCloseBtn');
        this.previewExpandBtn = document.getElementById('previewExpandBtn');
        this.previewOpenActionBtn = document.getElementById('previewOpenActionBtn');

        this.previewSlides = [];
        this.previewCurrentSlideIndex = 0;

        this.init();
    }

    init() {
        if (!window.THREE) {
            console.error('Three.js is not loaded.');
            return;
        }

        // Initialize Background Stars & Particles
        this.spaceBackground = new UniverseSpaceBackground('universeSpaceCanvas');

        this.setupScene();
        this.setupLights();
        this.createAtmosphereEffects();
        this.createWireframeSphere();
        this.populateCreativeCells();
        this.bindEvents();
        this.bindHUDControls();
        this.bindRightPreviewControls();

        // Render loop
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);

        console.log('3D Creative Universe initialized with', this.interactiveMeshes.length, 'creative cells.');
    }

    setupScene() {
        const width = this.container.clientWidth || 900;
        const height = this.container.clientHeight || 540;

        this.scene = new THREE.Scene();

        // Dynamic camera distance based on screen width
        this.cameraDistance = width < 480 ? 620 : (width < 768 ? 560 : 520);
        this.camera = new THREE.PerspectiveCamera(42, width / height, 1, 3000);
        this.camera.position.set(0, 0, this.cameraDistance);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);

        this.globeGroup = new THREE.Group();
        this.globeGroup.rotation.x = 0.08;
        this.scene.add(this.globeGroup);
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.95);
        this.scene.add(ambientLight);

        const cyanLight = new THREE.PointLight(0x00f0ff, 2.0, 1800);
        cyanLight.position.set(250, 350, 450);
        this.scene.add(cyanLight);

        const purpleLight = new THREE.PointLight(0xa855f7, 1.4, 1800);
        purpleLight.position.set(-280, -250, -350);
        this.scene.add(purpleLight);

        const frontLight = new THREE.DirectionalLight(0xffffff, 0.65);
        frontLight.position.set(0, 50, 600);
        this.scene.add(frontLight);
    }

    createAtmosphereEffects() {
        // Digital Wireframe Wave Grid Floor
        const planeGeo = new THREE.PlaneGeometry(1000, 450, 32, 16);
        const planeMat = new THREE.MeshBasicMaterial({
            color: 0x004466,
            wireframe: true,
            transparent: true,
            opacity: 0.16
        });
        const wavePlane = new THREE.Mesh(planeGeo, planeMat);
        wavePlane.rotation.x = -Math.PI / 2.3;
        wavePlane.position.set(0, -210, -50);
        this.scene.add(wavePlane);

        // Orbital Rings with Cyan Glow
        const ringGeo = new THREE.RingGeometry(this.radius * 1.34, this.radius * 1.348, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.35
        });
        const ring1 = new THREE.Mesh(ringGeo, ringMat);
        ring1.rotation.x = Math.PI / 2.7;
        ring1.rotation.y = 0.2;
        this.scene.add(ring1);

        const ring2 = ring1.clone();
        ring2.rotation.x = -Math.PI / 3.1;
        ring2.rotation.y = -0.3;
        ring2.material = ringMat.clone();
        ring2.material.opacity = 0.22;
        this.scene.add(ring2);
    }

    createWireframeSphere() {
        const sphereGeo = new THREE.SphereGeometry(this.radius - 2, 36, 24);
        const sphereMat = new THREE.MeshBasicMaterial({
            color: 0x003355,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        this.globeGroup.add(sphere);

        // Core glow
        const coreGeo = new THREE.SphereGeometry(this.radius * 0.94, 24, 24);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0x020818,
            transparent: true,
            opacity: 0.92
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        this.globeGroup.add(core);
    }

    populateCreativeCells() {
        const projects = this.data.projects || [];
        if (projects.length === 0) return;

        // 9 Latitude Rings distribution
        const ringsConfig = [
            { phiDeg: 24, count: 12, cellW: 24, cellH: 30 },
            { phiDeg: 38, count: 18, cellW: 25, cellH: 32 },
            { phiDeg: 54, count: 26, cellW: 26, cellH: 33 },
            { phiDeg: 72, count: 32, cellW: 27, cellH: 34 },
            { phiDeg: 90, count: 40, cellW: 28, cellH: 35 },
            { phiDeg: 108, count: 34, cellW: 27, cellH: 34 },
            { phiDeg: 126, count: 28, cellW: 26, cellH: 33 },
            { phiDeg: 142, count: 20, cellW: 25, cellH: 32 },
            { phiDeg: 156, count: 12, cellW: 24, cellH: 30 }
        ];

        let projectIdx = 0;
        const totalProjects = projects.length;

        ringsConfig.forEach((ring) => {
            const phi = THREE.MathUtils.degToRad(ring.phiDeg);
            const count = ring.count;
            const deltaTheta = (Math.PI * 2) / count;

            for (let i = 0; i < count; i++) {
                if (projectIdx >= totalProjects) break;

                const project = projects[projectIdx];
                const theta = i * deltaTheta + (ring.phiDeg % 2 === 0 ? deltaTheta / 2 : 0);

                const x = this.radius * Math.sin(phi) * Math.cos(theta);
                const y = this.radius * Math.cos(phi);
                const z = this.radius * Math.sin(phi) * Math.sin(theta);

                this.createProjectCellMesh(project, x, y, z, ring.cellW, ring.cellH);
                projectIdx++;
            }
        });
    }

    createProjectCellMesh(project, x, y, z, cellW, cellH) {
        const aspect = (project.width && project.height) ? (project.width / project.height) : 0.75;
        let w = cellW;
        let h = cellH;
        if (aspect > 1.0) {
            w = cellH * aspect * 0.7;
            h = cellH * 0.7;
        }

        const geometry = new THREE.PlaneGeometry(w, h);
        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.35,
            metalness: 0.15,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);

        const normal = new THREE.Vector3(x, y, z).normalize();
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

        mesh.userData = {
            project: project,
            originalPosition: mesh.position.clone(),
            originalScale: mesh.scale.clone(),
            normal: normal,
            isCreativeCell: true
        };

        // Neon border line
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMat = new THREE.LineBasicMaterial({
            color: project.type === 'collection' ? 0xa855f7 : (project.type === 'document' ? 0xf59e0b : 0x00d4ff),
            linewidth: 1,
            transparent: true,
            opacity: 0.45
        });
        const borderLine = new THREE.LineSegments(edges, lineMat);
        mesh.add(borderLine);
        mesh.userData.borderLine = borderLine;

        this.globeGroup.add(mesh);
        this.interactiveMeshes.push(mesh);
        this.meshByProject.set(project.id, mesh);

        // Load real thumbnail texture (Base64 data URI first for zero-CORS reliability)
        this.loadProjectTexture(mesh, project);
    }

    loadProjectTexture(mesh, project) {
        const textureSource = project.thumbDataUri || project.fullPath || project.thumbPath;
        if (!textureSource) return;

        if (this.textureCache.has(textureSource)) {
            mesh.material.map = this.textureCache.get(textureSource);
            mesh.material.needsUpdate = true;
            return;
        }

        this.textureLoader.load(
            textureSource,
            (texture) => {
                texture.generateMipmaps = true;
                texture.minFilter = THREE.LinearMipmapLinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.encoding = THREE.sRGBEncoding;

                this.textureCache.set(textureSource, texture);
                mesh.material.map = texture;
                mesh.material.needsUpdate = true;
            },
            undefined,
            (err) => {
                console.error(`CreativeUniverseGlobe: Texture failed for ${project.filename || project.id}:`, err);
            }
        );
    }

    bindEvents() {
        const dom = this.renderer.domElement;

        dom.addEventListener('pointerdown', (e) => {
            this.isPointerDown = true;
            this.isDragging = false;
            this.pointerDownPos = { x: e.clientX, y: e.clientY };
            this.previousPointerPos = { x: e.clientX, y: e.clientY };
            this.dragVelocity = { x: 0, y: 0 };
        });

        window.addEventListener('pointermove', (e) => {
            if (this.isPointerDown) {
                const dx = e.clientX - this.previousPointerPos.x;
                const dy = e.clientY - this.previousPointerPos.y;
                const totalDist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);

                if (totalDist > 5) {
                    this.isDragging = true;
                    this.isUserInteracting = true;

                    this.globeGroup.rotation.y += dx * 0.005;
                    this.globeGroup.rotation.x += dy * 0.005;
                    this.globeGroup.rotation.x = Math.max(-0.65, Math.min(0.65, this.globeGroup.rotation.x));

                    this.dragVelocity = { x: dx * 0.005, y: dy * 0.005 };
                }

                this.previousPointerPos = { x: e.clientX, y: e.clientY };
            }

            // Raycasting for hover tooltip
            const rect = dom.getBoundingClientRect();
            if (
                e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top && e.clientY <= rect.bottom
            ) {
                this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
                this.handleRaycastHover(e.clientX, e.clientY);
            } else {
                this.hideTooltip();
                this.resetHoveredMesh();
            }
        });

        window.addEventListener('pointerup', () => {
            if (!this.isPointerDown) return;
            this.isPointerDown = false;

            if (!this.isDragging) {
                this.handleCellClick();
            }

            setTimeout(() => {
                this.isUserInteracting = false;
            }, 800);
        });

        // Keyboard navigation & Escape to close preview
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closePreview();
            } else if (e.key === 'ArrowLeft' && this.selectedProject) {
                this.navigatePreview(-1);
            } else if (e.key === 'ArrowRight' && this.selectedProject) {
                this.navigatePreview(1);
            }
        });

        window.addEventListener('resize', () => this.handleResize());
    }

    handleRaycastHover(screenX, screenY) {
        if (this.isDragging) {
            this.hideTooltip();
            this.resetHoveredMesh();
            return;
        }

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.interactiveMeshes, false);

        if (intersects.length > 0) {
            const hit = intersects[0].object;
            this.container.classList.add('is-hovering-cell');

            if (this.hoveredMesh !== hit) {
                this.resetHoveredMesh();
                this.hoveredMesh = hit;

                if (hit !== this.selectedMesh) {
                    hit.position.copy(hit.userData.originalPosition).addScaledVector(hit.userData.normal, 5);
                    hit.scale.set(1.08, 1.08, 1.08);
                    if (hit.userData.borderLine) {
                        hit.userData.borderLine.material.color.setHex(0x00ffff);
                        hit.userData.borderLine.material.opacity = 0.95;
                    }
                }
            }

            const project = hit.userData.project;
            this.showTooltip(project, screenX, screenY);
        } else {
            this.container.classList.remove('is-hovering-cell');
            this.resetHoveredMesh();
            this.hideTooltip();
        }
    }

    showTooltip(project, x, y) {
        if (!this.tooltipEl || !project) return;
        const rect = this.container.getBoundingClientRect();
        const relX = x - rect.left;
        const relY = y - rect.top;

        if (this.tooltipTitleEl) {
            this.tooltipTitleEl.textContent = project.label;
        }
        if (this.tooltipMetaEl) {
            let meta = project.type.toUpperCase();
            if (project.type === 'collection') meta += ` • ${project.slideCount || 2} SLIDES`;
            else if (project.type === 'document') meta += ` • ${project.pageCount || project.slideCount || 6} PAGES`;
            this.tooltipMetaEl.textContent = meta;
        }

        this.tooltipEl.style.left = `${relX}px`;
        this.tooltipEl.style.top = `${relY}px`;
        this.tooltipEl.classList.add('is-visible');
    }

    resetHoveredMesh() {
        if (this.hoveredMesh && this.hoveredMesh !== this.selectedMesh) {
            this.hoveredMesh.position.copy(this.hoveredMesh.userData.originalPosition);
            this.hoveredMesh.scale.copy(this.hoveredMesh.userData.originalScale);
            if (this.hoveredMesh.userData.borderLine) {
                this.hoveredMesh.userData.borderLine.material.color.setHex(0x00d4ff);
                this.hoveredMesh.userData.borderLine.material.opacity = 0.45;
            }
        }
        this.hoveredMesh = null;
    }

    hideTooltip() {
        if (this.tooltipEl) {
            this.tooltipEl.classList.remove('is-visible');
        }
    }

    handleCellClick() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.interactiveMeshes, false);

        if (intersects.length > 0) {
            const hit = intersects[0].object;
            const project = hit.userData.project;
            if (project) {
                this.selectProject(project, true);
            }
        } else {
            // Clicked empty area on canvas: close preview if open
            if (this.selectedProject) {
                this.closePreview();
            }
        }
    }

    selectProject(project, rotateGlobe = true) {
        if (!project) return;
        this.selectedProject = project;

        // Reset previous selected mesh
        if (this.selectedMesh) {
            this.selectedMesh.position.copy(this.selectedMesh.userData.originalPosition);
            this.selectedMesh.scale.set(1.0, 1.0, 1.0);
            if (this.selectedMesh.userData.borderLine) {
                this.selectedMesh.userData.borderLine.material.color.setHex(0x00d4ff);
                this.selectedMesh.userData.borderLine.material.opacity = 0.45;
            }
        }

        // Highlight new selected mesh
        const mesh = this.meshByProject.get(project.id);
        if (mesh) {
            this.selectedMesh = mesh;
            const normal = mesh.userData.normal;
            mesh.position.copy(mesh.userData.originalPosition).addScaledVector(normal, 10);
            mesh.scale.set(1.15, 1.15, 1.15);
            if (mesh.userData.borderLine) {
                mesh.userData.borderLine.material.color.setHex(0x00ffff);
                mesh.userData.borderLine.material.opacity = 1.0;
            }

            if (rotateGlobe) {
                this.rotateGlobeToFaceVector(mesh.position.clone());
            }
        }

        // Open preview: On mobile open properly sized full-screen preview directly
        const isMobile = window.innerWidth <= 768;
        if (isMobile && this.viewer) {
            this.viewer.open(project);
        } else {
            this.openPreview(project);
        }
    }

    rotateGlobeToFaceVector(cellPos) {
        const v = cellPos.clone().normalize();
        const targetRotY = -Math.atan2(v.x, v.z);
        const targetRotX = Math.asin(v.y);

        const targetEuler = new THREE.Euler(targetRotX, targetRotY, 0, 'YXZ');
        this.targetQuaternion = new THREE.Quaternion().setFromEuler(targetEuler);
        this.isFocusing = true;
        this.focusProgress = 0;
        this.isAutoRotating = false;
    }

    openPreview(project) {
        if (!project) return;

        if (this.previewBackdrop) {
            this.previewBackdrop.classList.add('is-open');
        }

        if (this.previewProjectId) {
            this.previewProjectId.textContent = project.label;
        }

        if (this.previewMediaBadge) {
            this.previewMediaBadge.textContent = project.type.toUpperCase();
            this.previewMediaBadge.className = 'preview-media-badge' + 
                (project.type === 'collection' ? ' badge-collection' : (project.type === 'document' ? ' badge-document' : ''));
        }

        if (this.previewTitle) {
            this.previewTitle.textContent = project.label;
        }

        if (this.previewMetaLine) {
            let meta = `File: ${project.filename}`;
            if (project.type === 'collection') {
                meta += ` • ${project.slideCount || (project.slides ? project.slides.length : 1)} Slides`;
            } else if (project.type === 'document') {
                meta += ` • ${project.pageCount || project.slideCount || project.totalPages || (project.pages ? project.pages.length : 1)} Pages`;
            } else if (project.width && project.height) {
                meta += ` • ${project.width} × ${project.height}`;
            }
            this.previewMetaLine.textContent = meta;
        }

        // Dynamic slide/page pagination dots for Carousel and Document previews
        const isMulti = (project.type === 'collection' || project.type === 'document');
        const slides = isMulti ? (project.slides || (project.pages ? project.pages.map(p => p.path) : [project.fullPath || project.thumbPath])) : [];

        this.previewSlides = slides;
        this.previewCurrentSlideIndex = 0;

        if (isMulti && slides.length > 1) {
            if (this.previewCardDotsRow) {
                this.previewCardDotsRow.style.display = 'flex';
            }
            this.renderPreviewDots();
            this.setPreviewSlide(0);
        } else {
            if (this.previewCardDotsRow) {
                this.previewCardDotsRow.style.display = 'none';
            }
            if (this.previewCardDots) {
                this.previewCardDots.innerHTML = '';
            }
            if (this.previewMediaImg) {
                this.previewMediaImg.src = project.thumbDataUri || project.fullPath || project.thumbPath;
                this.previewMediaImg.alt = project.label;
            }
        }
    }

    renderPreviewDots() {
        if (!this.previewCardDots || !this.previewSlides || this.previewSlides.length === 0) return;
        const isDoc = this.selectedProject && this.selectedProject.type === 'document';
        const itemType = isDoc ? 'Page' : 'Slide';

        this.previewCardDots.innerHTML = this.previewSlides.map((_, i) => `
            <button type="button" 
                    class="preview-card-dot ${i === this.previewCurrentSlideIndex ? 'active' : ''}" 
                    data-index="${i}" 
                    aria-label="${itemType} ${i + 1}" 
                    title="${itemType} ${i + 1}">
            </button>
        `).join('');

        this.previewCardDots.querySelectorAll('.preview-card-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(dot.getAttribute('data-index'), 10);
                if (!isNaN(idx)) {
                    this.setPreviewSlide(idx);
                }
            });
        });
    }

    setPreviewSlide(idx) {
        if (!this.previewSlides || this.previewSlides.length === 0) return;
        const total = this.previewSlides.length;
        const nextIdx = (idx + total) % total;
        this.previewCurrentSlideIndex = nextIdx;

        const slideSrc = this.previewSlides[nextIdx];
        if (this.previewMediaImg && slideSrc) {
            this.previewMediaImg.src = slideSrc;
        }

        if (this.previewCardDots) {
            const dots = this.previewCardDots.querySelectorAll('.preview-card-dot');
            dots.forEach((dot, i) => {
                if (i === nextIdx) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
    }

    navigatePreview(dir) {
        if (!this.selectedProject) return;
        const isMulti = (this.selectedProject.type === 'collection' || this.selectedProject.type === 'document');
        if (isMulti && this.previewSlides && this.previewSlides.length > 1) {
            this.setPreviewSlide(this.previewCurrentSlideIndex + dir);
        } else {
            this.navigateProject(dir);
        }
    }

    closePreview() {
        if (this.previewBackdrop) {
            this.previewBackdrop.classList.remove('is-open');
        }

        if (this.previewCardDotsRow) {
            this.previewCardDotsRow.style.display = 'none';
        }
        if (this.previewCardDots) {
            this.previewCardDots.innerHTML = '';
        }
        this.previewSlides = [];
        this.previewCurrentSlideIndex = 0;

        if (this.selectedMesh) {
            this.selectedMesh.position.copy(this.selectedMesh.userData.originalPosition);
            this.selectedMesh.scale.set(1.0, 1.0, 1.0);
            if (this.selectedMesh.userData.borderLine) {
                this.selectedMesh.userData.borderLine.material.color.setHex(0x00d4ff);
                this.selectedMesh.userData.borderLine.material.opacity = 0.45;
            }
            this.selectedMesh = null;
        }
        this.selectedProject = null;
        this.isAutoRotating = true;
    }

    resetView() {
        // 1. Close preview without reopening any project
        this.closePreview();

        // 2. Clear hover
        this.resetHoveredMesh();

        // 3. Smoothly animate orientation back to neutral center
        this.isFocusing = true;
        this.targetQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.08, 0, 0));
        this.focusProgress = 0;

        // 4. Reset camera distance and physics
        this.camera.position.set(0, 0, this.cameraDistance);
        this.dragVelocity = { x: 0, y: 0 };
        this.isUserInteracting = false;
        this.isAutoRotating = true;

        const pauseBtn = document.getElementById('universePauseBtn');
        if (pauseBtn) pauseBtn.classList.remove('active');
    }

    bindRightPreviewControls() {
        if (this.previewNavPrev) {
            this.previewNavPrev.addEventListener('click', (e) => {
                e.stopPropagation();
                this.navigatePreview(-1);
            });
        }

        if (this.previewNavNext) {
            this.previewNavNext.addEventListener('click', (e) => {
                e.stopPropagation();
                this.navigatePreview(1);
            });
        }

        if (this.previewCloseBtn) {
            this.previewCloseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closePreview();
            });
        }

        // Clicking outside the preview card closes the preview
        if (this.previewBackdrop) {
            this.previewBackdrop.addEventListener('click', (e) => {
                if (e.target === this.previewBackdrop) {
                    this.closePreview();
                }
            });
        }

        // Prevent clicks inside preview card from closing it
        if (this.previewCard) {
            this.previewCard.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        const handleOpenFull = (e) => {
            if (e) e.stopPropagation();
            if (this.selectedProject && this.viewer) {
                this.viewer.open(this.selectedProject, this.previewCurrentSlideIndex);
            }
        };

        if (this.previewExpandBtn) {
            this.previewExpandBtn.addEventListener('click', handleOpenFull);
        }

        if (this.previewOpenActionBtn) {
            this.previewOpenActionBtn.addEventListener('click', handleOpenFull);
        }

        const mediaWrap = document.getElementById('previewMediaWrap');
        if (mediaWrap) {
            let pointerStartX = 0;
            let pointerStartY = 0;
            let isSwiping = false;

            mediaWrap.addEventListener('pointerdown', (e) => {
                pointerStartX = e.clientX;
                pointerStartY = e.clientY;
                isSwiping = false;
            });

            mediaWrap.addEventListener('pointermove', (e) => {
                if (pointerStartX !== 0) {
                    const dx = e.clientX - pointerStartX;
                    const dy = e.clientY - pointerStartY;
                    if (Math.hypot(dx, dy) > 8) {
                        isSwiping = true;
                    }
                }
            });

            const handlePointerUp = (e) => {
                if (pointerStartX === 0) return;
                const dx = e.clientX - pointerStartX;
                const dy = e.clientY - pointerStartY;
                pointerStartX = 0;
                pointerStartY = 0;

                if (isSwiping && Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
                    e.stopPropagation();
                    e.preventDefault();
                    if (dx < 0) {
                        this.navigatePreview(1);
                    } else {
                        this.navigatePreview(-1);
                    }
                    setTimeout(() => { isSwiping = false; }, 50);
                    return;
                }
                isSwiping = false;
            };

            mediaWrap.addEventListener('pointerup', handlePointerUp);
            mediaWrap.addEventListener('pointercancel', () => {
                pointerStartX = 0;
                isSwiping = false;
            });

            mediaWrap.addEventListener('click', (e) => {
                if (isSwiping) {
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }
                handleOpenFull(e);
            });
        }
    }

    navigateProject(dir) {
        if (!this.selectedProject) return;
        const projects = this.data.projects;
        const currentIdx = projects.findIndex(p => p.id === this.selectedProject.id);
        if (currentIdx === -1) return;

        let nextIdx = currentIdx + dir;
        if (nextIdx < 0) nextIdx = projects.length - 1;
        if (nextIdx >= projects.length) nextIdx = 0;

        const nextProject = projects[nextIdx];
        this.selectProject(nextProject, true);
    }

    bindHUDControls() {
        const pauseBtn = document.getElementById('universePauseBtn');
        const resetBtn = document.getElementById('universeResetBtn');
        const fullBtn = document.getElementById('universeFullBtn');

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.isAutoRotating = !this.isAutoRotating;
                pauseBtn.classList.toggle('active', !this.isAutoRotating);
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetView();
            });
        }

        if (fullBtn) {
            fullBtn.addEventListener('click', () => {
                const section = document.getElementById('portfolio');
                if (!document.fullscreenElement) {
                    if (section.requestFullscreen) section.requestFullscreen();
                } else {
                    if (document.exitFullscreen) document.exitFullscreen();
                }
            });
        }
    }

    handleResize() {
        if (!this.container || !this.camera || !this.renderer) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.cameraDistance = width < 480 ? 620 : (width < 768 ? 560 : 520);
        this.camera.position.z = this.cameraDistance;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(this.animate);

        // 1. Slerp Transition to Selected Project / Neutral Reset
        if (this.isFocusing && this.targetQuaternion) {
            this.focusProgress += 0.045;
            this.globeGroup.quaternion.slerp(this.targetQuaternion, 0.08);

            if (this.focusProgress >= 1.0 || this.globeGroup.quaternion.angleTo(this.targetQuaternion) < 0.005) {
                this.globeGroup.quaternion.copy(this.targetQuaternion);
                this.globeGroup.rotation.setFromQuaternion(this.globeGroup.quaternion);
                this.isFocusing = false;
                this.targetQuaternion = null;
            }
        }
        // 2. Drag Inertia Decay (Smooth damping)
        else if (this.isDragging || Math.abs(this.dragVelocity.x) > 0.00005 || Math.abs(this.dragVelocity.y) > 0.00005) {
            if (!this.isPointerDown) {
                this.globeGroup.rotation.y += this.dragVelocity.x;
                this.globeGroup.rotation.x += this.dragVelocity.y;
                this.globeGroup.rotation.x = Math.max(-0.65, Math.min(0.65, this.globeGroup.rotation.x));
                this.dragVelocity.x *= 0.94;
                this.dragVelocity.y *= 0.94;
            }
        }
        // 3. Continuous 360 Auto-rotation (Pauses when inspecting selected project)
        else if (this.isAutoRotating && !this.isUserInteracting && !this.selectedProject) {
            this.globeGroup.rotation.y += this.currentSpeed;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Global exposure
window.CreativeUniverseGlobe = CreativeUniverseGlobe;
window.UniverseSpaceBackground = UniverseSpaceBackground;
