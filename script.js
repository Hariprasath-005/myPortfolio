/* ==========================================================================
   PREMIUM PORTFOLIO INTERACTION ENGINE
   Author: Antigravity / DeepMind Pair Program
   Features: GSAP ScrollTrigger, Custom Cursor, Magnetic Hover, 3D Tilts, Counters
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // 0. REGISTER GSAP PLUGINS
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);
    }

    // 1. INITIALIZE LUCIDE ICONS
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    // 2. CUSTOM CURSOR & MOUSE GLOW
    const cursor = document.getElementById("custom-cursor");
    const mouseGlow = document.getElementById("mouse-glow");
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let glowX = 0, glowY = 0;

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice) {
        // Show cursor elements
        if (cursor) cursor.style.display = "block";
        if (mouseGlow) mouseGlow.style.opacity = "1";

        window.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Animation Loop with Interpolation (Lerp) for smooth lag effect
        const tickCursor = () => {
            // Lerp custom cursor
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;
            if (cursor) {
                cursor.style.left = `${cursorX}px`;
                cursor.style.top = `${cursorY}px`;
            }

            // Lerp background glow
            glowX += (mouseX - glowX) * 0.08;
            glowY += (mouseY - glowY) * 0.08;
            if (mouseGlow) {
                mouseGlow.style.left = `${glowX}px`;
                mouseGlow.style.top = `${glowY}px`;
            }

            requestAnimationFrame(tickCursor);
        };
        tickCursor();

        // Hover expansions
        const hoverTargets = document.querySelectorAll("a, button, input, textarea, .project-luxury-card, .cert-luxury-card, .stat-card, .highlight-box");
        hoverTargets.forEach(target => {
            target.addEventListener("mouseenter", () => {
                if (cursor) cursor.classList.add("hovered");
            });
            target.addEventListener("mouseleave", () => {
                if (cursor) cursor.classList.remove("hovered");
            });
        });
    }

    // 3. MAGNETIC BUTTONS (Awwwards Micro-interaction)
    const magneticElements = document.querySelectorAll(".magnetic");
    
    magneticElements.forEach(elem => {
        elem.addEventListener("mousemove", (e) => {
            const rect = elem.getBoundingClientRect();
            // Calculate distance from center of element to mouse
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Translate the element slightly toward the mouse coordinates
            gsap.to(elem, {
                x: x * 0.35,
                y: y * 0.35,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        elem.addEventListener("mouseleave", () => {
            // Reset position smoothly
            gsap.to(elem, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });

    // 4. GSAP PAGE ANIMATIONS & SCROLLTRIGGERS
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        
        // Custom Scroll Progress Bar
        gsap.to("#scroll-progress", {
            width: "100%",
            ease: "none",
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                scrub: true
            }
        });

        // Sticky Nav backdrop effect
        const navbar = document.getElementById("navbar");
        ScrollTrigger.create({
            start: "top -50",
            onEnter: () => navbar.classList.add("scrolled"),
            onLeaveBack: () => navbar.classList.remove("scrolled")
        });

        // Hero Content entrance animations
        const heroTl = gsap.timeline();
        
        heroTl.from(".hero-pretitle", {
            y: 80,
            opacity: 0,
            duration: 1.2,
            ease: "power4.out"
        })
        .from(".hero-main-title", {
            y: 100,
            opacity: 0,
            duration: 1.4,
            ease: "power4.out"
        }, "-=1.0")
        .from(".hero-tagline, .hero-subtitle", {
            y: 50,
            opacity: 0,
            duration: 1.0,
            ease: "power3.out"
        }, "-=1.0")
        .from(".hero-actions", {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.8")
        .from(".profile-container", {
            scale: 0.9,
            opacity: 0,
            duration: 1.5,
            ease: "power4.out"
        }, "-=1.2");

        // Reveal effect for Section titles
        const sections = document.querySelectorAll("section");
        sections.forEach(section => {
            const title = section.querySelector(".editorial-title");
            const subtitle = section.querySelector(".editorial-sub");
            
            if (title || subtitle) {
                const revealTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: section,
                        start: "top bottom",
                        once: true,
                        toggleActions: "play none none none"
                    }
                });
                
                if (subtitle) {
                    revealTl.from(subtitle, {
                        x: -50,
                        opacity: 0,
                        duration: 0.8,
                        ease: "power2.out"
                    });
                }
                
                if (title) {
                    revealTl.from(title, {
                        y: 60,
                        opacity: 0,
                        duration: 1.0,
                        ease: "power3.out"
                    }, "-=0.6");
                }
            }
        });

        // About section stats counter initiation
        ScrollTrigger.create({
            trigger: "#about",
            start: "top bottom",
            once: true,
            onEnter: () => startCounters()
        });

        // Projects grid items reveal
        gsap.from(".project-luxury-card", {
            y: 100,
            opacity: 0,
            duration: 1.2,
            stagger: 0.25,
            ease: "power3.out",
            clearProps: "all",
            scrollTrigger: {
                trigger: ".projects-layout-grid",
                start: "top bottom",
                once: true
            }
        });

        // Skills rows stagger reveal
        const skillRows = document.querySelectorAll(".skills-category-row");
        skillRows.forEach(row => {
            gsap.from(row.querySelectorAll(".skill-tag-card"), {
                scale: 0.8,
                opacity: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: "back.out(1.7)",
                clearProps: "all",
                scrollTrigger: {
                    trigger: row,
                    start: "top bottom",
                    once: true
                }
            });
        });

        // Experience timeline line animation
        gsap.to("#timeline-progress", {
            height: "100%",
            ease: "none",
            scrollTrigger: {
                trigger: ".experience-timeline",
                start: "top bottom",
                end: "bottom center",
                scrub: true
            }
        });

        // Experience timeline items dynamic activation class
        const timelineItems = document.querySelectorAll(".timeline-item");
        timelineItems.forEach(item => {
            ScrollTrigger.create({
                trigger: item,
                start: "top 75%",
                onEnter: () => item.classList.add("active"),
                onLeaveBack: () => item.classList.remove("active")
            });
        });

        // Certifications grid elements entry
        gsap.from(".cert-luxury-card", {
            y: 80,
            opacity: 0,
            duration: 1.0,
            stagger: 0.2,
            ease: "power2.out",
            clearProps: "all",
            scrollTrigger: {
                trigger: ".certs-grid",
                start: "top bottom",
                once: true
            }
        });


    } else {
        // Fallback for counters if GSAP is unavailable
        startCounters();
    }

    // 5. STATISTICS & ACHIEVEMENT COUNTERS
    let countersInitiated = false;
    function startCounters() {
        if (countersInitiated) return;
        countersInitiated = true;
        
        const counterElements = document.querySelectorAll(".counter");
        counterElements.forEach(counter => {
            const target = parseInt(counter.getAttribute("data-target"), 10);
            const duration = 2000; // Duration 2 seconds
            const startTime = performance.now();

            const updateCount = (currentTime) => {
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                
                // Easing function: outQuad
                const easeValue = progress * (2 - progress);
                const currentValue = Math.floor(easeValue * target);
                
                counter.textContent = currentValue;

                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    counter.textContent = target;
                }
            };
            requestAnimationFrame(updateCount);
        });
    }

    // 6. 3D CARD HOVER TILT EFFECTS (For Certifications)
    const tiltCards = document.querySelectorAll(".cert-luxury-card");
    
    tiltCards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // Mouse x within card
            const y = e.clientY - rect.top;  // Mouse y within card
            
            // Calculate tilt factors (-15deg to 15deg max)
            const midX = rect.width / 2;
            const midY = rect.height / 2;
            const tiltX = (midY - y) / 10;
            const tiltY = (x - midX) / 10;

            card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02) translateZ(10px)`;
            card.style.boxShadow = `0 20px 45px rgba(225, 6, 0, 0.08)`;
            card.style.borderColor = `var(--accent)`;
        });

        card.addEventListener("mouseleave", () => {
            // Restore default transformations
            card.style.transform = `rotateX(0deg) rotateY(0deg) scale(1) translateZ(0px)`;
            card.style.boxShadow = `none`;
            card.style.borderColor = `var(--border-color)`;
        });
    });

    // 7. MOBILE MENU HAMBURGER TOGGLE
    const toggleBtn = document.getElementById("nav-toggle");
    const menu = document.getElementById("nav-menu");
    const menuLinks = document.querySelectorAll(".nav-link");

    if (toggleBtn && menu) {
        toggleBtn.addEventListener("click", () => {
            toggleBtn.classList.toggle("open");
            menu.classList.toggle("open");
        });

        // Close when a link gets clicked
        menuLinks.forEach(link => {
            link.addEventListener("click", () => {
                toggleBtn.classList.remove("open");
                menu.classList.remove("open");
            });
        });
    }

    // 8. DYNAMIC ANCHOR SCROLLING OFFSET
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    scrollLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;
            
            const targetElem = document.querySelector(targetId);
            if (targetElem) {
                e.preventDefault();
                const headerOffset = 90;
                const elementPosition = targetElem.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // 9. CONTACT FORM VALIDATIONS & SYSTEM TOASTS
    const form = document.getElementById("contact-form");
    const toastContainer = document.getElementById("toast-container");

    const launchToast = (message, isSuccess = true) => {
        const toast = document.createElement("div");
        toast.className = "toast-popup";
        
        const iconName = isSuccess ? "check-circle" : "alert-triangle";
        toast.innerHTML = `
            <i data-lucide="${iconName}" class="toast-icon"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Bind Icons
        if (typeof lucide !== "undefined") {
            lucide.createIcons({
                attrs: { class: 'toast-icon' }
            });
        }
        
        // Play entry animation
        setTimeout(() => toast.classList.add("visible"), 50);
        
        // Remove toast
        setTimeout(() => {
            toast.classList.remove("visible");
            setTimeout(() => toast.remove(), 600);
        }, 3500);
    };

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("form-name").value.trim();
            const email = document.getElementById("form-email").value.trim();
            const message = document.getElementById("form-message").value.trim();
            
            // Minimal regex verification check
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!name) {
                launchToast("Name is required.", false);
                return;
            }
            if (!email || !emailRegex.test(email)) {
                launchToast("Please enter a valid email address.", false);
                return;
            }
            if (!message) {
                launchToast("Message body cannot be empty.", false);
                return;
            }

            const submitBtn = form.querySelector(".btn-form-submit");
            const originalText = submitBtn.textContent;
            
            submitBtn.disabled = true;
            submitBtn.textContent = "Sending...";
            
            // Connect to actual backend API endpoint
            fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, message })
            })
            .then(res => {
                if (res.ok) {
                    launchToast("Message sent successfully! Hariprasath will connect with you soon.");
                    form.reset();
                } else {
                    return res.json().then(data => {
                        launchToast(data.error || "Failed to send message.", false);
                    });
                }
            })
            .catch(err => {
                console.error(err);
                launchToast("Could not communicate with the backend server.", false);
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            });
        });
    }

    // Dynamic ScrollTrigger refresh on resource loads
    window.addEventListener("load", () => {
        if (typeof ScrollTrigger !== "undefined") {
            ScrollTrigger.refresh();
        }
    });

    // Fallback delayed recalculation checks
    setTimeout(() => {
        if (typeof ScrollTrigger !== "undefined") {
            ScrollTrigger.refresh();
        }
    }, 1500);

});
