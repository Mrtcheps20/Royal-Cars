const TG_TOKEN   = "8653122517:AAHS6qBP3KqyhIWQ-o_EBrFnDFe0ZVe9lbI";
const TG_CHAT_ID = "8424377018";
const BIN_ID     = "6a029d8ec0954111d80dd633";
const BIN_KEY    = "$2a$10$qRJj8f3Qhvt8BLbQgJYbe.QZlz05FcgmJg5/lWq1ox02PXdtbfvVO";
const BIN_URL    = "https://api.jsonbin.io/v3/b/" + BIN_ID;
const BIN_HEAD   = { "Content-Type": "application/json", "X-Master-Key": BIN_KEY };

function sendTelegram(text) {
  fetch("https://api.telegram.org/bot" + TG_TOKEN + "/sendMessage", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: "HTML" })
  }).catch(() => {});
}

function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn  = form.querySelector(".btn-submit");
  btn.textContent = "Envoi en cours...";
  btn.disabled = true;

  const nom      = form.querySelector('input[type="text"]').value || "Non renseigné";
  const tel      = form.querySelector('input[type="tel"]').value  || "Non renseigné";
  const dates    = form.querySelectorAll('input[type="date"]');
  const debut    = dates[0].value || "Non renseignée";
  const fin      = dates[1].value || "Non renseignée";
  const vehicule = form.querySelector("select").value || "Non renseigné";
  const lieu     = form.querySelectorAll('input[type="text"]')[1]?.value || "Non renseigné";
  const message  = form.querySelector("textarea").value || "Aucun";

  sendTelegram("🚗 <b>NOUVELLE RÉSERVATION – Royal Cars</b>\n━━━━━━━━━━━━━━━━━━\n👤 Client : " + nom + "\n📱 Téléphone : " + tel + "\n━━━━━━━━━━━━━━━━━━\n📅 Début : " + debut + "\n📅 Fin : " + fin + "\n🚘 Véhicule : " + vehicule + "\n📍 Livraison : " + lieu + "\n💬 Message : " + message + "\n━━━━━━━━━━━━━━━━━━\n🌐 Via royalcars.netlify.app");

  const wa_msg = encodeURIComponent("🚗 *NOUVELLE RÉSERVATION – Royal Cars*\n━━━━━━━━━━━━━━━━━━━━\n👤 *Client :* " + nom + "\n📱 *Téléphone :* " + tel + "\n━━━━━━━━━━━━━━━━━━━━\n📅 *Date de début :* " + debut + "\n📅 *Date de fin :* " + fin + "\n🚘 *Véhicule souhaité :* " + vehicule + "\n📍 *Lieu de livraison :* " + lieu + "\n━━━━━━━━━━━━━━━━━━━━\n💬 *Message :* " + message + "\n━━━━━━━━━━━━━━━━━━━━\n_Envoyé depuis royalcars.netlify.app_");
  fetch("/", { method: "POST", body: new FormData(form) }).catch(() => {});
  setTimeout(() => window.open("https://wa.me/237697109066?text=" + wa_msg, "_blank"), 300);

  form.innerHTML = `<div style="text-align:center;padding:3rem 1rem;">
    <div style="font-size:3.5rem;margin-bottom:1rem;">✅</div>
    <h3 style="font-family:Fraunces,serif;color:var(--cream);font-size:1.6rem;margin-bottom:1rem;">Demande envoyée !</h3>
    <p style="color:rgba(244,239,230,0.6);font-size:0.95rem;line-height:1.9;margin-bottom:1.5rem;">
      Merci <strong style="color:var(--gold)">${nom.split(' ')[0]}</strong> !<br>
      Nous vous confirmons sous <strong style="color:var(--gold)">30 minutes</strong>.</p>
    <a href="https://wa.me/237697109066" target="_blank"
       style="display:inline-block;background:#25D366;color:#fff;padding:0.8rem 1.8rem;border-radius:10px;text-decoration:none;font-weight:700;font-family:'DM Sans',sans-serif;">
      💬 Suivre sur WhatsApp</a></div>`;
}

