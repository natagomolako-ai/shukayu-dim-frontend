const API_URL = "https://shukayu-dim-backendi.onrender.com/api/pets";

// 1. ЗАВАНТАЖУЄМО АНКЕТИ
async function loadRequests() {
    try {
        const response = await fetch(API_URL);
        const allPets = await response.json();
        
        // Фільтруємо: показуємо ТІЛЬКИ ті, що чекають на перевірку (pending)
        const pendingPets = allPets.filter(pet => pet.status === 'pending');
        
        const listContainer = document.getElementById('requests-list');
        listContainer.innerHTML = ''; // Очищаємо екран перед завантаженням

        // Якщо перевіряти нічого:
        if (pendingPets.length === 0) {
            listContainer.innerHTML = '<p>🎉 Немає нових заявок на перевірку. Ви всі розібрали!</p>';
            return;
        }

        // Малюємо картку для кожної тваринки
        pendingPets.forEach(pet => {
            const card = document.createElement('div');
            card.className = 'request-card';
            card.innerHTML = `
                <div class="request-info">
                    <h4 style="margin-top:0; color: #6B1C1C;">${pet.name ? pet.name : 'Без імені'} (${pet.type})</h4>
                    <p><strong>Місто:</strong> ${pet.city}</p>
                    <p><strong>Вік:</strong> ${pet.age}</p>
                    <p><strong>Опис:</strong> ${pet.description}</p>
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button class="admin-btn btn-approve" onclick="publishPet('${pet.id}')">✅ Опублікувати</button>
                    <button class="admin-btn btn-reject" onclick="deletePet('${pet.id}')">❌ Видалити</button>
                </div>
            `;
            listContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Помилка:", error);
        document.getElementById('requests-list').innerHTML = '<p style="color:red;">Помилка зв\'язку з базою даних.</p>';
    }
}

// 2. КНОПКА "ОПУБЛІКУВАТИ"
async function publishPet(id) {
    if (!confirm("Точно опублікувати цю анкету на сайті?")) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}/publish`, { method: 'PUT' });
        if (response.ok) {
            alert("Анкету успішно опубліковано!");
            loadRequests(); // Перезавантажуємо список, щоб вона зникла з екрану
        }
    } catch (error) {
        alert("Ой, помилка при публікації.");
    }
}

// 3. КНОПКА "ВИДАЛИТИ"
async function deletePet(id) {
    if (!confirm("Увага! Точно видалити цю анкету назавжди?")) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert("Анкету видалено з бази.");
            loadRequests(); // Перезавантажуємо список
        }
    } catch (error) {
        alert("Ой, помилка при видаленні.");
    }
}

// Запускаємо завантаження одразу, коли відкривається сторінка
loadRequests();