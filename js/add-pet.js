document.getElementById('addPetForm').addEventListener('submit', async function(event) {
    // 1. Зупиняємо стандартне перезавантаження сторінки
    event.preventDefault(); 

    // 2. Міняємо текст на кнопці, щоб показати процес
    const submitBtn = document.querySelector('.submit-ad-btn');
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = "Відправляємо анкету... 🐾";
    submitBtn.disabled = true; // Блокуємо кнопку від подвійного натискання

    // 3. Збираємо всі дані з полів у форматі, який розуміє наша база
    const petData = {
        name: document.getElementById('petName').value,
        type: document.getElementById('petType').value,
        gender: document.getElementById('petGender').value,
        age: document.getElementById('petAge').value,
        sterilization: document.getElementById('petSterilization').value,
        vaccination: document.getElementById('petVaccination').value,
        region: document.getElementById('petRegion').value,
        city: document.getElementById('petCity').value,
        description: document.getElementById('petDescription').value,
        photos: [], // ПОРОЖНІЙ СПИСОК (готуємо місце для справжніх фото)
        status: window.location.search.includes('admin=true') ? 'published' : 'pending' 
    };

    // 4. Адреса твого бекенду (шлях для створення оголошень)
    const API_URL = "https://shukayu-dim-backendi.onrender.com/api/pets";

    try {
        // 5. Відправляємо POST-запит на сервер
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(petData)
        });

        // 6. Перевіряємо відповідь сервера
        if (response.ok) {
            alert("Ура! Анкету успішно відправлено. Тепер вона з'явиться в панелі адміністратора!");
            document.getElementById('addPetForm').reset(); // Очищаємо форму після успіху
        } else {
            throw new Error(`Помилка сервера: ${response.status}`);
        }
    } catch (error) {
        console.error("Помилка відправки:", error);
        alert("Ой, щось пішло не так при відправці. Перевір з'єднання з інтернетом або стан сервера.");
    } finally {
        // Повертаємо кнопці початковий вигляд
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
    }
});