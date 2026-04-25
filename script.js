document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.querySelector('[data-lightbox]');
  const lightboxTarget = document.querySelector('[data-lightbox-target]');
  const lightboxClose = document.querySelector('[data-lightbox-close]');
  const lightboxImages = Array.from(document.querySelectorAll('[data-lightbox-image]'));

  const bindLightbox = () => {
    if (!lightbox || !lightboxTarget || !lightboxClose || !lightboxImages.length) {
      return;
    }

    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxTarget.src = '';
      lightboxTarget.alt = '';
    };

    lightboxImages.forEach((image) => {
      image.addEventListener('click', () => {
        lightboxTarget.src = image.src;
        lightboxTarget.alt = image.alt;
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
      });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && lightbox.classList.contains('is-open')) {
        closeLightbox();
      }
    });
  };

  const homeSliderTrack = document.querySelector('[data-home-slider-track]');
  const homeSlides = Array.from(document.querySelectorAll('[data-home-slide]'));
  const homeCount = document.querySelector('[data-home-count]');
  const homeDots = Array.from(document.querySelectorAll('[data-home-dot]'));

  if (homeSliderTrack && homeSlides.length && homeCount && homeDots.length) {
    let activeIndex = 0;
    let isTransitioning = false;
    let wheelLock = false;

    const setActiveNavigation = (index) => {
      homeDots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === index);
      });
    };

    const isHomeHorizontalSlider = () =>
      window.matchMedia('(max-width: 1180px) and (pointer: coarse)').matches;

    const getHomeSlideStep = () => {
      const firstSlide = homeSlides[0];
      const trackStyle = window.getComputedStyle(homeSliderTrack);
      const gapProperty = isHomeHorizontalSlider() ? trackStyle.columnGap : trackStyle.rowGap;
      const trackGap = Number.parseFloat(gapProperty || trackStyle.gap) || 0;

      if (!firstSlide) {
        return 0;
      }

      return (isHomeHorizontalSlider() ? firstSlide.offsetWidth : firstSlide.offsetHeight) + trackGap;
    };

    const renderHomeProject = (index) => {
      const slideOffset = -index * getHomeSlideStep();
      homeSliderTrack.style.transform = isHomeHorizontalSlider()
        ? `translateX(${slideOffset}px)`
        : `translateY(${slideOffset}px)`;

      homeSlides.forEach((slide, slideIndex) => {
        const offset = slideIndex - index;
        const image = slide.querySelector('img');

        slide.classList.toggle('active', slideIndex === index);

        if (image) {
          image.style.setProperty('--parallax-x', `${offset * 7}%`);
          image.style.setProperty('--parallax-y', isHomeHorizontalSlider() ? '0%' : `${offset * 7}%`);
        }
      });

      homeCount.textContent = String(index + 1).padStart(2, '0');
      setActiveNavigation(index);
    };

    const changeHomeProject = (nextIndex) => {
      if (isTransitioning || nextIndex === activeIndex) {
        return;
      }

      isTransitioning = true;
      activeIndex = nextIndex;
      renderHomeProject(activeIndex);

      window.setTimeout(() => {
        isTransitioning = false;
      }, 900);
    };

    const stepHomeProject = (direction) => {
      const nextIndex = (activeIndex + direction + homeSlides.length) % homeSlides.length;
      changeHomeProject(nextIndex);
    };

    window.addEventListener(
      'wheel',
      (event) => {
        if (window.innerWidth <= 720 || wheelLock || Math.abs(event.deltaY) < 12) {
          return;
        }

        event.preventDefault();
        wheelLock = true;
        stepHomeProject(event.deltaY > 0 ? 1 : -1);
        window.setTimeout(() => {
          wheelLock = false;
        }, 700);
      },
      { passive: false }
    );

    homeDots.forEach((dot, index) => {
      dot.addEventListener('click', () => changeHomeProject(index));
    });

    let touchStartX = 0;
    let touchStartY = 0;

    homeSliderTrack.addEventListener(
      'touchstart',
      (event) => {
        if (!isHomeHorizontalSlider()) {
          return;
        }

        const touch = event.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      },
      { passive: true }
    );

    homeSliderTrack.addEventListener(
      'touchend',
      (event) => {
        if (!isHomeHorizontalSlider()) {
          return;
        }

        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        if (Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(deltaY)) {
          stepHomeProject(deltaX < 0 ? 1 : -1);
        }
      },
      { passive: true }
    );

    window.addEventListener('resize', () => renderHomeProject(activeIndex));

    renderHomeProject(activeIndex);
  }

  const buttons = Array.from(document.querySelectorAll('.filter-btn'));
  const groups = Array.from(document.querySelectorAll('[data-category]'));
  const emptyState = document.querySelector('.filter-empty');

  if (buttons.length && groups.length) {
    const applyFilter = (filter) => {
      let visibleCount = 0;

      groups.forEach((group) => {
        const category = group.dataset.category;
        const matches = filter === 'all' || category === filter;
        group.classList.toggle('is-hidden', !matches);

        if (matches) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
      }
    };

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        buttons.forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
        applyFilter(button.dataset.filter || 'all');
      });
    });
  }

  const contactSliderTrack = document.querySelector('[data-contact-slider-track]');
  const contactCount = document.querySelector('[data-contact-count]');
  const contactImagePaths = Array.isArray(window.contactImagePaths) ? window.contactImagePaths : [];

  if (contactSliderTrack && contactCount && contactImagePaths.length) {
    const contactAlt = 'Selecao de trabalhos de Guilherme Ribeiro';
    const contactSlide = contactSliderTrack.querySelector('[data-contact-slide]');
    const contactImage = contactSlide ? contactSlide.querySelector('img') : null;
    let activeContactIndex = 0;

    if (!contactSlide || !contactImage) {
      return;
    }

    const renderContactSlide = (index) => {
      contactSlide.classList.add('active');
      contactImage.src = contactImagePaths[index];
      contactImage.alt = contactAlt;
      contactImage.loading = 'eager';
      contactImage.decoding = 'async';
      contactImage.style.setProperty('--contact-parallax-x', '0%');

      contactCount.textContent = String(index + 1).padStart(2, '0');
    };

    const advanceContactSlide = () => {
      activeContactIndex = (activeContactIndex + 1) % contactImagePaths.length;
      renderContactSlide(activeContactIndex);

      const nextImageIndex = (activeContactIndex + 1) % contactImagePaths.length;
      const preloadImage = new Image();
      preloadImage.decoding = 'async';
      preloadImage.src = contactImagePaths[nextImageIndex];
    };

    window.setInterval(advanceContactSlide, 4200);
    renderContactSlide(activeContactIndex);
  }

  const budgetCategoryToggles = Array.from(document.querySelectorAll('[data-budget-category-toggle]'));

  if (budgetCategoryToggles.length) {
    const setBudgetCategoryState = (toggle, panel, isOpen) => {
      toggle.setAttribute('aria-expanded', String(isOpen));
      panel.classList.toggle('is-open', isOpen);
      panel.style.maxHeight = isOpen ? `${panel.scrollHeight}px` : '0px';
    };

    budgetCategoryToggles.forEach((toggle) => {
      const panelId = toggle.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;

      if (!panel) {
        return;
      }

      toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        setBudgetCategoryState(toggle, panel, !isOpen);
      });

      setBudgetCategoryState(toggle, panel, false);
    });

    window.addEventListener('resize', () => {
      budgetCategoryToggles.forEach((toggle) => {
        const panelId = toggle.getAttribute('aria-controls');
        const panel = panelId ? document.getElementById(panelId) : null;

        if (panel && toggle.getAttribute('aria-expanded') === 'true') {
          panel.style.maxHeight = `${panel.scrollHeight}px`;
        }
      });
    });
  }

  bindLightbox();
});

