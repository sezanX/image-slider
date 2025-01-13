class ImageSlider {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.slide');
        this.slidesContainer = document.querySelector('.slides');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.progressBar = document.querySelector('.progress');
        this.thumbnailsContainer = document.querySelector('.thumbnails');
        this.isTransitioning = false;
        this.autoplayInterval = null;
        this.autoplayDuration = 5000;
        this.progressInterval = null;

        this.init();
    }

    init() {
        // Create thumbnails
        this.slides.forEach((slide, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.classList.add('thumbnail');
            const img = document.createElement('img');
            img.src = slide.querySelector('img').src;
            img.alt = `Thumbnail ${index + 1}`;
            thumbnail.appendChild(img);
            thumbnail.addEventListener('click', () => this.goToSlide(index));
            this.thumbnailsContainer.appendChild(thumbnail);
        });

        // Set initial states
        this.updateSlider();
        this.startAutoplay();

        // Add event listeners
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        this.slidesContainer.addEventListener('transitionend', () => {
            this.isTransitioning = false;
            this.updateActiveStates();
        });

        // Touch events for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        this.slidesContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            this.stopAutoplay();
        }, { passive: true });

        this.slidesContainer.addEventListener('touchmove', (e) => {
            touchEndX = e.touches[0].clientX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 5) { // Prevent vertical scroll from triggering swipe
                e.preventDefault();
            }
        }, { passive: false });

        this.slidesContainer.addEventListener('touchend', () => {
            const diff = touchStartX - touchEndX;
            if (diff > 50) {
                this.nextSlide();
            } else if (diff < -50) {
                this.prevSlide();
            }
            this.startAutoplay();
        });

        // Pause autoplay on hover
        const slider = document.querySelector('.slider');
        slider.addEventListener('mouseenter', () => this.stopAutoplay());
        slider.addEventListener('mouseleave', () => this.startAutoplay());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoplay();
            } else {
                this.startAutoplay();
            }
        });
    }

    updateActiveStates() {
        // Update slides
        this.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentSlide);
        });

        // Update thumbnails
        const thumbnails = document.querySelectorAll('.thumbnail');
        thumbnails.forEach((thumbnail, index) => {
            thumbnail.classList.toggle('active', index === this.currentSlide);
        });
    }

    updateProgressBar() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }

        let progress = 0;
        this.progressBar.style.width = '0%';

        this.progressInterval = setInterval(() => {
            progress += (100 / (this.autoplayDuration / 16)); // 60 FPS
            this.progressBar.style.width = `${Math.min(progress, 100)}%`;
        }, 16);
    }

    goToSlide(index) {
        if (this.isTransitioning || index === this.currentSlide) return;
        this.isTransitioning = true;
        this.currentSlide = index;
        this.updateSlider();
        this.stopAutoplay();
        this.startAutoplay();
    }

    prevSlide() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.updateSlider();
        this.stopAutoplay();
        this.startAutoplay();
    }

    nextSlide() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.updateSlider();
        this.stopAutoplay();
        this.startAutoplay();
    }

    updateSlider() {
        this.slidesContainer.style.transform = `translateX(-${this.currentSlide * 100}%)`;
        this.updateActiveStates();
        this.updateProgressBar();
    }

    startAutoplay() {
        this.stopAutoplay();
        this.autoplayInterval = setInterval(() => this.nextSlide(), this.autoplayDuration);
        this.updateProgressBar();
    }

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            clearInterval(this.progressInterval);
            this.progressBar.style.width = '0%';
        }
    }
}

// Initialize slider when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageSlider();
});