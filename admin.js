// Функція схвалення (Оновлює статус на published)
async function approvePet(petId) {
    try {
        const response = await fetch(`${API_URL}/pets/${petId}`, {
            method: 'PUT', // Або PATCH, залежить від твого сервера
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'published' })
        });

        if (response.ok) {
            alert(`Оголошення №${petId} успішно опубліковано!`);
            fetchPendingPets(); // Оновлюємо список
        }
    } catch (error) {
        console.error('Помилка при схваленні:', error);
    }
}