let allReviews = [];
const defaultReviews = [
  { name:"Jean-Claude Nkomo", vehicle:"Toyota Camry",           rating:4, comment:"Service impeccable ! La voiture était propre, livrée à l'heure.", initials:"JN", color:"#1B3A6B" },
  { name:"Aminata Fofana",    vehicle:"Toyota RAV4 2014 blanc", rating:5, comment:"Réservation facile via WhatsApp, paiement par Orange Money sans problème.", initials:"AF", color:"#1B5E8B" },
  { name:"Emmanuel Bikele",   vehicle:"Toyota RAV4 2012 Grise", rating:5, comment:"J'ai loué un SUV pour 2 semaines. Prix honnête, assistance disponible.", initials:"EB", color:"#C9A96E" },
];

async function loadReviews() {
  try {
    const res  = await fetch(BIN_URL + "/latest", { headers: { "X-Master-Key": BIN_KEY } });
    const data = await res.json();
    allReviews = data.record.reviews || [];
  } catch(e) { allReviews = []; }
  updateRatingSummary();
  renderDynamicReviews();
}

async function saveReviews() {
  await fetch(BIN_URL, { method:"PUT", headers:BIN_HEAD, body:JSON.stringify({ reviews: allReviews }) });
}

function startAutoRefresh() {
  setInterval(async () => {
    const oldCount = allReviews.length;
    await loadReviews();
    if (allReviews.length > oldCount) {
      const badge = document.getElementById("newReviewBadge");
      if (badge) { badge.style.display = "inline-block"; setTimeout(() => badge.style.display = "none", 4000); }
    }
  }, 30000);
}

function setStatus(ok) {
  const el = document.getElementById("syncStatus");
  if (el) { el.textContent = ok ? "🟢 Synchronisé" : "🔴 Hors ligne"; el.style.color = ok ? "#1a9e50" : "#c0392b"; }
}

function starsHTML(n) { return "★".repeat(n) + "☆".repeat(5-n); }
function getInitials(name) { return name.trim().split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2); }
function randomColor() { return ["#1B3A6B","#1B5E8B","#C9A96E","#0D6B4B","#6B2D0D"][Math.floor(Math.random()*5)]; }

function updateRatingSummary() {
  const all = [...defaultReviews, ...allReviews];
  const total = all.length;
  const avg = total ? (all.reduce((s,r) => s+r.rating, 0) / total) : 0;
  document.getElementById("ratingBig").textContent      = avg.toFixed(1);
  document.getElementById("ratingStarsBig").textContent = starsHTML(Math.round(avg));
  document.getElementById("ratingCount").textContent    = "sur " + total + " avis";
  const counts = [5,4,3,2,1].map(s => ({ s, c: all.filter(r=>r.rating===s).length }));
  document.getElementById("ratingBars").innerHTML = counts.map(({s,c}) => {
    const pct = total ? Math.round(c/total*100) : 0;
    return `<div class="rating-bar-row"><span>${s}★</span><div class="rating-bar-track"><div class="rating-bar-fill" style="width:${pct}%"></div></div><span>${c}</span></div>`;
  }).join("");
}

function renderDynamicReviews() {
  const grid = document.getElementById("reviewsGrid");
  grid.querySelectorAll(".dynamic-review").forEach(el => el.remove());
  allReviews.slice().reverse().forEach(r => {
    const card = document.createElement("div");
    card.className = "temo-card dynamic-review";
    const ct = r.color === "#C9A96E" ? "#0D1F3C" : "#fff";
    card.innerHTML = `<div class="temo-stars">${starsHTML(r.rating)}</div>
      <p class="temo-text">"${r.comment}"</p>
      <div class="temo-author">
        <div class="temo-avatar" style="background:${r.color};color:${ct};">${r.initials}</div>
        <div><div class="temo-name">${r.name}</div><div class="temo-city">${r.vehicle||"Royal Cars"}${r.date?" · "+r.date:""}</div></div>
      </div>`;
    grid.appendChild(card);
  });
  setStatus(true);
}

