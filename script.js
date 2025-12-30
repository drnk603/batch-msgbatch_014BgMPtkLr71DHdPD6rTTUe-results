(function() {
    'use strict';

    window.__app = window.__app || {};

    function debounce(func, wait) {
        var timeout;
        return function executedFunction() {
            var context = this;
            var args = arguments;
            var later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        var inThrottle;
        return function() {
            var args = arguments;
            var context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() { inThrottle = false; }, limit);
            }
        };
    }

    function getViewportWidth() {
        return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    }

    function initBurgerMenu() {
        if (__app.burgerInit) return;
        __app.burgerInit = true;

        var toggler = document.querySelector('.navbar-toggler');
        var collapse = document.querySelector('.navbar-collapse');
        var nav = document.querySelector('header.navbar');
        var navLinks = document.querySelectorAll('.nav-link');
        var body = document.body;

        if (!toggler || !collapse) return;

        function openMenu() {
            collapse.classList.add('show');
            toggler.setAttribute('aria-expanded', 'true');
            body.style.overflow = 'hidden';
        }

        function closeMenu() {
            collapse.classList.remove('show');
            toggler.setAttribute('aria-expanded', 'false');
            body.style.overflow = '';
        }

        toggler.addEventListener('click', function(e) {
            e.preventDefault();
            if (collapse.classList.contains('show')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && collapse.classList.contains('show')) {
                closeMenu();
            }
        });

        document.addEventListener('click', function(e) {
            if (collapse.classList.contains('show') && 
                !collapse.contains(e.target) && 
                !toggler.contains(e.target)) {
                closeMenu();
            }
        });

        for (var i = 0; i < navLinks.length; i++) {
            navLinks[i].addEventListener('click', closeMenu);
        }

        var handleResize = debounce(function() {
            if (getViewportWidth() >= 768 && collapse.classList.contains('show')) {
                closeMenu();
            }
        }, 100);

        window.addEventListener('resize', handleResize, { passive: true });
    }

    function initScrollEffects() {
        if (__app.scrollEffectsInit) return;
        __app.scrollEffectsInit = true;

        var animatedElements = document.querySelectorAll('.card, .btn, img, h1, h2, h3, p, .form-control');

        var observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(30px)';
                    
                    requestAnimationFrame(function() {
                        entry.target.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    });
                    
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        for (var i = 0; i < animatedElements.length; i++) {
            observer.observe(animatedElements[i]);
        }
    }

    function initMicroInteractions() {
        if (__app.microInteractionsInit) return;
        __app.microInteractionsInit = true;

        var buttons = document.querySelectorAll('.btn, .nav-link, .card');

        for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('mouseenter', function(e) {
                var target = e.currentTarget;
                target.style.transition = 'all 0.3s ease-out';
            });

            buttons[i].addEventListener('click', function(e) {
                var target = e.currentTarget;
                var ripple = document.createElement('span');
                var rect = target.getBoundingClientRect();
                var size = Math.max(rect.width, rect.height);
                var x = e.clientX - rect.left - size / 2;
                var y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.style.position = 'absolute';
                ripple.style.borderRadius = '50%';
                ripple.style.background = 'rgba(255, 255, 255, 0.6)';
                ripple.style.transform = 'scale(0)';
                ripple.style.animation = 'ripple 0.6s ease-out';
                ripple.style.pointerEvents = 'none';

                var container = target;
                if (getComputedStyle(target).position === 'static') {
                    target.style.position = 'relative';
                }
                container.style.overflow = 'hidden';

                container.appendChild(ripple);

                setTimeout(function() {
                    if (ripple.parentNode) {
                        ripple.parentNode.removeChild(ripple);
                    }
                }, 600);
            });
        }

        var style = document.createElement('style');
        style.textContent = '@keyframes ripple { to { transform: scale(4); opacity: 0; } }';
        document.head.appendChild(style);
    }

    function initSmoothScroll() {
        if (__app.smoothScrollInit) return;
        __app.smoothScrollInit = true;

        var isHomepage = window.location.pathname === '/' || window.location.pathname === '/index.html';

        document.addEventListener('click', function(e) {
            var link = e.target.closest('a[href^="#"]');
            if (link && isHomepage) {
                var href = link.getAttribute('href');
                if (href !== '#' && href !== '#!') {
                    e.preventDefault();
                    var targetId = href.substring(1);
                    var target = document.getElementById(targetId);
                    if (target) {
                        var headerHeight = 80;
                        var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            }
        });
    }

    function initScrollSpy() {
        if (__app.scrollSpyInit) return;
        __app.scrollSpyInit = true;

        var sections = document.querySelectorAll('section[id]');
        var navLinks = document.querySelectorAll('.nav-link[href^="#"]');

        if (sections.length === 0 || navLinks.length === 0) return;

        var observerOptions = {
            root: null,
            rootMargin: '-80px 0px -80% 0px',
            threshold: 0
        };

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.getAttribute('id');
                    navLinks.forEach(function(link) {
                        link.classList.remove('active');
                        link.removeAttribute('aria-current');
                        if (link.getAttribute('href') === '#' + id) {
                            link.classList.add('active');
                            link.setAttribute('aria-current', 'page');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(function(section) {
            observer.observe(section);
        });
    }

    function initActiveMenu() {
        if (__app.activeMenuInit) return;
        __app.activeMenuInit = true;

        var currentPath = window.location.pathname;
        var navLinks = document.querySelectorAll('.nav-link');

        for (var i = 0; i < navLinks.length; i++) {
            navLinks[i].removeAttribute('aria-current');
            navLinks[i].classList.remove('active');
        }

        for (var j = 0; j < navLinks.length; j++) {
            var link = navLinks[j];
            var linkPath = new URL(link.href).pathname;
            
            if (linkPath === currentPath || 
                (currentPath === '/' && linkPath === '/index.html') ||
                (currentPath === '/index.html' && linkPath === '/')) {
                link.setAttribute('aria-current', 'page');
                link.classList.add('active');
                break;
            }
        }
    }

    function initImages() {
        if (__app.imagesInit) return;
        __app.imagesInit = true;

        var images = document.querySelectorAll('img');
        
        for (var i = 0; i < images.length; i++) {
            var img = images[i];
            
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            
            img.addEventListener('error', function(e) {
                var failedImg = e.target;
                var svgPlaceholder = 'data:image/svg+xml;base64,' + btoa(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">' +
                    '<rect width="100" height="100" fill="#f8f9fa"/>' +
                    '<text x="50" y="55" text-anchor="middle" fill="#6c757d" font-family="Arial" font-size="12">Image</text>' +
                    '</svg>'
                );
                
                failedImg.src = svgPlaceholder;
                failedImg.style.objectFit = 'contain';
            });
        }
    }

    function initFormValidation() {
        if (__app.formValidationInit) return;
        __app.formValidationInit = true;

        var notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '9999';
        notificationContainer.style.maxWidth = '400px';
        document.body.appendChild(notificationContainer);

        function showNotification(message, type) {
            var notification = document.createElement('div');
            notification.className = 'alert alert-' + (type || 'info');
            notification.style.marginBottom = '10px';
            notification.style.padding = '15px';
            notification.style.borderRadius = '8px';
            notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            notification.style.animation = 'slideIn 0.3s ease-out';
            notification.textContent = message;

            notificationContainer.appendChild(notification);

            setTimeout(function() {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(function() {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 5000);
        }

        var style = document.createElement('style');
        style.textContent = 
            '@keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }' +
            '@keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }';
        document.head.appendChild(style);

        var forms = document.querySelectorAll('form');

        function validateEmail(email) {
            var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }

        function validatePhone(phone) {
            if (!phone) return true;
            var re = /^[\d\s\+\-\(\)]{10,20}$/;
            return re.test(phone);
        }

        function validateName(name) {
            var re = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;
            return re.test(name);
        }

        function validateMessage(message) {
            return message && message.length >= 10;
        }

        function showFieldError(field, message) {
            field.classList.add('is-invalid');
            var feedback = field.parentNode.querySelector('.invalid-feedback');
            if (!feedback) {
                feedback = document.createElement('div');
                feedback.className = 'invalid-feedback';
                field.parentNode.appendChild(feedback);
            }
            feedback.textContent = message;
            feedback.style.display = 'block';
        }

        function clearFieldError(field) {
            field.classList.remove('is-invalid');
            var feedback = field.parentNode.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.style.display = 'none';
            }
        }

        for (var i = 0; i < forms.length; i++) {
            var form = forms[i];
            
            var inputs = form.querySelectorAll('input, textarea, select');
            for (var j = 0; j < inputs.length; j++) {
                inputs[j].addEventListener('input', function(e) {
                    clearFieldError(e.target);
                });
            }

            form.addEventListener('submit', function(e) {
                e.preventDefault();
                e.stopPropagation();

                var currentForm = e.target;
                var isValid = true;

                var firstName = currentForm.querySelector('#firstName, #vorname');
                var lastName = currentForm.querySelector('#lastName, #nachname');
                var email = currentForm.querySelector('#email');
                var phone = currentForm.querySelector('#phone, #telefon');
                var message = currentForm.querySelector('#message, #nachricht');
                var privacy = currentForm.querySelector('#privacy, #datenschutz');

                if (firstName) {
                    clearFieldError(firstName);
                    if (!firstName.value.trim()) {
                        showFieldError(firstName, 'Bitte geben Sie Ihren Vornamen ein.');
                        isValid = false;
                    } else if (!validateName(firstName.value.trim())) {
                        showFieldError(firstName, 'Bitte geben Sie einen gültigen Vornamen ein (2-50 Zeichen).');
                        isValid = false;
                    }
                }

                if (lastName) {
                    clearFieldError(lastName);
                    if (!lastName.value.trim()) {
                        showFieldError(lastName, 'Bitte geben Sie Ihren Nachnamen ein.');
                        isValid = false;
                    } else if (!validateName(lastName.value.trim())) {
                        showFieldError(lastName, 'Bitte geben Sie einen gültigen Nachnamen ein (2-50 Zeichen).');
                        isValid = false;
                    }
                }

                if (email) {
                    clearFieldError(email);
                    if (!email.value.trim()) {
                        showFieldError(email, 'Bitte geben Sie Ihre E-Mail-Adresse ein.');
                        isValid = false;
                    } else if (!validateEmail(email.value.trim())) {
                        showFieldError(email, 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
                        isValid = false;
                    }
                }

                if (phone) {
                    clearFieldError(phone);
                    if (phone.value.trim() && !validatePhone(phone.value.trim())) {
                        showFieldError(phone, 'Bitte geben Sie eine gültige Telefonnummer ein (10-20 Zeichen).');
                        isValid = false;
                    }
                }

                if (message) {
                    clearFieldError(message);
                    if (!message.value.trim()) {
                        showFieldError(message, 'Bitte geben Sie eine Nachricht ein.');
                        isValid = false;
                    } else if (!validateMessage(message.value.trim())) {
                        showFieldError(message, 'Die Nachricht muss mindestens 10 Zeichen lang sein.');
                        isValid = false;
                    }
                }

                if (privacy) {
                    clearFieldError(privacy);
                    if (!privacy.checked) {
                        showFieldError(privacy, 'Bitte akzeptieren Sie die Datenschutzerklärung.');
                        isValid = false;
                    }
                }

                if (!isValid) {
                    showNotification('Bitte überprüfen Sie Ihre Eingaben.', 'danger');
                    return;
                }

                var submitBtn = currentForm.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    var originalText = submitBtn.textContent;
                    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" style="width: 1rem; height: 1rem; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; display: inline-block; animation: spinner 0.75s linear infinite;"></span>Senden...';

                    var spinnerStyle = document.createElement('style');
                    spinnerStyle.textContent = '@keyframes spinner { to { transform: rotate(360deg); } }';
                    document.head.appendChild(spinnerStyle);
                }

                setTimeout(function() {
                    showNotification('Nachricht erfolgreich gesendet!', 'success');
                    
                    setTimeout(function() {
                        window.location.href = 'thank_you.html';
                    }, 1000);
                }, 1500);
            });
        }
    }

    function initCountUp() {
        if (__app.countUpInit) return;
        __app.countUpInit = true;

        var counters = document.querySelectorAll('[data-count]');

        if (counters.length === 0) return;

        function animateCount(element) {
            var target = parseInt(element.getAttribute('data-count'));
            var duration = 2000;
            var start = 0;
            var startTime = null;

            function animate(currentTime) {
                if (!startTime) startTime = currentTime;
                var progress = (currentTime - startTime) / duration;

                if (progress < 1) {
                    var current = Math.floor(start + (target - start) * progress);
                    element.textContent = current.toLocaleString();
                    requestAnimationFrame(animate);
                } else {
                    element.textContent = target.toLocaleString();
                }
            }

            requestAnimationFrame(animate);
        }

        var observerOptions = {
            root: null,
            threshold: 0.5
        };

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        counters.forEach(function(counter) {
            observer.observe(counter);
        });
    }

    function initScrollToTop() {
        if (__app.scrollToTopInit) return;
        __app.scrollToTopInit = true;

        var scrollBtn = document.createElement('button');
        scrollBtn.innerHTML = '↑';
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.style.position = 'fixed';
        scrollBtn.style.bottom = '30px';
        scrollBtn.style.right = '30px';
        scrollBtn.style.width = '50px';
        scrollBtn.style.height = '50px';
        scrollBtn.style.borderRadius = '50%';
        scrollBtn.style.background = 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))';
        scrollBtn.style.color = 'white';
        scrollBtn.style.border = 'none';
        scrollBtn.style.fontSize = '24px';
        scrollBtn.style.cursor = 'pointer';
        scrollBtn.style.opacity = '0';
        scrollBtn.style.visibility = 'hidden';
        scrollBtn.style.transition = 'all 0.3s ease-out';
        scrollBtn.style.zIndex = '1000';
        scrollBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        scrollBtn.setAttribute('aria-label', 'Nach oben scrollen');

        document.body.appendChild(scrollBtn);

        var handleScroll = throttle(function() {
            if (window.pageYOffset > 300) {
                scrollBtn.style.opacity = '1';
                scrollBtn.style.visibility = 'visible';
            } else {
                scrollBtn.style.opacity = '0';
                scrollBtn.style.visibility = 'hidden';
            }
        }, 100);

        window.addEventListener('scroll', handleScroll, { passive: true });

        scrollBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        scrollBtn.addEventListener('mouseenter', function() {
            scrollBtn.style.transform = 'translateY(-5px) scale(1.1)';
            scrollBtn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
        });

        scrollBtn.addEventListener('mouseleave', function() {
            scrollBtn.style.transform = 'translateY(0) scale(1)';
            scrollBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        });
    }

    function initPrivacyModal() {
        if (__app.privacyModalInit) return;
        __app.privacyModalInit = true;

        var privacyLinks = document.querySelectorAll('a[href*="privacy"]');

        privacyLinks.forEach(function(link) {
            if (link.getAttribute('href') === '#' || link.textContent.toLowerCase().includes('datenschutz')) {
                link.addEventListener('click', function(e) {
                    if (window.location.pathname.includes('privacy')) return;
                    
                    e.preventDefault();
                    window.location.href = 'privacy.html';
                });
            }
        });
    }

    function initCardAnimations() {
        if (__app.cardAnimationsInit) return;
        __app.cardAnimationsInit = true;

        var cards = document.querySelectorAll('.card');

        cards.forEach(function(card) {
            card.style.transition = 'all 0.3s ease-out';

            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    __app.init = function() {
        if (__app.initialized) return;
        __app.initialized = true;

        initBurgerMenu();
        initScrollEffects();
        initMicroInteractions();
        initSmoothScroll();
        initScrollSpy();
        initActiveMenu();
        initImages();
        initFormValidation();
        initCountUp();
        initScrollToTop();
        initPrivacyModal();
        initCardAnimations();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', __app.init);
    } else {
        __app.init();
    }

})();
@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

@keyframes slideIn {
    from {
        transform: translateX(400px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(400px);
        opacity: 0;
    }
}

@keyframes spinner {
    to {
        transform: rotate(360deg);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.navbar-collapse {
    height: calc(100vh - var(--header-height-mobile));
}

@media (min-width: 768px) {
    .navbar-collapse {
        height: auto;
    }
}

.scroll-to-top {
    animation: fadeInUp 0.3s ease-out;
}

.notification-container .alert {
    animation: slideIn 0.3s ease-out;
}

.card {
    will-change: transform;
}

.btn {
    will-change: transform;
    overflow: hidden;
}

img {
    will-change: opacity, transform;
}

[data-aos] {
    will-change: opacity, transform;
}

@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}

.invalid-feedback {
    color: var(--color-error);
    font-size: var(--font-size-sm);
    margin-top: var(--space-xs);
    display: none;
    animation: fadeInUp 0.3s ease-out;
}

.form-control.is-invalid ~ .invalid-feedback,
.form-select.is-invalid ~ .invalid-feedback,
.form-check-input.is-invalid ~ .invalid-feedback {
    display: block;
}

.hero-section,
section#hero {
    animation: fadeInUp 0.8s ease-out;
}

.avatar {
    transition: all var(--transition-base);
}

.breadcrumb-item a {
    transition: all var(--transition-fast);
}

.table {
    animation: fadeInUp 0.6s ease-out;
}

footer.l-footer {
    animation: fadeInUp 0.8s ease-out;
}
