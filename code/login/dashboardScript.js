// ── AUTH ──
const admin = JSON.parse(sessionStorage.getItem('rc_admin') || 'null');
if (!admin) { window.location.href = 'login.html'; }
else {
  const email = admin.email || '';
  document.getElementById('admin-email-display').textContent = email;
  document.getElementById('admin-avatar').textContent = email[0].toUpperCase();
}
function logout() { sessionStorage.removeItem('rc_admin'); window.location.href = 'login.html'; }

// ── DATA ──
let vehicles = JSON.parse(localStorage.getItem('rc_vehicles') || 'null') || [
  { id:1, name:'Toyota Corolla', type:'Berline', city:'yaounde', price:15000, status:'dispo', notes:'Climatisée, 5 places' },
  { id:2, name:'RAV4 2010',      type:'SUV',     city:'douala',  price:25000, status:'loue',  notes:'4x4, 5 places' },
  { id:3, name:'RAV4 2012',      type:'SUV',     city:'yaounde', price:28000, status:'dispo', notes:'4x4, 5 places' },
  { id:4, name:'HiAce',          type:'Minibus', city:'douala',  price:35000, status:'loue',  notes:'15 places' },
  { id:5, name:'Hilux',          type:'Pick-up', city:'yaounde', price:30000, status:'maint', notes:'Double cabine' },
];

let reservations = JSON.parse(localStorage.getItem('rc_reservations') || 'null') || [
  { id:1, client:'Jean-Baptiste N.', vehicleId:2, days:5, date:'2024-06-03', amount:125000, status:'conf' },
  { id:2, client:'Adjoua Konan',     vehicleId:4, days:3, date:'2024-06-05', amount:105000, status:'conf' },
  { id:3, client:'Paul Mbarga',      vehicleId:1, days:2, date:'2024-06-07', amount:30000,  status:'pend' },
  { id:4, client:'Sophie Atangana',  vehicleId:3, days:4, date:'2024-06-08', amount:112000, status:'done' },
];

const revData = [
  {month:'Jan',val:320},{month:'Fév',val:410},{month:'Mar',val:380},
  {month:'Avr',val:445},{month:'Mai',val:430},{month:'Jun',val:485},
];

let nextVehicleId = vehicles.reduce((m,v)=>Math.max(m,v.id),0) + 1;
let nextResId     = reservations.reduce((m,r)=>Math.max(m,r.id),0) + 1;

function save() {
  localStorage.setItem('rc_vehicles', JSON.stringify(vehicles));
  localStorage.setItem('rc_reservations', JSON.stringify(reservations));
}

// ── HELPERS ──
const ICONS = {Berline:'🚗',SUV:'🚙',Minibus:'🚐','Pick-up':'🛻',Citadine:'🚗'};
function icon(type){ return ICONS[type] || '🚗'; }
function cityLabel(c){ return c==='yaounde'?'Yaoundé':'Douala'; }
function statusBadge(s){
  const m={dispo:'badge-dispo Disponible',loue:'badge-loue En location',maint:'badge-maint Maintenance',
           conf:'badge-conf Confirmée',pend:'badge-pend En attente',done:'badge-done Terminée'};
  const [cls,label]=(m[s]||'badge-done Inconnu').split(' ');
  return `<span class="badge ${cls}">${label}</span>`;
}
function fmtPrice(n){ return n.toLocaleString('fr-FR')+' FCFA'; }
function vehicleName(id){ const v=vehicles.find(x=>x.id===id); return v?v.name:'—'; }

// ── NAVIGATION ──
let currentSection = 'overview';
function goTo(section, el) {
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('sec-'+section).classList.add('active');
  if(el) el.classList.add('active');
  currentSection = section;
  const titles = {overview:'Vue d\'ensemble', fleet:'Gestion de la flotte', reservations:'Réservations'};
  document.getElementById('topbar-title').textContent = titles[section] || section;
  const addLabels = {overview:'Ajouter', fleet:'+ Véhicule', reservations:'+ Réservation'};
  document.getElementById('topbar-add-btn').textContent = '';
  document.getElementById('topbar-add-btn').innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:13px;height:13px;display:inline;vertical-align:middle;margin-right:4px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' + addLabels[section];
  renderAll();
}

function openAddModal(){
  if(currentSection==='fleet'||currentSection==='overview') openVehicleModal();
  else openResModal();
}

// ── FLEET ──
let fleetFilterText='', fleetFilterStatus='', fleetFilterCity='';
function filterFleet(v){fleetFilterText=v;renderFleetTable();}
function filterFleetStatus(v){fleetFilterStatus=v;renderFleetTable();}
function filterFleetCity(v){fleetFilterCity=v;renderFleetTable();}

function filteredVehicles(){
  return vehicles.filter(v=>{
    const matchText = !fleetFilterText || v.name.toLowerCase().includes(fleetFilterText.toLowerCase());
    const matchStatus = !fleetFilterStatus || v.status===fleetFilterStatus;
    const matchCity = !fleetFilterCity || v.city===fleetFilterCity;
    return matchText && matchStatus && matchCity;
  });
}

