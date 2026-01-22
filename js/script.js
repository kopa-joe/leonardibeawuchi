let recipientsData = [];

async function init() {
    try {
        const response = await fetch('data/data.json');
        recipientsData = await response.json();
        
        const urlParams = new URLSearchParams(window.location.search);
        const directId = urlParams.get('id');

        if (directId) {
            const student = recipientsData.find(s => s.id === directId);
            if (student) {
                showDirectProfileOnly(directId);
                return; 
            }
        }
        showGalleryOnly();
    } catch (e) {
        console.error("Data Load Error", e);
    }
}

function openModal(src) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    if (modal && modalImg) {
        modal.style.display = "flex";
        modalImg.src = src;
    }
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    if (modal) modal.style.display = "none";
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('imageModal');
    if (modal) modal.onclick = closeModal;
    
    const yearElement = document.getElementById('copyright-year');
    if (yearElement) yearElement.textContent = new Date().getFullYear();
});

document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") closeModal();
});

function getBadgeHTML(position) {
    const pos = position.toLowerCase();
    if (pos.includes("1st")) return `<div class="rank-badge gold-star">★</div>`;
    if (pos.includes("2nd")) return `<div class="rank-badge silver-star">★</div>`;
    if (pos.includes("3rd")) return `<div class="rank-badge bronze-star">★</div>`;
    return "";
}

function showGalleryOnly() {
    document.getElementById('gallery-view').style.display = 'block';
    document.getElementById('profile-view').style.display = 'none';
    renderCards(recipientsData);
    populateFilters();
}

function renderCards(data) {
    const container = document.getElementById('recipients-container');
    container.innerHTML = "";

    if (data.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 2rem;">No matching records found.</p>`;
        return;
    }

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
        </div>
    `).join('');
}

function toggleScoreDetails() {
    const details = document.getElementById('score-details');
    details.style.display = details.style.display === 'none' ? 'block' : 'none';
}

function showDirectProfileOnly(id) {
    const s = recipientsData.find(x => x.id === id);
    if (!s) { 
        window.location.href = 'index.html'; 
        return; 
    }

    document.getElementById('gallery-view').style.display = 'none';
    document.getElementById('profile-view').style.display = 'block';
    
    let starColor = "#ccc";
    const pos = s.position.toLowerCase();
    if (pos.includes("1st")) starColor = "#ffd700";
    else if (pos.includes("2nd")) starColor = "#c0c0c0";
    else if (pos.includes("3rd")) starColor = "#cd7f32";

    let ceremonyHTML = "";
    if (s.celebration_photo && s.celebration_photo.trim() !== "") {
        ceremonyHTML = `
            <div class="celebration-section">
                <h3 style="margin:2rem 0 1rem 0; color:var(--primary); border-top:1px solid #ddd; padding-top:2rem;">Award Ceremony</h3>
                <img src="${s.celebration_photo}" class="celebration-img" onclick="openModal(this.src)" onerror="this.style.display='none'">
            </div>
        `;
    }

    const sub = s.details || { math:0, phys:0, chem:0, bio:0, eng:0 };

    document.getElementById('profile-content').innerHTML = `
        <button onclick="window.location.href='index.html'" 
                style="margin-bottom:30px; padding:12px 24px; cursor:pointer; border:2px solid var(--primary); 
                       border-radius:6px; background:white; color:var(--primary); font-weight:bold; 
                       text-transform: uppercase; transition: 0.3s;"
                onmouseover="this.style.background='var(--primary)'; this.style.color='white';"
                onmouseout="this.style.background='white'; this.style.color='var(--primary)';"
        >
            GO TO LIST OF WINNERS
        </button>
        <br>
        <img src="${s.photo}" class="passport-img" onclick="openModal(this.src)" onerror="this.src='img/default.png'">
        <h1 style="color:var(--primary); font-size:2.2rem; margin-bottom:5px;">${s.fName} ${s.oName} ${s.lName}</h1>
        <div style="font-size:1.5rem; margin-bottom:15px;">
            <span style="color:${starColor}">★</span> 
            <span style="font-weight:bold; color:var(--dark); font-size: 1.2rem;">${s.position} — ${s.year}</span>
        </div>
        <p><strong>Class:</strong> ${s.class} | <strong>Academic Score:</strong> ${s.score}</p>
        
        <p style="margin-top:10px;">
            <a href="javascript:void(0)" onclick="toggleScoreDetails()" style="color:var(--accent); font-size:0.9rem; text-decoration:none; border-bottom:1px dashed var(--accent);">View subject breakdown</a>
        </p>
        
        <div id="score-details" style="display:none; background:#f9f9f9; padding:15px; border-radius:8px; margin: 15px auto; max-width:350px; border:1px solid #eee;">
            <table style="width:100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
                <thead>
                    <tr style="border-bottom: 2px solid #ddd;">
                        <th style="padding: 8px; width: 37%;">Subject</th>
                        <th style="padding: 8px; text-align: left;">Weight</th>
                        <th style="padding: 8px; text-align: right;">Score</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 8px;">Mathematics</td>
                        <td style="padding: 8px; text-align: left;">25%</td>
                        <td style="padding: 8px; text-align: right;"><strong>${sub.math}%</strong></td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 8px;">Physics</td>
                        <td style="padding: 8px; text-align: left;">25%</td>
                        <td style="padding: 8px; text-align: right;"><strong>${sub.phys}%</strong></td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 8px;">Chemistry</td>
                        <td style="padding: 8px; text-align: left;">25%</td>
                        <td style="padding: 8px; text-align: right;"><strong>${sub.chem}%</strong></td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 8px;">Biology</td>
                        <td style="padding: 8px; text-align: left;">15%</td>
                        <td style="padding: 8px; text-align: right;"><strong>${sub.bio}%</strong></td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 8px;">English</td>
                        <td style="padding: 8px; text-align: left;">10%</td>
                        <td style="padding: 8px; text-align: right;"><strong>${sub.eng}%</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="thanks-box">
            <h3 style="color:var(--primary); margin-bottom:10px;">Vote of Thanks</h3>
            <p>"${s.thanks}"</p>
        </div>
        ${ceremonyHTML}
    `;
}

function populateFilters() {
    const yearSelect = document.getElementById('searchYear');
    const posSelect = document.getElementById('searchPosition');
    if(!yearSelect || !posSelect) return;

    yearSelect.innerHTML = '<option value="">All Years</option>';
    posSelect.innerHTML = '<option value="">All Positions</option>';

    const years = [...new Set(recipientsData.map(r => r.year))].sort((a,b) => b-a);
    const positions = [...new Set(recipientsData.map(r => r.position))].sort();

    years.forEach(y => yearSelect.innerHTML += `<option value="${y}">${y}</option>`);
    positions.forEach(p => posSelect.innerHTML += `<option value="${p}">${p}</option>`);

    yearSelect.onchange = posSelect.onchange = () => {
        const y = yearSelect.value;
        const p = posSelect.value;
        const filtered = recipientsData.filter(r => (!y || r.year == y) && (!p || r.position == p));
        renderCards(filtered);
    };

    const resetBtn = document.getElementById('resetBtn');
    if(resetBtn) {
        resetBtn.onclick = () => {
            yearSelect.selectedIndex = 0;
            posSelect.selectedIndex = 0;
            renderCards(recipientsData);
        };
    }
}

init();