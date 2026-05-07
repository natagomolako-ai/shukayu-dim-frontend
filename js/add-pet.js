// ----------------------------------------------------
// НОВА СУПЕР-ФУНКЦІЯ: Стискає фото перед відправкою!
// ----------------------------------------------------
function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                // Створюємо віртуальне полотно для малювання
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; // Максимальна ширина фото
                const MAX_HEIGHT = 800; // Максимальна висота
                let width = img.width;
                let height = img.height;

                // Вираховуємо нові пропорції
                if (width > height && width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                } else if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Перетворюємо назад у текст, але вже стиснений у JPEG (якість 70%)
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
        };
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

    try {
        // 1. Збираємо і СТИСКАЄМО фото
        const files = Array.from(fileInput.files);
        const photosBase64 = [];
        for (const file of files) {
            const base64 = await compressImage(file); // Викликаємо розумну функцію
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

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(petData)
        });

        if (response.ok) {
            alert("Успішно! Оголошення з фото відправлено.");
            document.getElementById('addPetForm').reset();
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