function renderFleetTable(){
  const list = filteredVehicles();
  const tbody = document.getElementById('fleet-tbody');
  if(!list.length){ tbody.innerHTML=`<tr><td colspan="6"><div class="empty-state">Aucun véhicule trouvé.</div></td></tr>`; return; }
  tbody.innerHTML = list.map(v=>`
    <tr>
      <td><span class="cell-icon">${icon(v.type)}</span><span class="cell-name">${v.name}</span></td>
      <td style="color:var(--text2)">${v.type}</td>
      <td style="color:var(--text2)">${cityLabel(v.city)}</td>
      <td>${statusBadge(v.status)}</td>
      <td style="font-weight:500">${fmtPrice(v.price)}</td>
      <td>
        <div class="row-actions">
          <button class="btn-icon" title="Modifier" onclick="editVehicle(${v.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon danger" title="Supprimer" onclick="deleteItem('vehicle',${v.id},'${v.name}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

// ── RESERVATIONS ──
let resFilterText='', resFilterStatus='';
function filterRes(v){resFilterText=v;renderResTable();}
function filterResStatus(v){resFilterStatus=v;renderResTable();}

function filteredRes(){
  return reservations.filter(r=>{
    const matchText = !resFilterText || r.client.toLowerCase().includes(resFilterText.toLowerCase()) || vehicleName(r.vehicleId).toLowerCase().includes(resFilterText.toLowerCase());
    const matchStatus = !resFilterStatus || r.status===resFilterStatus;
    return matchText && matchStatus;
  });
}

function renderResTable(){
  const list = filteredRes();
  const tbody = document.getElementById('res-tbody');
  if(!list.length){ tbody.innerHTML=`<tr><td colspan="7"><div class="empty-state">Aucune réservation trouvée.</div></td></tr>`; return; }
  tbody.innerHTML = list.map(r=>`
    <tr>
      <td class="cell-name">${r.client}</td>
      <td style="color:var(--text2)">${vehicleName(r.vehicleId)}</td>
      <td style="color:var(--text2)">${r.days} jour${r.days>1?'s':''}</td>
      <td style="color:var(--text2)">${r.date}</td>
      <td style="font-weight:500">${fmtPrice(r.amount)}</td>
      <td>${statusBadge(r.status)}</td>
      <td>
        <div class="row-actions">
          <button class="btn-icon" title="Modifier" onclick="editRes(${r.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon danger" title="Supprimer" onclick="deleteItem('reservation',${r.id},'${r.client}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

// ── OVERVIEW ──
function renderOverview(){
  const loues = vehicles.filter(v=>v.status==='loue').length;
  const dispo = vehicles.filter(v=>v.status==='dispo').length;
  const pct = vehicles.length ? Math.round(loues/vehicles.length*100) : 0;
  document.getElementById('ov-fleet').textContent = vehicles.length;
  document.getElementById('ov-dispo').textContent = dispo + ' disponible'+(dispo!==1?'s':'');
  document.getElementById('ov-loues').textContent = loues;
  document.getElementById('ov-pct').textContent = pct+'% de la flotte';
  document.getElementById('ov-res').textContent = reservations.length;
  document.getElementById('nb-fleet').textContent = vehicles.length;
  document.getElementById('nb-res').textContent = reservations.length;

  // Recent res
  const colors=['#378ADD','#1D9E75','#BA7517','#7F77DD','#E24B4A'];
  document.getElementById('ov-res-list').innerHTML = reservations.slice(0,4).map((r,i)=>`
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:8px;height:8px;border-radius:50%;background:${colors[i%colors.length]};flex-shrink:0;"></div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;font-weight:500;">${r.client}</div>
        <div style="font-size:11px;color:var(--text3);">${vehicleName(r.vehicleId)} • ${r.days}j</div>
      </div>
      <div style="font-size:12px;font-weight:500;">${fmtPrice(r.amount)}</div>
    </div>`).join('') || '<div style="font-size:13px;color:var(--text3);">Aucune réservation.</div>';

  // Fleet list
  document.getElementById('ov-fleet-list').innerHTML = vehicles.slice(0,5).map(v=>`
    <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;border:1px solid var(--border);">
      <span style="font-size:18px;">${icon(v.type)}</span>
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;font-weight:500;">${v.name}</div>
        <div style="font-size:11px;color:var(--text3);">${v.type} • ${cityLabel(v.city)}</div>
      </div>
      ${statusBadge(v.status)}
      <div style="font-size:12px;color:var(--text2);">${fmtPrice(v.price)}/j</div>
    </div>`).join('');

  // Chart
  const max = Math.max(...revData.map(d=>d.val));
  document.getElementById('ov-chart').innerHTML = revData.map((d,i)=>{
    const h = Math.round((d.val/max)*100);
    const isLast = i===revData.length-1;
    return `<div class="chart-col">
      <div class="chart-val">${d.val}</div>
      <div class="chart-bar" style="height:${h}px;background:${isLast?'var(--gold)':'var(--dark4)'};" title="${d.val}K FCFA"></div>
      <div class="chart-month">${d.month}</div>
    </div>`;
  }).join('');
}

// ── VEHICLE MODAL ──
let editVehicleId = null;
function openVehicleModal(v=null){
  editVehicleId = v ? v.id : null;
  document.getElementById('fleet-modal-title').textContent = v ? 'Modifier le véhicule' : 'Ajouter un véhicule';
  document.getElementById('f-name').value  = v ? v.name  : '';
  document.getElementById('f-type').value  = v ? v.type  : 'Berline';
  document.getElementById('f-city').value  = v ? v.city  : 'yaounde';
  document.getElementById('f-price').value = v ? v.price : '';
  document.getElementById('f-status').value= v ? v.status: 'dispo';
  document.getElementById('f-notes').value = v ? (v.notes||'') : '';
  openModal('modal-fleet');
}
function editVehicle(id){ openVehicleModal(vehicles.find(v=>v.id===id)); }

function saveVehicle(){
  const name  = document.getElementById('f-name').value.trim();
  const type  = document.getElementById('f-type').value;
  const city  = document.getElementById('f-city').value;
  const price = parseInt(document.getElementById('f-price').value) || 0;
  const status= document.getElementById('f-status').value;
  const notes = document.getElementById('f-notes').value.trim();
  if(!name || !price){ alert('Veuillez renseigner le nom et le prix.'); return; }
  if(editVehicleId){
    const idx = vehicles.findIndex(v=>v.id===editVehicleId);
    vehicles[idx] = {...vehicles[idx], name, type, city, price, status, notes};
  } else {
    vehicles.push({ id: nextVehicleId++, name, type, city, price, status, notes });
  }
  save(); closeModal('modal-fleet'); renderAll();
}

// ── RESERVATION MODAL ──
let editResId = null;
function openResModal(r=null){
  editResId = r ? r.id : null;
  document.getElementById('res-modal-title').textContent = r ? 'Modifier la réservation' : 'Nouvelle réservation';
  // Populate vehicle select
  const sel = document.getElementById('r-vehicle');
  sel.innerHTML = vehicles.map(v=>`<option value="${v.id}" ${r&&r.vehicleId===v.id?'selected':''}>${v.name}</option>`).join('');
  document.getElementById('r-client').value = r ? r.client : '';
  document.getElementById('r-date').value   = r ? r.date   : new Date().toISOString().split('T')[0];
  document.getElementById('r-days').value   = r ? r.days   : 1;
  document.getElementById('r-status').value = r ? r.status : 'conf';
  document.getElementById('r-amount').value = r ? r.amount : '';
  // Auto-calc amount on change
  ['r-vehicle','r-days'].forEach(id=>{
    document.getElementById(id).addEventListener('change', autoCalc);
    document.getElementById(id).addEventListener('input', autoCalc);
  });
  openModal('modal-res');
}
function autoCalc(){
  const vid   = parseInt(document.getElementById('r-vehicle').value);
  const days  = parseInt(document.getElementById('r-days').value) || 1;
  const veh   = vehicles.find(v=>v.id===vid);
  if(veh) document.getElementById('r-amount').value = veh.price * days;
}
function editRes(id){ openResModal(reservations.find(r=>r.id===id)); }

function saveReservation(){
  const client    = document.getElementById('r-client').value.trim();
  const vehicleId = parseInt(document.getElementById('r-vehicle').value);
  const date      = document.getElementById('r-date').value;
  const days      = parseInt(document.getElementById('r-days').value) || 1;
  const status    = document.getElementById('r-status').value;
  const amount    = parseInt(document.getElementById('r-amount').value) || 0;
  if(!client){ alert('Veuillez renseigner le client.'); return; }
  if(editResId){
    const idx = reservations.findIndex(r=>r.id===editResId);
    reservations[idx] = {...reservations[idx], client, vehicleId, date, days, status, amount};
  } else {
    reservations.push({ id: nextResId++, client, vehicleId, date, days, status, amount });
  }
  save(); closeModal('modal-res'); renderAll();
}

// ── DELETE ──
let deleteType=null, deleteId=null;
function deleteItem(type, id, name){
  deleteType=type; deleteId=id;
  document.getElementById('delete-msg').textContent = `Supprimer "${name}" ? Cette action est irréversible.`;
  openModal('modal-delete');
}
function confirmDelete(){
  if(deleteType==='vehicle'){
    vehicles = vehicles.filter(v=>v.id!==deleteId);
    reservations = reservations.filter(r=>r.vehicleId!==deleteId);
  } else {
    reservations = reservations.filter(r=>r.id!==deleteId);
  }
  save(); closeModal('modal-delete'); renderAll();
}

// ── MODALS ──
function openModal(id){ document.getElementById(id).classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }

// ── RENDER ALL ──
function renderAll(){
  renderOverview();
  renderFleetTable();
  renderResTable();
}

// Init
renderAll();