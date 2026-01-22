let recipientsData = [];
const $ = id => document.getElementById(id);

async function init() {
    try {
        const response = await fetch('data/data.json');
        recipientsData = await response.json();
        const directId = new URLSearchParams(window.location.search).get('id');
        (directId && recipientsData.find(s => s.id === directId)) ? showDirectProfileOnly(directId) : showGalleryOnly();
    } catch (e) { console.error("Data Load Error", e); }
}

const openModal = src => {
    if ($('imageModal') && $('modalImg')) {
        $('imageModal').style.display = "flex";
        $('modalImg').src = src;
    }
};

const closeModal = () => { if ($('imageModal')) $('imageModal').style.display = "none"; };

document.addEventListener('DOMContentLoaded', () => {
    if ($('imageModal')) $('imageModal').onclick = closeModal;
    if ($('copyright-year')) $('copyright-year').textContent = new Date().getFullYear();
});

document.addEventListener('keydown', e => e.key === "Escape" && closeModal());

const getBadgeHTML = pos => {
    const p = pos.toLowerCase();
    const type = p.includes("1st") ? "gold" : p.includes("2nd") ? "silver" : p.includes("3rd") ? "bronze" : null;
    return type ? `<div class="rank-badge ${type}-star">★</div>` : "";
};

function showGalleryOnly() {
    $('gallery-view').style.display = 'block';
    $('profile-view').style.display = 'none';
    renderCards(recipientsData);
    populateFilters();
}

function renderCards(data) {
    const container = $('recipients-container');
    if (!data.length) return container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 2rem;">No matching records found.</p>`;
    
    container.innerHTML = data.map(r => `
        <div class="recipient-card">
            <div class="img-container">
                <img src="${r.photo}" onerror="this.src='img/default.png'" onclick="openModal(this.src)">
                ${getBadgeHTML(r.position)}
            </div>
            <h4>${r.fName} ${r.oName} ${r.lName}</h4>
            <p><strong>${r.position}</strong></p>
            <p>Year: ${r.year} | Class: ${r.class}</p>
            <p>Score: <strong>${r.score}</strong></p>
        </div>`).join('');
}

const toggleScoreDetails = () => {
    const d = $('score-details');
    d.style.display = d.style.display === 'none' ? 'block' : 'none';
};

function showDirectProfileOnly(id) {
    const s = recipientsData.find(x => x.id === id);
    if (!s) return window.location.href = 'index.html';

    $('gallery-view').style.display = 'none';
    $('profile-view').style.display = 'block';
    
    const p = s.position.toLowerCase();
    const starColor = p.includes("1st") ? "#ffd700" : p.includes("2nd") ? "#c0c0c0" : p.includes("3rd") ? "#cd7f32" : "#ccc";
    const sub = s.details || { math:0, phys:0, chem:0, bio:0, eng:0 };

    $('profile-content').innerHTML = `
        <button onclick="window.location.href='index.html'" 
                style="margin-bottom:30px; padding:12px 24px; cursor:pointer; border:2px solid var(--primary); border-radius:6px; background:white; color:var(--primary); font-weight:bold; text-transform: uppercase; transition: 0.3s;"
                onmouseover="this.style.background='var(--primary)'; this.style.color='white';"
                onmouseout="this.style.background='white'; this.style.color='var(--primary)';"
        >GO TO LIST OF WINNERS</button><br>
        <img src="${s.photo}" class="passport-img" onclick="openModal(this.src)" onerror="this.src='img/default.png'">
        <h1 style="color:var(--primary); font-size:2.2rem; margin-bottom:5px;">${s.fName} ${s.oName} ${s.lName}</h1>
        <div style="font-size:1.5rem; margin-bottom:15px;">
            <span style="color:${starColor}">★</span> 
            <span style="font-weight:bold; color:var(--dark); font-size: 1.2rem;">${s.position} — ${s.year}</span>
        </div>
        <p><strong>Class:</strong> ${s.class} | <strong>Academic Score:</strong> ${s.score}</p>
        <p style="margin-top:10px;"><a href="javascript:void(0)" onclick="toggleScoreDetails()" style="color:var(--accent); font-size:0.9rem; text-decoration:none; border-bottom:1px dashed var(--accent);">View subject breakdown</a></p>
        
        <div id="score-details" style="display:none; background:#f9f9f9; padding:15px; border-radius:8px; margin: 15px auto; max-width:350px; border:1px solid #eee;">
            <table style="width:100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
                <thead><tr style="border-bottom: 2px solid #ddd;"><th style="padding: 8px; width: 37%;">Subject</th><th style="padding: 8px; text-align: left;">Weight</th><th style="padding: 8px; text-align: right;">Score</th></tr></thead>
                <tbody>
                    ${[['Mathematics','25%',sub.math],['Physics','25%',sub.phys],['Chemistry','25%',sub.chem],['Biology','15%',sub.bio],['English','10%',sub.eng]]
                        .map(row => `<tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">${row[0]}</td><td style="padding: 8px; text-align: left;">${row[1]}</td><td style="padding: 8px; text-align: right;"><strong>${row[2]}%</strong></td></tr>`).join('')}
                </tbody>
            </table>
        </div>

        <div class="thanks-box"><h3 style="color:var(--primary); margin-bottom:10px;">Vote of Thanks</h3><p>"${s.thanks}"</p></div>
        ${s.celebration_photo?.trim() ? `<div class="celebration-section"><h3 style="margin:2rem 0 1rem 0; color:var(--primary); border-top:1px solid #ddd; padding-top:2rem;">Award Ceremony</h3><img src="${s.celebration_photo}" class="celebration-img" onclick="openModal(this.src)" onerror="this.style.display='none'"></div>` : ''}
    `;
}

function populateFilters() {
    const [yS, pS] = [$('searchYear'), $('searchPosition')];
    if(!yS || !pS) return;

    const fill = (el, data, label) => el.innerHTML = `<option value="">All ${label}</option>` + data.map(v => `<option value="${v}">${v}</option>`).join('');

    fill(yS, [...new Set(recipientsData.map(r => r.year))].sort((a,b) => b-a), 'Years');
    fill(pS, [...new Set(recipientsData.map(r => r.position))].sort(), 'Positions');

    yS.onchange = pS.onchange = () => renderCards(recipientsData.filter(r => (!yS.value || r.year == yS.value) && (!pS.value || r.position == pS.value)));
    if($('resetBtn')) $('resetBtn').onclick = () => { yS.selectedIndex = pS.selectedIndex = 0; renderCards(recipientsData); };
}

init();