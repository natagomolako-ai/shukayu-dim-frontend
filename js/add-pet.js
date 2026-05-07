// Функція для перетворення файлу в Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

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


// ВІДПРАВКА ФОРМИ
document.getElementById('addPetForm').addEventListener('submit', async function(event) {
    event.preventDefault(); 

    const submitBtn = document.querySelector('.submit-ad-btn');
    submitBtn.innerText = "Обробка фото та відправка... 🐾";
    submitBtn.disabled = true;

    // 1. Збираємо фото
    const files = Array.from(fileInput.files);
    const photosBase64 = [];
    for (const file of files) {
        const base64 = await fileToBase64(file);
        photosBase64.push(base64);
    }

    // 2. Збираємо дані
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
        photos: photosBase64,
        status: window.location.search.includes('admin=true') ? 'published' : 'pending' 
    };

    const API_URL = "https://shukayu-dim-backendi.onrender.com/api/pets";

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(petData)
        });

        if (response.ok) {
            alert("Успішно! Оголошення з фото відправлено.");
            document.getElementById('addPetForm').reset();
            // Повертаємо красивій кнопці початковий вигляд
            photoText.innerHTML = `
                <span style="font-size: 35px; display: block; margin-bottom: 10px;">📸</span>
                <b style="color: #6B1C1C;">Натисніть сюди</b><br>щоб додати фото<br>
                <span style="font-size: 13px; color: #888; margin-top: 5px;">(можна вибрати кілька)</span>
            `;
        } else {
            alert("Помилка сервера. Можливо, фото занадто великі?");
        }
    } catch (error) {
        console.error("Помилка:", error);
        alert("Не вдалося відправити.");
    } finally {
        submitBtn.innerText = "Опублікувати оголошення";
        submitBtn.disabled = false;
    }
});