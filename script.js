
// Settings / UI interactions
const settingsBtn = document.getElementById("settings-btn");
const popup = document.getElementById("settings-popup");
const colorBtns = document.querySelectorAll(".color-btn");
const toggleBtn = document.getElementById("theme-toggle");
const body = document.body;

// darken helper
function darkenColor(hex, percent) {
  let num = parseInt(hex.slice(1), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = (num >> 8 & 0x00FF) + amt,
    B = (num & 0x0000FF) + amt;

  R = Math.max(0, Math.min(255, R));
  G = Math.max(0, Math.min(255, G));
  B = Math.max(0, Math.min(255, B));

  return "#" + (R << 16 | G << 8 | B).toString(16).padStart(6, "0");
}

// Update scrollbar color (webkit + firefox)
function updateScrollbarColor(accent) {
  // Webkit
  const style = document.createElement("style");
  style.id = "scrollbar-color";
  style.innerHTML = `
    ::-webkit-scrollbar-thumb { background-color: ${accent}; }
  `;
  const existing = document.getElementById("scrollbar-color");
  if (existing) existing.remove();
  document.head.appendChild(style);

  // Firefox
  document.documentElement.style.scrollbarColor = `${accent} #111`;
}

// Load saved preferences
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "dark";
  const savedColor = localStorage.getItem("accent") || getComputedStyle(document.documentElement).getPropertyValue("--accent") || "#007bff";

  if (savedTheme === "dark") body.classList.add("dark");
  else body.classList.remove("dark");

  if (savedColor) {
    document.documentElement.style.setProperty("--accent", savedColor);
    document.documentElement.style.setProperty("--accent-dark", darkenColor(savedColor, -20));
    updateScrollbarColor(savedColor);
  }
});

// Toggle settings popup
if (settingsBtn) settingsBtn.addEventListener("click", () => {
  if (popup) popup.classList.toggle("hidden");
});

// Accent color change
colorBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const color = btn.getAttribute("data-color");
    document.documentElement.style.setProperty("--accent", color);
    document.documentElement.style.setProperty("--accent-dark", darkenColor(color, -20));
    localStorage.setItem("accent", color);
    updateScrollbarColor(color);
  });
});

// Dark/Light toggle
if (toggleBtn) toggleBtn.addEventListener("click", () => {
  body.classList.toggle("dark");
  localStorage.setItem("theme", body.classList.contains("dark") ? "dark" : "light");
});

// Typing effect
const roles = [
  "Developer",
  "Programmer",
  "Designer",
  "Innovator",
  "Thinker"
];

const typingElement = document.querySelector(".typing-text");
let roleIndex = 0, charIndex = 0, isDeleting = false;

function typeEffect() {
  if (!typingElement) return;
  const currentRole = roles[roleIndex];
  if (!isDeleting) {
    typingElement.textContent = currentRole.substring(0, charIndex + 1);
    charIndex++;
  } else {
    typingElement.textContent = currentRole.substring(0, charIndex - 1);
    charIndex--;
  }
  if (!isDeleting && charIndex === currentRole.length) {
    isDeleting = true;
    setTimeout(typeEffect, 1500);
    return;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
  }
  const speed = isDeleting ? 70 : 100;
  setTimeout(typeEffect, speed);
}
typeEffect();

// Menu toggle
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
if (menuBtn && navLinks) menuBtn.addEventListener("click", () => navLinks.classList.toggle("active"));

// PARALLAX + BULK REPEL
const parallaxItems = document.querySelectorAll(".parallax-item");
let mouseX = null, mouseY = null;
let scrollTop = 0;

const repelRadius = 289;
const repelForceFactor = 0.08;


window.addEventListener("scroll", () => {
  scrollTop = window.scrollY;
  updateParallaxItems();
});

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  updateParallaxItems();
});

function updateParallaxItems() {
  const docHeight = Math.max(1, document.body.scrollHeight - window.innerHeight);
  const scrollProgress = scrollTop / docHeight;

  parallaxItems.forEach((item) => {
    const itemTop = parseFloat(item.style.top) || 0;

    let speedFactor = window.innerWidth < 768 ? 0.15 : 0.25;
    let baseY = itemTop < 50 ? scrollTop * speedFactor : scrollTop * (speedFactor + 0.1);
    let rotation = scrollTop * 0.05;
    let opacity = itemTop < 50 ? 0.9 - scrollProgress : 0.8 - scrollProgress;
    opacity = Math.max(opacity, 0);

    let offsetX = 0, offsetY = 0;
    if (mouseX !== null && mouseY !== null) {
      const rect = item.getBoundingClientRect();
      const itemX = rect.left + rect.width / 2;
      const itemY = rect.top + rect.height / 2;
      const dx = mouseX - itemX;
      const dy = mouseY - itemY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < repelRadius) {
        const angle = Math.atan2(dy, dx);
        const repelForce = (repelRadius - distance) * repelForceFactor;
        offsetX = -Math.cos(angle) * repelForce;
        offsetY = -Math.sin(angle) * repelForce;
      }
    }

    item.style.transform = `translate(${offsetX}px, ${baseY + offsetY}px) rotate(${rotation}deg)`;
    item.style.opacity = opacity;
  });
}