let selectedRating = 0;
document.addEventListener("DOMContentLoaded", async () => {
  document.querySelectorAll(".star-pick").forEach(star => {
    star.addEventListener("mouseenter", () => {
      const v = +star.dataset.val;
      document.querySelectorAll(".star-pick").forEach(s => s.classList.toggle("active", +s.dataset.val <= v));
    });
    star.addEventListener("mouseleave", () => {
      document.querySelectorAll(".star-pick").forEach(s => s.classList.toggle("active", +s.dataset.val <= selectedRating));
    });
    star.addEventListener("click", () => {
      selectedRating = +star.dataset.val;
      document.getElementById("reviewRating").value = selectedRating;
      document.querySelectorAll(".star-pick").forEach(s => s.classList.toggle("active", +s.dataset.val <= selectedRating));
    });
  });
  await loadReviews();
  startAutoRefresh();
  initFleetCards();
});

async function submitReview() {
  const name    = document.getElementById("reviewName").value.trim();
  const vehicle = document.getElementById("reviewVehicle").value;
  const rating  = +document.getElementById("reviewRating").value;
  const comment = document.getElementById("reviewComment").value.trim();
  if (!name)    { alert("Veuillez entrer votre nom."); return; }
  if (!rating)  { alert("Veuillez sélectionner une note."); return; }
  if (!comment) { alert("Veuillez écrire un commentaire."); return; }

  const btn = document.querySelector(".btn-review-submit");
  btn.textContent = "Publication en cours..."; btn.disabled = true;

  const review = { name, vehicle, rating, comment, initials:getInitials(name), color:randomColor(), date:new Date().toLocaleDateString("fr-FR") };
  allReviews.push(review);
  try { await saveReviews(); setStatus(true); } catch(e) { setStatus(false); }
  updateRatingSummary();
  renderDynamicReviews();

  sendTelegram("💬 <b>NOUVEL AVIS CLIENT – Royal Cars</b>\n━━━━━━━━━━━━━━━━━━\n👤 " + name + "\n🚘 Véhicule : " + (vehicle||"Non précisé") + "\n⭐ Note : " + "⭐".repeat(rating) + " (" + rating + "/5)\n📝 Avis : " + comment + "\n━━━━━━━━━━━━━━━━━━\n🌐 royalcars.netlify.app#avis");

  document.getElementById("reviewName").value = "";
  document.getElementById("reviewVehicle").value = "";
  document.getElementById("reviewRating").value = "0";
  document.getElementById("reviewComment").value = "";
  selectedRating = 0;
  document.querySelectorAll(".star-pick").forEach(s => s.classList.remove("active"));
  btn.textContent = "✅ Avis publié !";
  setTimeout(() => { btn.textContent = "Publier mon avis →"; btn.disabled = false; }, 3000);
  document.getElementById("reviewsGrid").scrollIntoView({ behavior:"smooth", block:"nearest" });
}

