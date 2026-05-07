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

            card.innerHTML = `
                <div style="flex-shrink: 0; display: flex; flex-direction: column; align-items: center;">
                    ${photosHTML}
                </div>

                <div class="request-info" style="flex-grow: 1; padding-left: 15px; min-width: 0;">
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
// НОВЕ: КРАСИВЕ ВІКНО РЕДАГУВАННЯ
// ---------------------------------------------------
function editPet(id) {
    const pet = currentPets.find(p => p.id === id);
    if (!pet) return;

    const modal = document.createElement('div');
    modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; box-sizing: border-box;";
    
    modal.innerHTML = `
        <div style="background: white; padding: 25px; border-radius: 15px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; border: 3px solid #6B1C1C; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
            <h3 style="color: #6B1C1C; margin-top: 0; text-align: center;">✏️ Повне редагування</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <label style="font-weight: bold; font-size: 13px;">Ім'я:</label>
                    <input type="text" id="edit-name" value="${pet.name || ''}" style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 5px;">
                </div>
                <div>
                    <label style="font-weight: bold; font-size: 13px;">Тип:</label>
                    <select id="edit-type" style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 5px;">
                        <option value="Песик" ${pet.type === 'Песик' ? 'selected' : ''}>Песик</option>
                        <option value="Котик" ${pet.type === 'Котик' ? 'selected' : ''}>Котик</option>
                        <option value="Інше" ${pet.type === 'Інше' ? 'selected' : ''}>Інше</option>
                    </select>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <label style="font-weight: bold; font-size: 13px;">Стать:</label>
                    <select id="edit-gender" style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 5px;">
                        <option value="Хлопчик" ${pet.gender === 'Хлопчик' ? 'selected' : ''}>Хлопчик</option>
                        <option value="Дівчинка" ${pet.gender === 'Дівчинка' ? 'selected' : ''}>Дівчинка</option>
                    </select>
                </div>
                <div>
                    <label style="font-weight: bold; font-size: 13px;">Вік:</label>
                    <input type="text" id="edit-age" value="${pet.age || ''}" style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 5px;">
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <label style="font-weight: bold; font-size: 13px;">Область:</label>
                    <input type="text" id="edit-region" value="${pet.region || ''}" style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 5px;">
                </div>
                <div>
                    <label style="font-weight: bold; font-size: 13px;">Місто:</label>
                    <input type="text" id="edit-city" value="${pet.city || ''}" style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 5px;">
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <label style="font-weight: bold; font-size: 13px;">Стерилізація:</label>
                    <select id="edit-steril" style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 5px;">
                        <option value="Так" ${pet.sterilization === 'Так' ? 'selected' : ''}>Так</option>
                        <option value="Ні" ${pet.sterilization === 'Ні' ? 'selected' : ''}>Ні</option>
                    </select>
                </div>
                <div>
                    <label style="font-weight: bold; font-size: 13px;">Вакцинація:</label>
                    <select id="edit-vaccine" style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 5px;">
                        <option value="Так" ${pet.vaccination === 'Так' ? 'selected' : ''}>Так</option>
                        <option value="Ні" ${pet.vaccination === 'Ні' ? 'selected' : ''}>Ні</option>
                    </select>
                </div>
            </div>
            
            <label style="font-weight: bold; font-size: 13px;">Опис:</label>
            <textarea id="edit-desc" style="width: 100%; height: 80px; margin-bottom: 20px; padding: 8px; border: 1px solid #ccc; border-radius: 5px; resize: none;">${pet.description || ''}</textarea>
            
            <div style="display: flex; gap: 10px;">
                <button id="cancel-edit" style="background: #f1f1f1; color: #333; border: 1px solid #ccc; padding: 10px; border-radius: 8px; cursor: pointer; flex: 1; font-weight: bold;">Скасувати</button>
                <button id="save-edit" style="background: #4CAF50; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; flex: 1; font-weight: bold;">💾 Зберегти все</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('cancel-edit').onclick = () => modal.remove();

    document.getElementById('save-edit').onclick = async () => {
        const btn = document.getElementById('save-edit');
        btn.innerText = "Зберігаємо...";
        btn.disabled = true;

        const updatedData = {
            name: document.getElementById('edit-name').value,
            type: document.getElementById('edit-type').value,
            gender: document.getElementById('edit-gender').value,
            age: document.getElementById('edit-age').value,
            region: document.getElementById('edit-region').value,
            city: document.getElementById('edit-city').value,
            sterilization: document.getElementById('edit-steril').value,
            vaccination: document.getElementById('edit-vaccine').value,
            description: document.getElementById('edit-desc').value
        };

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                modal.remove();
                loadRequests();
            } else {
                alert("Помилка збереження");
                btn.innerText = "💾 Зберегти все";
                btn.disabled = false;
            }
        } catch (error) {
            alert("Помилка з'єднання");
            btn.innerText = "💾 Зберегти все";
            btn.disabled = false;
        }
    };
}
loadRequests();