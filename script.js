/* -------------------------------------------------------------
   PREMIUM PORTFOLIO INTERACTION LOGIC
   ------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    // 2. Custom Cursor Tracking (Lerped for smoothness)
    const cursorGlow = document.getElementById("cursor-glow");
    const cursorDot = document.getElementById("cursor-dot");
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;
    let dotX = 0, dotY = 0;

    // Detect if device supports touch
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice && cursorGlow) {
        if (cursorDot) cursorDot.style.display = "block";
        
        window.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Frame update loop for cursor smoothing (Lerp)
        const updateCursor = () => {
            // Smooth follow for background glow
            glowX += (mouseX - glowX) * 0.1;
            glowY += (mouseY - glowY) * 0.1;
            cursorGlow.style.left = `${glowX}px`;
            cursorGlow.style.top = `${glowY}px`;

            // Rapid follow for pointer dot
            if (cursorDot) {
                dotX += (mouseX - dotX) * 0.25;
                dotY += (mouseY - dotY) * 0.25;
                cursorDot.style.left = `${dotX}px`;
                cursorDot.style.top = `${dotY}px`;
            }
            requestAnimationFrame(updateCursor);
        };
        updateCursor();

        // Cursor scale effects on clickable elements
        const hoverables = document.querySelectorAll("a, button, input, textarea, .glass-card");
        hoverables.forEach(item => {
            item.addEventListener("mouseenter", () => {
                if (cursorDot) cursorDot.style.transform = "translate(-50%, -50%) scale(1.5)";
                cursorGlow.style.setProperty("--cursor-glow-size", "450px");
            });
            item.addEventListener("mouseleave", () => {
                if (cursorDot) cursorDot.style.transform = "translate(-50%, -50%) scale(1)";
                cursorGlow.style.setProperty("--cursor-glow-size", "350px");
            });
        });
    }

    // 3. Canvas Interactive Particles Engine
    const canvas = document.getElementById("particle-canvas");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        let particles = [];
        let mouse = { x: null, y: null, radius: 100 };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 2.5 + 0.5;
                this.baseX = this.x;
                this.baseY = this.y;
                this.speedY = Math.random() * 0.6 + 0.1;
                this.alpha = Math.random() * 0.6 + 0.2;
                this.density = (Math.random() * 30) + 10;
            }

            draw() {
                ctx.fillStyle = `rgba(212, 175, 55, ${this.alpha})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }

            update() {
                // Floating movement (Upwards direction)
                this.y -= this.speedY;
                this.baseY -= this.speedY;

                // Reset position if particle leaves upper viewport limit
                if (this.y < -10) {
                    this.y = canvas.height + 10;
                    this.baseY = this.y;
                    this.x = Math.random() * canvas.width;
                    this.baseX = this.x;
                }

                // Interactive check against cursor coordinate coordinates
                if (mouse.x !== null && mouse.y !== null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;

                    // Repulsion force
                    let maxDistance = mouse.radius;
                    let force = (maxDistance - distance) / maxDistance;
                    
                    if (distance < mouse.radius) {
                        let directionX = forceDirectionX * force * this.density * 0.6;
                        let directionY = forceDirectionY * force * this.density * 0.6;
                        this.x -= directionX;
                        this.y -= directionY;
                    } else {
                        // Slowly drift back to normal base path
                        if (this.x !== this.baseX) {
                            let dxBase = this.x - this.baseX;
                            this.x -= dxBase / 20;
                        }
                    }
                }
            }
        }

        const initParticles = () => {
            particles = [];
            // Quantity adapts to canvas sizes
            const quantity = Math.floor((canvas.width * canvas.height) / 11000);
            for (let i = 0; i < quantity; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                particles.push(new Particle(x, y));
            }
        };

        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animateParticles);
        };

        // Window interaction setup
        window.addEventListener("resize", resizeCanvas);
        if (!isTouchDevice) {
            window.addEventListener("mousemove", (e) => {
                mouse.x = e.clientX;
                mouse.y = e.clientY;
            });
            window.addEventListener("mouseleave", () => {
                mouse.x = null;
                mouse.y = null;
            });
        }

        resizeCanvas();
        animateParticles();
    }

    // 4. Interactive Card Mouse Hover Glow Effects
    const cards = document.querySelectorAll(".glass-card");
    cards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
        });
    });

    // 5. Scroll Reveals & Counter Animations
    const reveals = document.querySelectorAll(".reveal");
    const counters = document.querySelectorAll(".counter");
    let countTriggered = false;

    const startCounters = () => {
        if (countTriggered) return;
        countTriggered = true;
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute("data-target"), 10);
            const duration = 2000; // 2 seconds
            const stepTime = Math.max(Math.floor(duration / target), 15);
            let current = 0;
            
            const timer = setInterval(() => {
                current += Math.ceil(target / (duration / stepTime));
                if (current >= target) {
                    counter.innerText = target;
                    clearInterval(timer);
                } else {
                    counter.innerText = current;
                }
            }, stepTime);
        });
    };

    const handleReveal = () => {
        const triggerBottom = window.innerHeight * 0.85;

        reveals.forEach(reveal => {
            const revealTop = reveal.getBoundingClientRect().top;
            if (revealTop < triggerBottom) {
                reveal.classList.add("active");
                
                // Special check to fill skill progress bar paths when visible
                const skillBars = reveal.querySelectorAll(".progress-bar-fill");
                if (skillBars.length > 0) {
                    skillBars.forEach(bar => {
                        bar.style.width = bar.getAttribute("data-progress");
                    });
                }
                
                // If hero sections stats are revealed, animate counter metrics
                if (reveal.classList.contains("hero-content")) {
                    startCounters();
                }
            }
        });
    };

    window.addEventListener("scroll", handleReveal);
    // Initial run to check elements present in landing viewport
    setTimeout(handleReveal, 200);

    // 6. Header Scroll Backdrop & Navigation Highlighting
    const header = document.querySelector(".navbar-container");
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("section");

    const handleScrollEffects = () => {
        // Sticky Header Backdrop transition
        if (window.scrollY > 20) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }

        // Active Section Navigation update
        let currentSectionId = "home";
        sections.forEach(sec => {
            const top = sec.offsetTop - 120;
            const height = sec.offsetHeight;
            const scroll = window.scrollY;
            
            if (scroll >= top && scroll < top + height) {
                currentSectionId = sec.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentSectionId}`) {
                link.classList.add("active");
            }
        });
    };

    window.addEventListener("scroll", handleScrollEffects);

    // 7. Mobile Navigation hamburger toggle
    const navToggle = document.getElementById("nav-toggle");
    const navMenu = document.getElementById("nav-menu");

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            navToggle.classList.toggle("open");
            navMenu.classList.toggle("open");
        });

        // Close when clicking nav menu anchors
        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                navToggle.classList.remove("open");
                navMenu.classList.remove("open");
            });
        });
    }

    // 8. Visual Java IDE Compilation Mockup Simulator
    const statusMsg = document.querySelector(".status-msg");
    const statusIndicator = document.querySelector(".status-indicator");

    if (statusMsg && statusIndicator) {
        const statuses = [
            { text: "Executing: javac BinarySearch.java...", indicatorClass: "yellow", delay: 3000 },
            { text: "Execution complete: Target element indices resolved correctly.", indicatorClass: "success", delay: 4000 },
            { text: "Running checks... Code optimization checks complete.", indicatorClass: "success", delay: 3000 },
            { text: "Idle: Awaiting compilation instructions.", indicatorClass: "success", delay: 5000 }
        ];

        let currentIndex = 0;

        const cycleMockupStatus = () => {
            const currentItem = statuses[currentIndex];
            statusMsg.textContent = currentItem.text;
            statusIndicator.className = `status-indicator ${currentItem.indicatorClass}`;

            currentIndex = (currentIndex + 1) % statuses.length;
            setTimeout(cycleMockupStatus, currentItem.delay);
        };

        // Start animation simulator cycle
        setTimeout(cycleMockupStatus, 4000);
    }

    // 9. Contact Form Validation, Submission & Notification Toast
    const contactForm = document.getElementById("contact-form");
    const toastContainer = document.getElementById("toast-container");

    const showToast = (message, success = true) => {
        const toast = document.createElement("div");
        toast.className = "toast";
        
        const icon = document.createElement("i");
        icon.setAttribute("data-lucide", success ? "check-circle" : "alert-triangle");
        icon.className = "toast-icon";
        
        const msg = document.createElement("span");
        msg.className = "toast-msg";
        msg.textContent = message;

        toast.appendChild(icon);
        toast.appendChild(msg);
        toastContainer.appendChild(toast);
        
        // Re-run Lucide initialization inside container dynamically
        if (typeof lucide !== "undefined") {
            lucide.createIcons({
                attrs: {
                    class: 'toast-icon'
                }
            });
        }

        // Auto remove animation duration
        setTimeout(() => {
            toast.style.animation = "toast-fade-out 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards";
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 4000);
    };

    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector(".btn-submit");
            const btnSpan = submitBtn.querySelector("span");
            const originalText = btnSpan.textContent;

            // Form Fields validation checks
            const name = document.getElementById("form-name").value.trim();
            const email = document.getElementById("form-email").value.trim();
            const msg = document.getElementById("form-message").value.trim();

            if (!name || !email || !msg) {
                showToast("Please verify all fields are completed correctly.", false);
                return;
            }

            // Submit Button Visual Loading state
            submitBtn.disabled = true;
            btnSpan.textContent = "Sending Message...";
            submitBtn.style.opacity = "0.7";

            // Simulating API transport delays
            setTimeout(() => {
                showToast("Message Sent! Hariprasath will connect with you shortly.");
                contactForm.reset();
                
                // Return button back to active state
                submitBtn.disabled = false;
                btnSpan.textContent = originalText;
                submitBtn.style.opacity = "1";
            }, 1800);
        });
    }

    // 10. Smooth Anchor Page scrolling offset adjustments
    const internalAnchors = document.querySelectorAll('a[href^="#"]');
    internalAnchors.forEach(anchor => {
        anchor.addEventListener("click", function(e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const offset = 80; // Offset aligns to Sticky header size height
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: "smooth"
                });
            }
        });
    });
});
