// 1. ГОЛОВНЕ ПОСИЛАННЯ НА ТВІЙ БЕКЕНД
// (Замінимо його на правильне на наступному кроці)
const API_URL = "https://shukayu-dim-backendi.onrender.com/api"; 

// ==========================================
// ЕТАП 1: ФУНКЦІЯ ЗАВАНТАЖЕННЯ ВСІХ ЗАЯВОК
// ==========================================
async function loadPets() {
    const listContainer = document.getElementById('requests-list');

    try {
        const response = await fetch(`${API_URL}/pets`); // Використовуємо спільний API_URL
        
        if (!response.ok) {
            throw new Error(`Помилка сервера: ${response.status}`);
        }

        const pets = await response.json();
        listContainer.innerHTML = '';

        if (pets.length === 0) {
            listContainer.innerHTML = '<p>Поки що немає нових заявок.</p>';
            return;
        }

        pets.forEach(pet => {
            const card = document.createElement('div');
            card.className = 'request-card';

            card.innerHTML = `
                <div class="request-info">
                    <h4 style="margin-top: 0; color: #5C2E2E;">${pet.name || 'Без імені'} (${pet.type || 'Тваринка'})</h4>
                    <p style="margin: 5px 0;"><strong>Вік:</strong> ${pet.age || 'Не вказано'}</p>
                    <p style="margin: 5px 0;"><strong>Місто:</strong> ${pet.city || 'Не вказано'}</p>
                    <p style="margin: 5px 0;"><strong>Опис:</strong> ${pet.description || 'Немає опису'}</p>
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px; justify-content: center;">
                    <button class="admin-btn btn-approve" onclick="approvePet('${pet.id}')">✅ Опублікувати</button>
                    <button class="admin-btn btn-reject">🗑️ Видалити</button>
                    <button class="admin-btn" style="background: #2196F3; color: white;">✏️ Редагувати</button>
                </div>
            `;

            listContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Помилка завантаження:", error);
        listContainer.innerHTML = '<p style="color: red;">Помилка з\'єднання з сервером. Перевір, чи працює бекенд на Render.</p>';
    }
}

// ==========================================
// ЕТАП 2: ТВІЙ КОД ДЛЯ СХВАЛЕННЯ (ОПУБЛІКУВАТИ)
// ==========================================
async function approvePet(petId) {
    try {
        const response = await fetch(`${API_URL}/pets/${petId}`, {
            method: 'PUT', // Або PATCH, залежить від твого сервера
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'published' })
        });

        if (response.ok) {
            alert(`Оголошення успішно опубліковано!`);
            loadPets(); // Оновлюємо список після схвалення
        }
    } catch (error) {
        console.error('Помилка при схваленні:', error);
    }
}

// Запускаємо завантаження при відкритті сторінки
document.addEventListener('DOMContentLoaded', loadPets);