// Panels & popup
const panels = document.querySelectorAll(".panel");
const aboutSection = document.getElementById("about");
const popupCard = document.getElementById("popup-card");
const popupTitle = document.getElementById("popup-title");
const popupText = document.getElementById("popup-text");
const closeBtn = document.getElementById("close-btn");

let activePanel = null;

function updatePanelVisibility() {
  if (!aboutSection) return;
  const sectionRect = aboutSection.getBoundingClientRect();
  const sectionCenter = sectionRect.top + sectionRect.height / 2;
  const windowCenter = window.innerHeight / 2;

  const distance = Math.abs(sectionCenter - windowCenter);
  const maxDistance = window.innerHeight / 2 + sectionRect.height / 2;
  let progress = 1 - distance / maxDistance;
  progress = Math.max(0, Math.min(1, progress));

  panels.forEach((panel, index) => {
    if (panel === activePanel) return;
    const stagger = index * 0.1;
    const panelProgress = Math.max(0, Math.min(1, (progress - stagger) / (1 - stagger)));

    panel.style.opacity = panelProgress;
    panel.style.transform = `translateY(${50 * (1 - panelProgress)}px)`;
  });
}

window.addEventListener("scroll", updatePanelVisibility);
window.addEventListener("load", updatePanelVisibility);


function closePopup() {
  if (!popupCard) return;
  popupCard.classList.remove("show");
  activePanel = null;
  updatePanelVisibility();
}

if (closeBtn) closeBtn.addEventListener("click", closePopup);
if (popupCard) popupCard.addEventListener("click", (e) => { if (e.target === popupCard) closePopup(); });

const timelines = {
  "Experience": [
    { title: "Voice Assistant", date: "2022",content: "Created a Voice Assistant on Python" },
    { title: "Full Stack Developement", date: "2023",content: "HTML5, CSS/Tailwind CSS, Javascript, MERNStack" },
    {title:"My own Programming language: Can",date: "2025",content:"Created my Own non industrial programming language, interpreter designed over python"},
    {title:"Main Stream Programming",date: "Till Date",content:"Python, Java, Javascript, C, C++, Php"},
    {title:"Started my own Coding club: \"Logiclly\"", date:"Sept 2025", content:"Launched my own coding club in my university ISC BHU,"}
  ],
  "Education": [
    { title: "Highschool completed", date: "2023", content: "Sunbeam BGN Varanasi" },
    {title: "Interschool completed", date: "2025", content: "Sunbeam BGN Varanasi"},
    { title: "BSc Computer science", date: "2025-2029", content: "Banaras Hindu University, Varanasi" },
    {title: "Self Taught Programmer", date: "2018-onwards", content: "Started my Programming career"}
  ]
};

panels.forEach(panel => {
  panel.addEventListener("click", () => {
    activePanel = panel;
    const title = panel.getAttribute("data-title");
    const content = panel.getAttribute("data-content");
    popupTitle.textContent = title;

    const popupImageArea = document.getElementById("popup-image-area");
    const popupImage = document.getElementById("popup-image");
    const popupTextArea = document.getElementById("popup-text-area");

    if(title === "Know Me") {
      if (popupImage) popupImage.src = "ima.png";
      if (popupImageArea) popupImageArea.style.display = "flex";
      if (popupTextArea) {
        popupTextArea.style.textAlign = "center";
        popupTextArea.innerHTML = `<h2> About Me </h2><p>${content}</p>`;
      }
    } else {
      if (popupImageArea) popupImageArea.style.display = "none";
      if (popupTextArea) {
        popupTextArea.style.textAlign = "left";
        const timelineData = timelines[title] || [];
        let timelineHTML = `<div class="timeline">`;
        timelineData.forEach(item => {
          timelineHTML += `<div class="timeline-item"><h4>${item.title} <span style="color: var(--accent);">(${item.date})</span></h4><p>${item.content}</p></div>`;
        });
        timelineHTML += `</div>`;
        popupTextArea.innerHTML = timelineHTML;
      }
    }

    if (popupCard) popupCard.classList.add("show");
  });
});

// Category buttons (skills filtering)
document.querySelectorAll(".category-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const category = btn.dataset.category;
    document.querySelectorAll(".skill-card").forEach(card => {
      if (category === "all" || card.dataset.category === category) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
});

// Skills scroll effect
window.addEventListener("scroll", () => {
  const section = document.querySelector(".skills-section");
  const cards = document.querySelectorAll(".skill-card");
  if (!section) return;
  const rect = section.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  const progress = (windowHeight/2 - rect.top) / windowHeight;
  cards.forEach((card, i) => {
    const depth = (i % 2 === 0 ? 20 : -20);
    const moveY = progress * depth;
    card.style.transform = `translateY(${moveY}px) scale(1)`;
  });
});

// Contact form submission (simple client-side post)
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      message: e.target.message.value,
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      alert(data.msg || "Message sent!");
      contactForm.reset();
    } catch (err) {
      alert("Failed to send message. (No backend configured)")
    }
  });
}

// Small lift on hover for skill-cards
document.querySelectorAll(".skill-card").forEach(card => {
  card.addEventListener("mouseenter", () => {
    card.style.transform += " scale(1.05)";
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = card.style.transform.replace(" scale(1.05)", "");
  });
});
document.querySelectorAll("section").forEach(sec => {
  const obs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) sec.classList.add("visible");
  }, { threshold: 0.15 });
  obs.observe(sec);
});
