/**
 * Raftaar Rental Fleet - Interactive Core Engine
 * Featuring: Three.js 3D Speed Space, Interactive Vehicle Showcase, 
 * Fleet Filtering, INR Rental Calculator & Booking Handler.
 */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* ====================================================
       1. SMOOTH SCROLLING
       ==================================================== */
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");
            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);
            if (target) {
                event.preventDefault();
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });

    /* ====================================================
       2. ACTIVE NAVIGATION HIGHLIGHT
       ==================================================== */
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".main-nav a").forEach((link) => {
        const linkPage = link.getAttribute("href")?.split("#")[0];
        if (linkPage && (linkPage === currentPage || (currentPage === "" && linkPage === "index.html"))) {
            link.classList.add("active");
        }
    });

    /* ====================================================
       3. AUTOMATIC COPYRIGHT YEAR
       ==================================================== */
    document.querySelectorAll(".site-footer small").forEach((footer) => {
        footer.textContent = footer.textContent.replace(
            /©\s*\d{4}/,
            `© ${new Date().getFullYear()}`
        );
    });

    /* ====================================================
       4. THREE.JS 3D SPEED PARTICLES & HIGHWAY (HERO)
       ==================================================== */
    initThreeJsHeroBackground();

    function initThreeJsHeroBackground() {
        const canvas = document.getElementById("hero-canvas");
        if (!canvas) return;

        // Check if Three.js is loaded
        if (typeof THREE === "undefined") {
            console.log("Three.js not yet loaded or CDN blocked, running fallback CSS visuals.");
            return;
        }

        try {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 280;

            const renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                alpha: true,
                antialias: true
            });
            renderer.setSize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            // Create 3D Speed Lines / Particles
            const particleCount = 1400;
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);
            const scales = new Float32Array(particleCount);

            // Light Blue / Cyan Palette: #38bdf8 & #0ea5e9 & #7dd3fc
            const colorA = new THREE.Color(0x38bdf8);
            const colorB = new THREE.Color(0x0284c7);
            const colorC = new THREE.Color(0xbae6fd);

            for (let i = 0; i < particleCount; i++) {
                // Highway tunnel / road distribution
                positions[i * 3] = (Math.random() - 0.5) * 850;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 450;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 600;

                // Color gradient
                const mixedColor = Math.random() > 0.5 ? colorA.clone().lerp(colorC, Math.random()) : colorB.clone().lerp(colorA, Math.random());
                colors[i * 3] = mixedColor.r;
                colors[i * 3 + 1] = mixedColor.g;
                colors[i * 3 + 2] = mixedColor.b;

                scales[i] = Math.random() * 2.5 + 1;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            // Particle Material
            const material = new THREE.PointsMaterial({
                size: 3.5,
                vertexColors: true,
                transparent: true,
                opacity: 0.75,
                blending: THREE.AdditiveBlending
            });

            const particles = new THREE.Points(geometry, material);
            scene.add(particles);

            // Add geometric 3D speed grid / rings
            const ringGeo = new THREE.TorusGeometry(120, 0.8, 16, 100);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0x38bdf8,
                wireframe: true,
                transparent: true,
                opacity: 0.15
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2.3;
            scene.add(ring);

            // Mouse Interaction
            let mouseX = 0;
            let mouseY = 0;
            let targetMouseX = 0;
            let targetMouseY = 0;

            window.addEventListener('mousemove', (e) => {
                targetMouseX = (e.clientX - window.innerWidth / 2) * 0.15;
                targetMouseY = (e.clientY - window.innerHeight / 2) * 0.15;
            }, { passive: true });

            // Handle Resize
            function onWindowResize() {
                if (!canvas.parentElement) return;
                const width = canvas.parentElement.clientWidth;
                const height = canvas.parentElement.clientHeight;
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }
            window.addEventListener('resize', onWindowResize);

            // Animation Loop
            let frameId;
            const animate = () => {
                frameId = requestAnimationFrame(animate);

                mouseX += (targetMouseX - mouseX) * 0.05;
                mouseY += (targetMouseY - mouseY) * 0.05;

                camera.position.x = mouseX * 0.5;
                camera.position.y = -mouseY * 0.5;
                camera.lookAt(scene.position);

                const positions = particles.geometry.attributes.position.array;
                for (let i = 0; i < particleCount; i++) {
                    // Fly towards camera
                    positions[i * 3 + 2] += 2.2;
                    if (positions[i * 3 + 2] > 280) {
                        positions[i * 3 + 2] = -320;
                        positions[i * 3] = (Math.random() - 0.5) * 850;
                        positions[i * 3 + 1] = (Math.random() - 0.5) * 450;
                    }
                }
                particles.geometry.attributes.position.needsUpdate = true;

                ring.rotation.z += 0.003;
                ring.rotation.y += 0.002;

                renderer.render(scene, camera);
            };

            animate();

        } catch (err) {
            console.warn("Three.js initialization notice:", err);
        }
    }

    /* ====================================================
       5. HERO VEHICLE SHOWCASE & 3D TILT EFFECT
       ==================================================== */
    const heroTabs = document.querySelectorAll(".hero-tab");
    const stageVehicles = document.querySelectorAll(".stage-vehicle");
    const heroStage = document.querySelector(".hero-stage");

    let currentVehicleIndex = 0;
    let autoRotateTimer = null;

    function switchHeroVehicle(targetIndex) {
        if (!stageVehicles.length || targetIndex >= stageVehicles.length) return;

        heroTabs.forEach((tab, idx) => {
            tab.classList.toggle("active", idx === targetIndex);
        });

        stageVehicles.forEach((veh, idx) => {
            veh.classList.toggle("active", idx === targetIndex);
        });

        currentVehicleIndex = targetIndex;
    }

    if (heroTabs.length > 0 && stageVehicles.length > 0) {
        heroTabs.forEach((tab, idx) => {
            tab.addEventListener("click", () => {
                switchHeroVehicle(idx);
                resetAutoRotate();
            });
        });

        // 3D Parallax Tilt Effect on Mouse Move
        if (heroStage) {
            heroStage.addEventListener("mousemove", (e) => {
                const rect = heroStage.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 12;

                const activeVeh = heroStage.querySelector(".stage-vehicle.active img");
                if (activeVeh) {
                    activeVeh.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
                }
            });

            heroStage.addEventListener("mouseleave", () => {
                const activeVeh = heroStage.querySelector(".stage-vehicle.active img");
                if (activeVeh) {
                    activeVeh.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                }
            });
        }

        // Auto rotation
        function startAutoRotate() {
            autoRotateTimer = setInterval(() => {
                const nextIndex = (currentVehicleIndex + 1) % stageVehicles.length;
                switchHeroVehicle(nextIndex);
            }, 6000);
        }

        function resetAutoRotate() {
            if (autoRotateTimer) clearInterval(autoRotateTimer);
            startAutoRotate();
        }

        startAutoRotate();
    }

    /* ====================================================
       6. FLEET CATEGORY FILTER TABS
       ==================================================== */
    const filterPills = document.querySelectorAll(".filter-pill");
    const vehicleCards = document.querySelectorAll(".vehicle-card[data-category]");

    if (filterPills.length > 0 && vehicleCards.length > 0) {
        filterPills.forEach((pill) => {
            pill.addEventListener("click", () => {
                filterPills.forEach(p => p.classList.remove("active"));
                pill.classList.add("active");

                const targetCategory = pill.getAttribute("data-filter");

                vehicleCards.forEach((card) => {
                    const cardCat = card.getAttribute("data-category");
                    if (targetCategory === "all" || cardCat === targetCategory) {
                        card.style.display = "flex";
                        setTimeout(() => {
                            card.style.opacity = "1";
                            card.style.transform = "translateY(0)";
                        }, 50);
                    } else {
                        card.style.opacity = "0";
                        card.style.transform = "translateY(15px)";
                        setTimeout(() => {
                            card.style.display = "none";
                        }, 250);
                    }
                });
            });
        });
    }

    /* ====================================================
       7. RENTAL SEARCH BAR FILTER / REDIRECT
       ==================================================== */
    const searchForm = document.getElementById("fleet-search-form");
    if (searchForm) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const typeSelect = searchForm.querySelector("#search-type");
            const selectedType = typeSelect ? typeSelect.value : "all";

            // If we're on index or explore, trigger filter
            const targetPill = document.querySelector(`.filter-pill[data-filter="${selectedType}"]`);
            if (targetPill) {
                targetPill.click();
                const fleetSec = document.getElementById("vehicles");
                if (fleetSec) {
                    fleetSec.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            } else {
                window.location.href = `explore.html#vehicles`;
            }
        });
    }

    /* ====================================================
       8. VEHICLE DETAILS INTERACTIVE INR CALCULATOR
       ==================================================== */
    const detailCalcForm = document.getElementById("rental-calc-form");
    if (detailCalcForm) {
        const dailyRateValue = parseFloat(detailCalcForm.getAttribute("data-daily-rate"));
        const dailyRate = Number.isFinite(dailyRateValue) ? Math.max(0, dailyRateValue) : 2499;
        const daysInput = detailCalcForm.querySelector("#rental-days");
        const insuranceCheck = detailCalcForm.querySelector("#addon-insurance");
        const deliveryCheck = detailCalcForm.querySelector("#addon-delivery");

        const subtotalEl = document.getElementById("calc-subtotal");
        const gstEl = document.getElementById("calc-gst");
        const totalEl = document.getElementById("calc-total");

        function updateDetailPricing() {
            const requestedDays = parseInt(daysInput ? daysInput.value : 1, 10);
            const days = Math.min(30, Math.max(1, Number.isFinite(requestedDays) ? requestedDays : 1));
            if (daysInput && daysInput.value !== String(days)) {
                daysInput.value = String(days);
            }
            let subtotal = days * dailyRate;

            if (insuranceCheck && insuranceCheck.checked) {
                subtotal += (days * 199);
            }
            if (deliveryCheck && deliveryCheck.checked) {
                subtotal += 399;
            }

            const gst = Math.round(subtotal * 0.18);
            const grandTotal = subtotal + gst;

            if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
            if (gstEl) gstEl.textContent = `₹${gst.toLocaleString('en-IN')}`;
            if (totalEl) totalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
        }

        daysInput?.addEventListener("input", updateDetailPricing);
        daysInput?.addEventListener("change", updateDetailPricing);
        insuranceCheck?.addEventListener("change", updateDetailPricing);
        deliveryCheck?.addEventListener("change", updateDetailPricing);

        // Plan selection
        const planCards = document.querySelectorAll(".rate-plan-option");
        planCards.forEach(card => {
            card.addEventListener("click", () => {
                planCards.forEach(c => c.classList.remove("selected"));
                card.classList.add("selected");
                const days = card.getAttribute("data-plan-days");
                if (days && daysInput) {
                    daysInput.value = days;
                    updateDetailPricing();
                }
            });
        });

        // Initialize calculation
        updateDetailPricing();
    }

    /* ====================================================
       9. FORM VALIDATION (AUTH & LEASING)
       ==================================================== */
    function showMessage(form, message, type = "info") {
        let status = form.querySelector(".js-form-message");
        if (!status) {
            status = document.createElement("p");
            status.className = "js-form-message";
            status.setAttribute("role", "status");
            status.setAttribute("aria-live", "polite");
            status.style.marginTop = "14px";
            status.style.fontSize = "13px";
            status.style.lineHeight = "1.6";
            status.style.fontWeight = "600";
            status.style.padding = "10px 14px";
            status.style.borderRadius = "8px";
            form.appendChild(status);
        }

        status.textContent = message;
        if (type === "error") {
            status.style.color = "#dc2626";
            status.style.background = "#fef2f2";
            status.style.border = "1px solid #fecaca";
        } else {
            status.style.color = "#0284c7";
            status.style.background = "rgba(56, 189, 248, 0.12)";
            status.style.border = "1px solid rgba(56, 189, 248, 0.35)";
        }
    }

    // Register Form
    const registerForm = document.querySelector("form:has(#fullname)");
    if (registerForm) {
        const password = registerForm.querySelector("#password");
        const confirmPassword = registerForm.querySelector("#confirm-password");
        const phone = registerForm.querySelector("#phone");

        function checkPasswords() {
            if (!password || !confirmPassword) return true;
            if (confirmPassword.value && password.value !== confirmPassword.value) {
                confirmPassword.setCustomValidity("Passwords do not match.");
                return false;
            }
            confirmPassword.setCustomValidity("");
            return true;
        }

        password?.addEventListener("input", checkPasswords);
        confirmPassword?.addEventListener("input", checkPasswords);

        phone?.addEventListener("input", () => {
            phone.value = phone.value.replace(/\D/g, "").slice(0, 10);
        });

        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            if (!checkPasswords()) {
                confirmPassword.reportValidity();
                return;
            }
            if (!registerForm.checkValidity()) {
                registerForm.reportValidity();
                return;
            }
            showMessage(
                registerForm,
                "✓ Account registered successfully in demo mode! You can now log in.",
                "success"
            );
        });
    }

    // Login Form
    const loginForm = document.querySelector("form:has(#email):has(#password):not(:has(#fullname)):not(:has(#lease-name))");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            if (!loginForm.checkValidity()) {
                loginForm.reportValidity();
                return;
            }
            showMessage(
                loginForm,
                "✓ Login authenticated successfully! Redirecting to fleet...",
                "success"
            );
            setTimeout(() => {
                window.location.href = "explore.html";
            }, 1200);
        });
    }

});
