const API_URL = "https://shukayu-dim-backendi.onrender.com/api/pets";
let currentPets = []; // Секретна пам'ять для редагування

async function loadRequests() {
    try {
        const response = await fetch(API_URL);
        const allPets = await response.json();
        currentPets = allPets; // Зберігаємо всіх тваринок у пам'ять
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
            
            let photosArray = [];
            try { photosArray = pet.photos ? JSON.parse(pet.photos) : []; } 
            catch (e) { photosArray = []; }

            let photosHTML = '';
            if (photosArray.length > 0) {
                photosHTML = `
                    <div style="position: relative; width: 140px; height: 140px;">
                        ${photosArray.length > 1 ? `<button onclick="this.nextElementSibling.scrollBy({left: -140, behavior: 'smooth'})" style="position: absolute; left: 5px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; font-weight: bold;">&lt;</button>` : ''}
                        
                        <div style="width: 140px; height: 140px; border-radius: 12px; overflow-x: auto; overflow-y: hidden; display: flex; scroll-snap-type: x mandatory; scrollbar-width: none; background: #faf5f5; border: 2px solid #6B1C1C;">
                            ${photosArray.map(url => `
                                <img src="${url}" style="flex: 0 0 100%; height: 100%; object-fit: cover; scroll-snap-align: start;" alt="Фото">
                            `).join('')}
                        </div>
                        
                        ${photosArray.length > 1 ? `<button onclick="this.previousElementSibling.scrollBy({left: 140, behavior: 'smooth'})" style="position: absolute; right: 5px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; font-weight: bold;">&gt;</button>` : ''}
                    </div>
                `;
            } else {
                photosHTML = `
                    <div style="width: 140px; height: 140px; border-radius: 12px; background: #faf5f5; border: 2px dashed #dcbababa; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 40px; opacity: 0.5;">📷</span>
                    </div>
                `;
            }

            // Визначаємо текст категорії для відображення в картці
            const categoryText = (pet.category === 'lost') ? '🔍 Загублена' : '🏡 Шукає дім';

            card.innerHTML = `
                <div style="flex-shrink: 0; display: flex; flex-direction: column; align-items: center;">
                    ${photosHTML}
                </div>

                <div class="request-info" style="flex-grow: 1; padding-left: 15px; min-width: 0;">
                    <h4 style="margin-top:0; color: #6B1C1C; font-size: 20px;">
                        ${pet.name ? pet.name : 'Без імені'} (${pet.type})
                    </h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; font-size: 14px; color: #333;">
                        <div><strong>📌 Мета:</strong> ${categoryText}</div>
                        <div><strong>📍 Локація:</strong> ${pet.region}, ${pet.city}</div>
                        <div><strong>⚧ Стать:</strong> ${pet.gender}</div>
                        <div><strong>📅 Вік:</strong> ${pet.age}</div>
                        <div><strong>⚕️ Стерилізація:</strong> ${pet.sterilization}</div>
                        <div><strong>💉 Вакцинація:</strong> ${pet.vaccination}</div>
                    </div>
                    <p style="margin: 0; padding: 12px; background: #fcf8f5; border-radius: 8px; border-left: 4px solid #6B1C1C; font-size: 14px; word-break: break-all; overflow-wrap: break-word;">
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

async function deletePet(id) {
    if (!confirm("Точно видалити?")) return;
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (response.ok) { alert("Видалено!"); loadRequests(); }
    } catch (error) { alert("Помилка."); }
}

// ---------------------------------------------------
// КРАСИВЕ ВІКНО РЕДАГУВАННЯ З НОВОЮ КАТЕГОРІЄЮ
// ---------------------------------------------------
function editPet(id) {
    const pet = currentPets.find(p => p.id === id);
    if (!pet) return;

    const modal = document.createElement('div');
    modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999;";
    
    // Захист, якщо категорія порожня
    const currentCategory = pet.category || 'adoption';

    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; width: 500px; max-height: 90vh; overflow-y: auto; border: 2px solid #6B1C1C;">
            <h2 style="color: #6B1C1C; margin-top: 0; text-align: center;">Редагувати анкету</h2>
            
            <label style="font-weight: bold; font-size: 14px;">Ім'я:</label>
            <input type="text" id="editName" value="${pet.name || ''}" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 8px; box-sizing: border-box;">
            
            <label style="font-weight: bold; font-size: 14px;">Мета оголошення:</label>
            <select id="editCategory" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 8px; box-sizing: border-box;">
                <option value="adoption" ${currentCategory === 'adoption' ? 'selected' : ''}>🏡 Шукаю дім</option>
                <option value="lost" ${currentCategory === 'lost' ? 'selected' : ''}>🔍 Загублена / Знайдена</option>
            </select>

            <label style="font-weight: bold; font-size: 14px;">Тип:</label>
            <input type="text" id="editType" value="${pet.type}" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 8px; box-sizing: border-box;">
            
            <label style="font-weight: bold; font-size: 14px;">Стать:</label>
            <input type="text" id="editGender" value="${pet.gender}" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 8px; box-sizing: border-box;">
            
            <label style="font-weight: bold; font-size: 14px;">Вік:</label>
            <input type="text" id="editAge" value="${pet.age}" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 8px; box-sizing: border-box;">
            
            <label style="font-weight: bold; font-size: 14px;">Стерилізація:</label>
            <input type="text" id="editSteril" value="${pet.sterilization}" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 8px; box-sizing: border-box;">
            
            <label style="font-weight: bold; font-size: 14px;">Вакцинація:</label>
            <input type="text" id="editVaccine" value="${pet.vaccination}" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 8px; box-sizing: border-box;">
            
            <label style="font-weight: bold; font-size: 14px;">Область:</label>
            <input type="text" id="editRegion" value="${pet.region}" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 8px; box-sizing: border-box;">
            
            <label style="font-weight: bold; font-size: 14px;">Місто:</label>
            <input type="text" id="editCity" value="${pet.city}" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 8px; box-sizing: border-box;">
            
            <label style="font-weight: bold; font-size: 14px;">Опис:</label>
            <textarea id="editDesc" style="width: 100%; padding: 10px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 8px; min-height: 100px; box-sizing: border-box;">${pet.description}</textarea>
            
            <div style="display: flex; gap: 10px;">
                <button onclick="saveEdit('${pet.id}')" style="flex: 1; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">💾 Зберегти</button>
                <button onclick="this.closest('.pet-modal-overlay').remove()" style="flex: 1; padding: 12px; background: #f44336; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Скасувати</button>
            </div>
        </div>
    `;
    
    modal.className = 'pet-modal-overlay';
    document.body.appendChild(modal);
}

// ---------------------------------------------------
// ЗБЕРЕЖЕННЯ ВІДРЕДАГОВАНОЇ АНКЕТИ НА СЕРВЕР
// ---------------------------------------------------
async function saveEdit(id) {
    const updatedData = {
        name: document.getElementById('editName').value,
        category: document.getElementById('editCategory').value, // Зберігаємо нову категорію
        type: document.getElementById('editType').value,
        gender: document.getElementById('editGender').value,
        age: document.getElementById('editAge').value,
        sterilization: document.getElementById('editSteril').value,
        vaccination: document.getElementById('editVaccine').value,
        region: document.getElementById('editRegion').value,
        city: document.getElementById('editCity').value,
        description: document.getElementById('editDesc').value
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        if (response.ok) {
            alert("Анкету успішно оновлено!");
            document.querySelector('.pet-modal-overlay').remove(); // Закриваємо вікно
            loadRequests(); // Оновлюємо список
        } else {
            alert("Помилка збереження.");
        }
    } catch (error) {
        alert("Помилка зв'язку з сервером.");
    }
}

// Запускаємо завантаження при старті
loadRequests();