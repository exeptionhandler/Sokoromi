// Sokoromi Bot Website - Enhanced JavaScript Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Console welcome message
    console.log(`
    🌸✨ ¡Hola desde Sokoromi! ✨🌸
    
    ¿Te gusta curiosear el código? ¡Qué kawaii! (◡ ‿ ◡)
    
    Si encuentras algún bug o tienes sugerencias,
    ¡visita nuestro GitHub!
    
    https://github.com/exeptionhandler/Sokoromi
    
    ¡Gracias por usar Sokoromi! 💖
    `);

    // Initialize all functionality
    initMobileNavigation();
    initSmoothScrolling();
    initExternalLinks();
    initScrollAnimations();
    initNavbarEffects();
    initButtonFeedback();
    initTopGGWidget();
    
    console.log('🚀 Sokoromi website loaded successfully!');
});

// Mobile Navigation Toggle
function initMobileNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (!navToggle || !navMenu) return;

    // Toggle mobile menu
    navToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        
        // Prevent body scrolling when menu is open
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    // Close menu when clicking on internal navigation links
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Handle resize events
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Enhanced Smooth Scrolling
function initSmoothScrolling() {
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const navbar = document.querySelector('.navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 70;
                const offsetTop = targetElement.offsetTop - navbarHeight - 20;
                
                // Smooth scroll with custom easing
                window.scrollTo({
                    top: Math.max(0, offsetTop),
                    behavior: 'smooth'
                });

                // Update URL without jumping
                setTimeout(() => {
                    history.replaceState(null, null, targetId);
                }, 100);
            }
        });
    });
}

// Enhanced External Links Management
function initExternalLinks() {
    const externalLinks = document.querySelectorAll('a[href^="http"]');
    
    externalLinks.forEach(link => {
        // Ensure proper attributes for security and UX
        if (!link.hasAttribute('target')) {
            link.setAttribute('target', '_blank');
        }
        link.setAttribute('rel', 'noopener noreferrer');
        
        // Add loading feedback for external links
        link.addEventListener('click', function() {
            console.log('Opening external link:', this.href);
            
            // Optional: Add visual feedback
            const originalText = this.innerHTML;
            this.style.opacity = '0.7';
            
            setTimeout(() => {
                this.style.opacity = '';
            }, 200);
        });
    });
}

// Advanced Scroll Animations with Intersection Observer
function initScrollAnimations() {
    // Check if IntersectionObserver is supported
    if (!window.IntersectionObserver) {
        console.log('IntersectionObserver not supported, skipping animations');
        return;
    }

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Handle statistics section counters
                if (entry.target.closest('.statistics')) {
                    animateStatistics();
                }
                
                // Unobserve after animation to improve performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animations
    const elementsToAnimate = document.querySelectorAll(
        '.feature-card, .step, .stat-card, .command-card, .section-header'
    );
    
    elementsToAnimate.forEach(element => {
        element.classList.add('animate-on-scroll');
        observer.observe(element);
    });
}

// Animated Statistics Counters
function animateStatistics() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    
    counters.forEach(counter => {
        if (counter.dataset.animated) return; // Prevent re-animation
        
        counter.dataset.animated = 'true';
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(easeOutQuart * target);
            
            counter.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString();
            }
        }
        
        requestAnimationFrame(updateCounter);
    });
}

// Navbar Effects on Scroll
function initNavbarEffects() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    let lastScrollTop = 0;
    let ticking = false;
    
    function updateNavbar() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add scrolled class for styling
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
        ticking = false;
    }
    
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
}

// Enhanced Button Feedback
function initButtonFeedback() {
    const buttons = document.querySelectorAll('.btn, .nav-link, .footer-link');
    
    buttons.forEach(button => {
        // Add ripple effect on click
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: rippleEffect 0.6s linear;
                pointer-events: none;
                z-index: 1000;
            `;
            
            // Ensure button has relative positioning
            const position = getComputedStyle(this).position;
            if (position === 'static') {
                this.style.position = 'relative';
            }
            
            this.appendChild(ripple);
            
            // Remove ripple after animation
            setTimeout(() => {
                if (ripple && ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
            
            // Add scale feedback for buttons
            if (this.classList.contains('btn')) {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            }
        });

        // Add hover effects for better UX
        button.addEventListener('mouseenter', function() {
            if (this.classList.contains('btn')) {
                this.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
            }
        });
    });

    // Add CSS for ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rippleEffect {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Top.gg Widget Management with Enhanced Fallback
function initTopGGWidget() {
    const widget = document.querySelector('#topgg-widget img');
    if (!widget) return;
    
    let loadTimeout;
    
    // Set a timeout for widget loading
    loadTimeout = setTimeout(() => {
        showWidgetFallback();
    }, 5000); // 5 seconds timeout
    
    widget.addEventListener('load', function() {
        clearTimeout(loadTimeout);
        console.log('Top.gg widget loaded successfully');
    });
    
    widget.addEventListener('error', function() {
        clearTimeout(loadTimeout);
        showWidgetFallback();
    });
    
    function showWidgetFallback() {
        const widgetContainer = document.querySelector('#topgg-widget');
        if (!widgetContainer) return;
        
        console.log('Top.gg widget failed to load, showing fallback');
        
        widgetContainer.innerHTML = `
            <div class="widget-fallback">
                <div class="widget-fallback-title">🌸 Sokoromi</div>
                <div class="widget-fallback-servers">1 Servidor</div>
                <a href="https://top.gg/bot/1419121189611372574" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="widget-fallback-link">
                    Ver en Top.gg →
                </a>
            </div>
        `;
        
        // Add click tracking for fallback
        const fallbackLink = widgetContainer.querySelector('.widget-fallback-link');
        if (fallbackLink) {
            fallbackLink.addEventListener('click', function() {
                console.log('Fallback Top.gg link clicked');
            });
        }
    }
}

// Utility Functions

// Debounce function for performance optimization
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Add loading state management
window.addEventListener('beforeunload', function() {
    document.body.classList.add('loading');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('Page hidden - pausing animations');
        // Could pause animations here for performance
    } else {
        console.log('Page visible - resuming animations');
        // Could resume animations here
    }
});

// Performance monitoring
if (window.performance && window.performance.mark) {
    window.performance.mark('sokoromi-script-loaded');
}

// Error handling for better user experience
window.addEventListener('error', function(event) {
    console.error('JavaScript error occurred:', event.error);
    // Could send error reports here in a production environment
});

// Add accessibility improvements
document.addEventListener('keydown', function(event) {
    // Handle keyboard navigation for custom elements
    if (event.key === 'Enter' || event.key === ' ') {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.classList.contains('btn') || activeElement.classList.contains('nav-link'))) {
            event.preventDefault();
            activeElement.click();
        }
    }
});

// Preload critical images for better performance
function preloadImages() {
    const criticalImages = [
        'https://top.gg/api/widget/servers/1419121189611372574.svg'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Initialize preloading
preloadImages();