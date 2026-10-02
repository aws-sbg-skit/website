/**
 * Builders Spotlight Dynamic Paged Auto-Carousel
 * Displays 3 cards at a time on desktop (>= 992px), 2 on tablet (>= 640px), and 1 on mobile (< 640px).
 * Holds each set of 3 images for 3 seconds, then automatically slides to the next set in a continuous loop.
 * Automatically loads entries dynamically from assets/spotlight/spotlight.json!
 */

(function () {
  const DEFAULT_SPOTLIGHT = [
    {
      id: "winner-1",
      image: "assets/spotlight/winner-1.jpg",
      title: "Orientation Session Quiz Winner",
      description: "Awarded to the top quiz champions during our inaugural AWS SBG SKIT Orientation Session!"
    },
    {
      id: "winner-2",
      image: "assets/spotlight/winner-2.jpg",
      title: "Giveaway 1 Winner",
      description: "Winner of our exclusive community tech hardware giveaway."
    },
    {
      id: "winner-3",
      image: "assets/spotlight/winner-3.jpg",
      title: "Giveaway 2 Winner",
      description: "Celebrating our student builder with wireless earbuds giveaway prize."
    },
    {
      id: "winner-4",
      image: "assets/spotlight/winner-4.jpg",
      title: "AWS Cloud Quest Trivia Winner-1",
      description: "First-place winner of the AWS Cloud Quest Trivia challenge!"
    },
    {
      id: "winner-5",
      image: "assets/spotlight/winner-5.jpg",
      title: "AWS Cloud Quest Trivia Winner-2",
      description: "Runner-up winner receiving official AWS community merchandise kit!"
    },
    {
      id: "winner-6",
      image: "assets/spotlight/winner-6.jpg",
      title: "Winners of AWS Cloud Sprint",
      description: "Celebrating the outstanding champions and winners of the AWS Cloud Sprint challenge!"
    }
  ];

  let currentItems = [];
  let currentIndex = 0;
  let autoTimer = null;
  let itemsPerPage = 3;

  function getItemsPerPage() {
    const w = window.innerWidth;
    if (w < 640) return 1;
    if (w < 992) return 2;
    return 3;
  }

  function renderSpotlightCard(item) {
    return `
      <div class="spotlight-card spotlight" data-id="${item.id}">
        <div class="spotlight-img-frame">
          <div class="spotlight-badge">🏆 Winner</div>
          <img src="${item.image}" alt="${item.title}" loading="lazy">
        </div>
        <div class="spotlight-card-body">
          <h4 class="spotlight-title">${item.title}</h4>
          <p class="spotlight-desc">${item.description}</p>
        </div>
      </div>
    `;
  }

  async function loadSpotlightData() {
    let items = DEFAULT_SPOTLIGHT;
    try {
      const res = await fetch('assets/spotlight/spotlight.json?v=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          items = data;
        }
      }
    } catch (e) {
      console.log('Using default spotlight dataset fallback.');
    }
    return items;
  }

  function updateCarouselState() {
    const track = document.getElementById('spotlightTrack');
    const dotsContainer = document.getElementById('spotlightDots');
    if (!track) return;

    itemsPerPage = getItemsPerPage();
    const totalItems = currentItems.length;
    if (totalItems === 0) return;

    const gap = 24; // gap between cards in px
    const containerWidth = track.parentElement.clientWidth;
    const cardWidth = (containerWidth - gap * (itemsPerPage - 1)) / itemsPerPage;

    const cards = track.querySelectorAll('.spotlight-card');
    cards.forEach(card => {
      card.style.width = `${cardWidth}px`;
    });

    // Translate track
    const moveOffset = (cardWidth + gap) * currentIndex;
    track.style.transform = `translateX(-${moveOffset}px)`;

    // Update pagination dots
    if (dotsContainer) {
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const activeDotIndex = Math.min(
        totalPages - 1,
        Math.floor(currentIndex / itemsPerPage)
      );
      let dotsHtml = '';
      for (let i = 0; i < totalPages; i++) {
        dotsHtml += `<span class="spotlight-dot ${i === activeDotIndex ? 'active' : ''}" data-index="${i * itemsPerPage}"></span>`;
      }
      dotsContainer.innerHTML = dotsHtml;

      // Add click listener to dots
      dotsContainer.querySelectorAll('.spotlight-dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
          currentIndex = parseInt(e.target.dataset.index, 10);
          updateCarouselState();
          resetTimer();
        });
      });
    }
  }

  function nextSlide() {
    const totalItems = currentItems.length;
    const maxIndex = Math.max(0, totalItems - itemsPerPage);

    if (currentIndex >= maxIndex) {
      // Loop back smoothly to start
      currentIndex = 0;
    } else {
      currentIndex += itemsPerPage;
      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }
    }
    updateCarouselState();
  }

  function prevSlide() {
    if (currentIndex <= 0) {
      currentIndex = Math.max(0, currentItems.length - itemsPerPage);
    } else {
      currentIndex -= itemsPerPage;
      if (currentIndex < 0) currentIndex = 0;
    }
    updateCarouselState();
  }

  function startTimer() {
    stopTimer();
    // Holds for exactly 3 seconds, then automatically slides to next 3 images
    autoTimer = setInterval(nextSlide, 3000);
  }

  function stopTimer() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function resetTimer() {
    stopTimer();
    startTimer();
  }

  async function initSpotlight() {
    const track = document.getElementById('spotlightTrack');
    const container = document.getElementById('spotlightContainer');
    const prevBtn = document.getElementById('spotlightPrev');
    const nextBtn = document.getElementById('spotlightNext');

    if (!track) return;

    currentItems = await loadSpotlightData();
    track.innerHTML = currentItems.map(renderSpotlightCard).join('');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        resetTimer();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        resetTimer();
      });
    }

    if (container) {
      container.addEventListener('mouseenter', stopTimer);
      container.addEventListener('mouseleave', startTimer);
      container.addEventListener('touchstart', stopTimer, { passive: true });
      container.addEventListener('touchend', startTimer, { passive: true });
    }

    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateCarouselState, 150);
    });

    updateCarouselState();
    startTimer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpotlight);
  } else {
    initSpotlight();
  }
})();
