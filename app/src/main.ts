const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target); 
    }
  });
}, { 
  threshold: 0,
  rootMargin: "0px 0px 0px 0px" 
});

const observer50 = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target); 
    }
  });
}, { 
  threshold: 0.3,
  rootMargin: "0px 0px 200px 0px" 
});

const observer50x = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target); 
    }
  });
}, { 
  threshold: 0.5,
  rootMargin: "0px 0px 0px 0px" 
});

document.querySelectorAll('.js-scroll-right50x').forEach(el => observer50x.observe(el));
document.querySelectorAll('.js-scroll-right50').forEach(el => observer50.observe(el));
document.querySelectorAll('.js-scroll-right20').forEach(el => observer.observe(el));
