const updateModule = (() => {
    function init() {
        const participant = JSON.parse(localStorage.getItem('participant-to-update'));

        document.getElementById('updated-participant-name').value = participant.name;
        document.getElementById('updated-participant-id').value = participant.id;
        document.getElementById('updated-participant-municipality').value = participant.municipality;
        document.getElementById('updated-participant-age').value = participant.age;

        document.getElementById('update-form').addEventListener('submit', (event) => {
            event.preventDefault();
            const updatedParticipant = {
                name: document.getElementById('updated-participant-name').value,
                id: document.getElementById('updated-participant-id').value,
                municipality: document.getElementById('updated-participant-municipality').value,
                age: document.getElementById('updated-participant-age').value,
            };

            const participants = JSON.parse(localStorage.getItem('participants')) || [];

            if (updatedParticipant.id.startsWith('0')) {
                alert('Error. La cédula de identidad no puede comenzar con 0.');
                document.getElementById('updated-participant-id').focus();
                document.getElementById('updated-participant-id').select();
                return;
            }

            if (updatedParticipant.id.length > 8) {
                alert('Error. Longitud máxima de cédula de identidad excedida.');
                document.getElementById('updated-participant-id').focus();
                document.getElementById('updated-participant-id').select();
                return;
            }

            const idExists = participants.some(p => p.id === updatedParticipant.id);
            if (idExists) {
                alert(`Error. La cédula de identidad ${updatedParticipant.id} ya está registrada.`);
                document.getElementById('updated-participant-id').focus();
                document.getElementById('updated-participant-id').select();
                return;
            }

            const index = participants.findIndex(p => p.id === participant.id);
            participants[index] = updatedParticipant;
            localStorage.setItem('participants', JSON.stringify(participants));

            alert('Participante actualizado exitosamente.');
            localStorage.removeItem('participant-to-update');
            window.location.href = 'participants.html';
        });

        document.getElementById('cancel-button').addEventListener('click', () => {
            localStorage.removeItem('participant-to-update');
            window.location.href = 'participants.html';
        });
    }

    return {
        init
    };
})();
