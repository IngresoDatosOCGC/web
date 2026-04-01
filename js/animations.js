/**
 * Animaciones y Scroll Reveal
 */

export function initScrollAnimations() {
    const revealElements = document.querySelectorAll('.animate-on-scroll');
    
    if (revealElements.length === 0) return;

    const revealOnScroll = () => {
        for (let i = 0; i < revealElements.length; i++) {
            const windowHeight = window.innerHeight;
            const elementTop = revealElements[i].getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < windowHeight - elementVisible) {
                revealElements[i].classList.add("active");
            }
        }
    };

    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll(); // Trigger once on load
}

export function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}