const vehicleData = {
  "Auris 2008 grise":        { specs:[{icon:"📅",label:"Année",value:"2008"},{icon:"⛽",label:"Carburant",value:"Essence"},{icon:"⚙️",label:"Boîte",value:"Automatique"},{icon:"🛡️",label:"Assurance",value:"Incluse"}], derniereLocation:"3 mai 2025",  totalLocations:28, clientsDistincts:18, noteMoyenne:"4.8 ★" },
  "Mercedes classe E 2017":  { specs:[{icon:"📅",label:"Année",value:"2017"},{icon:"⛽",label:"Carburant",value:"Diesel"},{icon:"⚙️",label:"Boîte",value:"Automatique"},{icon:"🚀",label:"Transmission",value:"4Matic"}], derniereLocation:"8 mai 2025",  totalLocations:14, clientsDistincts:10, noteMoyenne:"5.0 ★" },
  "Toyota Camry 2014 rouge": { specs:[{icon:"📅",label:"Année",value:"2014"},{icon:"⛽",label:"Carburant",value:"Essence"},{icon:"⚙️",label:"Boîte",value:"Automatique"},{icon:"🎨",label:"Couleur",value:"Rouge"}],  derniereLocation:"5 mai 2025",  totalLocations:22, clientsDistincts:15, noteMoyenne:"4.9 ★" },
  "Avensis 2008":            { specs:[{icon:"📅",label:"Année",value:"2008"},{icon:"⛽",label:"Carburant",value:"Essence"},{icon:"⚙️",label:"Boîte",value:"Automatique"},{icon:"🎨",label:"Couleur",value:"Grise"}],  derniereLocation:"17 mai 2025",  totalLocations:32, clientsDistincts:15, noteMoyenne:"4.9 ★" },
  "Toyota Camry 2014 grise": { specs:[{icon:"📅",label:"Année",value:"2014"},{icon:"⛽",label:"Carburant",value:"Essence"},{icon:"⚙️",label:"Boîte",value:"Automatique"},{icon:"🎨",label:"Couleur",value:"Grise"}],  derniereLocation:"1 mai 2025",  totalLocations:19, clientsDistincts:13, noteMoyenne:"4.8 ★" },
  "Toyota Rav4 2014 blanc":  { specs:[{icon:"📅",label:"Année",value:"2014"},{icon:"⛽",label:"Carburant",value:"Essence"},{icon:"⚙️",label:"Boîte",value:"Automatique"},{icon:"🏔️",label:"Terrain",value:"Tout-terrain"}], derniereLocation:"10 mai 2025", totalLocations:31, clientsDistincts:20, noteMoyenne:"4.9 ★" },
  "Toyota Rav4 2010 Vert":   { specs:[{icon:"📅",label:"Année",value:"2010"},{icon:"⛽",label:"Carburant",value:"Essence"},{icon:"⚙️",label:"Boîte",value:"Automatique"},{icon:"🏔️",label:"Terrain",value:"Tout-terrain"}], derniereLocation:"29 avril 2025",totalLocations:17, clientsDistincts:11, noteMoyenne:"4.7 ★" },
  "Toyota Rav4 2012 Grise":  { specs:[{icon:"📅",label:"Année",value:"2012"},{icon:"⛽",label:"Carburant",value:"Essence"},{icon:"⚙️",label:"Boîte",value:"Automatique"},{icon:"🏔️",label:"Terrain",value:"Tout-terrain"}], derniereLocation:"7 mai 2025",  totalLocations:24, clientsDistincts:16, noteMoyenne:"4.8 ★" },
  "Toyota Hilux":            { specs:[{icon:"📅",label:"Année",value:"2015"},{icon:"⛽",label:"Carburant",value:"Essence"},{icon:"⚙️",label:"Boîte",value:"Automatique"},{icon:"🏔️",label:"Terrain",value:"Tout-terrain"}], derniereLocation:"17 mai 2025", totalLocations:17, clientsDistincts:7, noteMoyenne:"4.6 ★"},
};

