document.addEventListener('DOMContentLoaded', () => {
    const playGameBtn = document.getElementById('play-game-btn');
    const gameModal = document.getElementById('game-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const gameFrame = document.getElementById('game-frame');
    const modalScaler = document.querySelector('.modal-scaler'); 

    const gameWidth = 1792;
    const gameHeight = 1024;

    function openModal() {
        gameModal.classList.add('modal-visible');
        resizeGame();
    }

    function closeModal() {
        gameModal.classList.remove('modal-visible');
        gameFrame.src = gameFrame.src;
    }

    function resizeGame() {
        if (!gameModal.classList.contains('modal-visible')) return;

        // Note: The available height is slightly less to ensure the X fits
        const maxWidth = window.innerWidth * 0.98;
        const maxHeight = window.innerHeight * 0.90; 

        const scale = Math.min(
            maxWidth / gameWidth,
            maxHeight / gameHeight
        );

        // Apply the scale to the scaler div, which contains both game and button
        modalScaler.style.transform = `scale(${scale})`;
    }

    playGameBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('resize', resizeGame);

    window.addEventListener('click', (event) => {
        if (event.target === gameModal) {
            closeModal();
        }
    });
});