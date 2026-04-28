const API_URL = 'https://shukayu-dim-backendi.onrender.com';

document.getElementById('addPetForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
        alert('Помилка: Ви не увійшли в систему!');
        window.location.href = 'index.html';
        return;
    }

    // Збираємо ВСІ нові дані з форми
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
        
        authorId: user.id, 
        status: 'pending' // Статус для твоєї адмінки
    };

    try {
        const response = await fetch(`${API_URL}/pets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(petData)
        });

        if (response.ok) {
            alert('Ура! Оголошення відправлено менеджеру на перевірку. 🐾');
            window.location.href = 'index.html';
        } else {
            alert('Помилка на сервері.');
        }
    } catch (error) {
        alert('Сервер зараз спить, спробуй ще раз!');
    }
});