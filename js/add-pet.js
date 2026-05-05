// Функція для перетворення файлу в Base64 (текстовий рядок)
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

document.getElementById('addPetForm').addEventListener('submit', async function(event) {
    event.preventDefault(); 

    const submitBtn = document.querySelector('.submit-ad-btn');
    submitBtn.innerText = "Обробка фото та відправка... 🐾";
    submitBtn.disabled = true;

    // 1. Отримуємо файли з вікна завантаження
    const fileInput = document.getElementById('petPhotos');
    const files = Array.from(fileInput.files);
    
    // 2. Перетворюємо всі вибрані фото в текст (Base64)
    const photosBase64 = [];
    for (const file of files) {
        const base64 = await fileToBase64(file);
        photosBase64.push(base64);
    }

    // 3. Збираємо дані
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
        photos: photosBase64, // ТУТ ТЕПЕР СПРАВЖНІ ФОТО!
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