function openVehicleModal(card) {
  const name     = card.dataset.name;
  const category = card.dataset.category;
  const price    = card.dataset.price;
  const imgSrc   = card.dataset.img;
  const chips    = JSON.parse(card.dataset.chips || "[]");
  const dispo    = card.dataset.dispo;
  const data     = vehicleData[name] || {};

  const imgSide     = document.getElementById("modalImgSide");
  const placeholder = document.getElementById("modalImgPlaceholder");
  const oldImg      = imgSide.querySelector("img");
  if (oldImg) oldImg.remove();
  placeholder.style.display = "flex";
  if (imgSrc) {
    const img = document.createElement("img");
    img.src = imgSrc; img.alt = name;
    img.onerror = () => { img.remove(); placeholder.style.display = "flex"; };
    img.onload  = () => { placeholder.style.display = "none"; };
    imgSide.insertBefore(img, placeholder);
  }

  const dispoBadge = document.getElementById("modalDispo");
  if (dispo === "indisponible") { dispoBadge.className = "modal-dispo indisponible"; dispoBadge.textContent = "🔴 Indisponible"; }
  else { dispoBadge.className = "modal-dispo disponible"; dispoBadge.textContent = "🟢 Disponible"; }

  document.getElementById("modalCategory").textContent = category;
  document.getElementById("modalName").textContent = name;
  document.getElementById("modalPrice").innerHTML = price + ' <small>FCFA / jour</small>';
  document.getElementById("modalChips").innerHTML = chips.map(c => `<span class="modal-chip">${c}</span>`).join("");
  document.getElementById("modalSpecs").innerHTML = (data.specs||[]).map(s =>
    `<div class="modal-spec-item"><span class="modal-spec-icon">${s.icon}</span><div><span class="modal-spec-label">${s.label}</span>${s.value}</div></div>`
  ).join("");
  document.getElementById("modalHistory").innerHTML = `
    <div class="modal-history-row"><span class="modal-history-key">📅 Dernière location</span><span class="modal-history-val">${data.derniereLocation||"—"}</span></div>
    <div class="modal-history-row"><span class="modal-history-key">🔢 Total locations</span><span class="modal-history-val">${data.totalLocations||"—"}</span></div>
    <div class="modal-history-row"><span class="modal-history-key">👥 Clients distincts</span><span class="modal-history-val">${data.clientsDistincts||"—"}</span></div>
    <div class="modal-history-row"><span class="modal-history-key">⭐ Note moyenne</span><span class="modal-history-val gold">${data.noteMoyenne||"—"}</span></div>`;

  const vehicleReviews = [...defaultReviews, ...allReviews].filter(r => r.vehicle && r.vehicle.toLowerCase().includes(name.toLowerCase().slice(0,8)));
  const revEl = document.getElementById("modalReviews");
  revEl.innerHTML = vehicleReviews.length === 0
    ? `<p class="modal-no-reviews">Aucun avis pour ce véhicule pour l'instant.</p>`
    : vehicleReviews.map(r => `<div class="modal-review-item"><div class="modal-review-stars">${starsHTML(r.rating)}</div><div class="modal-review-text">"${r.comment}"</div><div class="modal-review-author">— ${r.name}${r.date?" · "+r.date:""}</div></div>`).join("");

  const cta = document.getElementById("modalCta");
  cta.href = `https://wa.me/237697109066?text=${encodeURIComponent("Bonjour Royal Cars, je souhaite réserver : " + name + " (" + price + " FCFA/jour)")}`;
  cta.onclick = () => closeModal();

  document.getElementById("vehicleModal").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() { document.getElementById("vehicleModal").classList.remove("open"); document.body.style.overflow = ""; }
function closeModalOnBg(e) { if (e.target === document.getElementById("vehicleModal")) closeModal(); }
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

function initFleetCards() {
  document.querySelectorAll(".fleet-card").forEach(card => {
    card.dataset.name     = card.querySelector(".fleet-name")?.textContent.trim() || "";
    card.dataset.category = card.querySelector(".fleet-category")?.textContent.trim() || "";
    card.dataset.price    = (card.querySelector(".fleet-price")?.childNodes[0]?.nodeValue || "").trim();
    card.dataset.chips    = JSON.stringify([...card.querySelectorAll(".feat-chip")].map(c => c.textContent.trim()));
    card.dataset.img      = card.querySelector(".fleet-img img")?.src || "";
    card.dataset.dispo    = card.classList.contains("indisponible") ? "indisponible" : "disponible";
    card.style.cursor     = "pointer";
    card.addEventListener("click", e => { if (e.target.closest(".fleet-btn")) return; openVehicleModal(card); });
  });
}
