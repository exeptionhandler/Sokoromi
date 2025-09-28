// Sokoromi Bot Website JavaScript - Fixed Version

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (link.getAttribute('href').startsWith('#')) {
                link.addEventListener('click', function() {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                });
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }

    // Fix Smooth Scrolling for Navigation Links
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const offsetTop = targetElement.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Ensure External Links Work Properly
    const externalLinks = document.querySelectorAll('a[href^="http"]');
    externalLinks.forEach(link => {
        // Ensure target="_blank" is set
        if (!link.hasAttribute('target')) {
            link.setAttribute('target', '_blank');
        }
        // Add rel="noopener noreferrer" for security
        link.setAttribute('rel', 'noopener noreferrer');
    });

    // Animated Counter for Statistics
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 16);
    }

    // Intersection Observer for Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-on-scroll');
                
                // Animate counters when statistics section is visible
                if (entry.target.closest('.statistics')) {
                    const counters = entry.target.querySelectorAll('.stat-number');
                    counters.forEach(counter => {
                        const target = parseInt(counter.getAttribute('data-target'));
                        if (!counter.dataset.animated) {
                            counter.dataset.animated = 'true';
                            animateCounter(counter, target);
                        }
                    });
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animations
    const elementsToAnimate = document.querySelectorAll(
        '.feature-card, .step, .stat-card, .command-card, .section-header'
    );
    
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });

    // Navbar Background Change on Scroll
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScrollTop = scrollTop;
    });

    // Button Click Tracking and Feedback
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);

            // Log button clicks for debugging
            const href = this.getAttribute('href');
            if (href && href.startsWith('http')) {
                console.log('Opening link:', href);
            }
        });
    });

    // Fix Top.gg Widget Fallback
    function checkTopGGWidget() {
        const widget = document.querySelector('.topgg-widget img');
        if (widget) {
            widget.addEventListener('error', function() {
                // If the image fails to load, show a fallback
                const fallback = document.createElement('div');
                fallback.innerHTML = `
                    <div style="padding: 20px; text-align: center; background: var(--color-primary); color: white; border-radius: 10px;">
                        <div style="font-size: 24px; font-weight: bold;">Sokoromi</div>
                        <div style="font-size: 14px; opacity: 0.9;">1 Servidor</div>
                        <div style="font-size: 12px; margin-top: 5px;">
                            <a href="https://top.gg/bot/1419121189611372574" target="_blank" style="color: white; text-decoration: underline;">
                                Ver en Top.gg
                            </a>
                        </div>
                    </div>
                `;
                this.parentNode.replaceChild(fallback, this);
            });
        }
    }

    checkTopGGWidget();

    // Console Welcome Message
    console.log(`
    🌸✨ ¡Hola desde Sokoromi! ✨🌸
    
    ¿Te gusta curiosear el código? ¡Qué kawaii! (◡ ‿ ◡)
    
    Si encuentras algún bug o tienes sugerencias,
    ¡visita nuestro GitHub!
    
    https://github.com/exeptionhandler/Sokoromi
    
    ¡Gracias por usar Sokoromi! 💖
    `);

    console.log('🚀 Sokoromi website loaded successfully!');
});