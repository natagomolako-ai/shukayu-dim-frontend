// Твій персональний ключ для хмари ImgBB
const IMGBB_API_KEY = "5ead51ccacb9fae89042829844ea7069";

// ----------------------------------------------------
// МІНЯЄМО ТЕКСТ ПРИ ВИБОРІ ФОТО
// ----------------------------------------------------
const fileInput = document.getElementById('petPhotos');
const photoText = document.getElementById('photo-text');

fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        photoText.innerHTML = `
            <span style="font-size: 35px; display: block; margin-bottom: 10px;">✅</span>
            <b style="color: #4CAF50;">Вибрано фото: ${fileInput.files.length}</b><br>
            <span style="font-size: 13px; color: #888; margin-top: 5px;">Натисніть, щоб змінити</span>
        `;
    }
});
// ----------------------------------------------------

// ----------------------------------------------------
// ФУНКЦІЯ: Відправляє фото у хмару і повертає посилання
// ----------------------------------------------------
async function uploadToImgBB(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
    });
    
    const data = await response.json();
    if (data.success) {
        return data.data.url; // Отримуємо коротке посилання
    } else {
        throw new Error("Не вдалося завантажити фото у хмару");
    }
}

// ВІДПРАВКА ФОРМИ
document.getElementById('addPetForm').addEventListener('submit', async function(event) {
    event.preventDefault(); 

    const submitBtn = document.querySelector('.submit-ad-btn');
    submitBtn.disabled = true;

    try {
        // 1. Завантажуємо фото у хмару ImgBB
        submitBtn.innerText = "Завантажуємо фото у хмару... ☁️🐾";
        const files = Array.from(fileInput.files);
        const photoURLs = [];
        
        for (const file of files) {
            const url = await uploadToImgBB(file); // отримуємо посилання
            photoURLs.push(url);
        }

        // 2. Відправляємо анкету з посиланнями в нашу базу
        submitBtn.innerText = "Зберігаємо анкету... 📝";
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
            photos: photoURLs, // ТЕПЕР ТУТ ЛЕГЕНЬКІ ПОСИЛАННЯ!
            status: window.location.search.includes('admin=true') ? 'published' : 'pending' 
        };

        const API_URL = "https://shukayu-dim-backendi.onrender.com/api/pets";

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(petData)
        });

        if (response.ok) {
            alert("Успішно! Оголошення відправлено.");
            document.getElementById('addPetForm').reset();
            photoText.innerHTML = `
                <span style="font-size: 35px; display: block; margin-bottom: 10px;">📸</span>
                <b style="color: #6B1C1C;">Натисніть сюди</b><br>щоб додати фото<br>
                <span style="font-size: 13px; color: #888; margin-top: 5px;">(можна вибрати кілька)</span>
            `;
        } else {
            alert("Помилка сервера при збереженні анкети.");
        }
    } catch (error) {
        console.error("Помилка:", error);
        alert("Ой! Щось пішло не так. Перевір інтернет.");
    } finally {
        submitBtn.innerText = "Опублікувати оголошення";
        submitBtn.disabled = false;
    }
});