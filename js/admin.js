const API_URL = "https://shukayu-dim-backendi.onrender.com/api/pets";

async function loadRequests() {
    try {
        const response = await fetch(API_URL);
        const allPets = await response.json();
        const pendingPets = allPets.filter(pet => pet.status === 'pending');
        
        const listContainer = document.getElementById('requests-list');
        listContainer.innerHTML = ''; 

        if (pendingPets.length === 0) {
            listContainer.innerHTML = '<p>🎉 Немає нових заявок на перевірку.</p>';
            return;
        }

        pendingPets.forEach(pet => {
            const card = document.createElement('div');
            card.className = 'request-card';
            card.style.alignItems = 'center'; 
            
            // Розпаковуємо список фотографій з бази
            let photosArray = [];
            try { photosArray = pet.photos ? JSON.parse(pet.photos) : []; } 
            catch (e) { photosArray = []; }

            // Малюємо карусель або заглушку
            let photosHTML = '';
            if (photosArray.length > 0) {
                photosHTML = `
                    <div style="width: 140px; height: 140px; border-radius: 12px; overflow-x: auto; overflow-y: hidden; display: flex; scroll-snap-type: x mandatory; scrollbar-width: none; background: #faf5f5; border: 2px solid #6B1C1C;">
                        ${photosArray.map(url => `
                            <img src="${url}" style="flex: 0 0 100%; height: 100%; object-fit: cover; scroll-snap-align: start;" alt="Фото">
                        `).join('')}
                    </div>
                    ${photosArray.length > 1 ? `<div style="text-align: center; font-size: 11px; color: #888; margin-top: 5px;">↔️ Гортайте фото</div>` : ''}
                `;
            } else {
                photosHTML = `
                    <div style="width: 140px; height: 140px; border-radius: 12px; background: #faf5f5; border: 2px dashed #dcbababa; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 40px; opacity: 0.5;">📷</span>
                    </div>
                `;
            }

            card.innerHTML = `
                <div style="flex-shrink: 0; display: flex; flex-direction: column; align-items: center;">
                    ${photosHTML}
                </div>

                <div class="request-info" style="flex-grow: 1; padding-left: 15px;">
                    <h4 style="margin-top:0; color: #6B1C1C; font-size: 20px;">
                        ${pet.name ? pet.name : 'Без імені'} (${pet.type})
                    </h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; font-size: 14px; color: #333;">
                        <div><strong>📍 Локація:</strong> ${pet.region}, ${pet.city}</div>
                        <div><strong>⚧ Стать:</strong> ${pet.gender}</div>
                        <div><strong>📅 Вік:</strong> ${pet.age}</div>
                        <div><strong>⚕️ Стерилізація:</strong> ${pet.sterilization}</div>
                        <div><strong>💉 Вакцинація:</strong> ${pet.vaccination}</div>
                    </div>
                    <p style="margin: 0; padding: 12px; background: #fcf8f5; border-radius: 8px; border-left: 4px solid #6B1C1C; font-size: 14px;">
                        <strong>📝 Опис:</strong> ${pet.description}
                    </p>
                </div>
                
                <div style="display: flex; flex-direction: column; justify-content: center; gap: 10px; min-width: 160px;">
                    <button class="admin-btn btn-approve" onclick="publishPet('${pet.id}')">✅ Опублікувати</button>
                    <button class="admin-btn" style="background: #FF9800; color: white;" onclick="editPet('${pet.id}')">✏️ Редагувати</button>
                    <button class="admin-btn btn-reject" onclick="deletePet('${pet.id}')">❌ Видалити</button>
                </div>
            `;
            listContainer.appendChild(card);
        });
    } catch (error) {
        document.getElementById('requests-list').innerHTML = '<p style="color:red;">Помилка зв\'язку з базою даних.</p>';
    }
}

async function publishPet(id) {
    if (!confirm("Точно опублікувати цю анкету на сайті?")) return;
    try {
        const response = await fetch(`${API_URL}/${id}/publish`, { method: 'PUT' });
        if (response.ok) { alert("Опубліковано!"); loadRequests(); }
    } catch (error) { alert("Помилка."); }
}

function editPet(id) { alert("🛠️ Функція редагування в розробці!"); }

async function deletePet(id) {
    if (!confirm("Точно видалити?")) return;
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (response.ok) { alert("Видалено!"); loadRequests(); }
    } catch (error) { alert("Помилка."); }
}

loadRequests();