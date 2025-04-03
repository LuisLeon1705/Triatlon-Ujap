const registrationModule = (() => {
    function init() {
        const participants = JSON.parse(localStorage.getItem('participants')) || [];
        const registrationForm = document.getElementById('registration-form');

        if (registrationForm) {
            registrationForm.addEventListener('submit', (event) => {
                event.preventDefault();

                const name = document.getElementById('participant-name').value;
                const id = document.getElementById('participant-id').value;
                const municipality = document.getElementById('participant-municipality').value;
                const age = document.getElementById('participant-age').value;

                // Validación de edad: debe estar entre 18 y 60
                const ageNumber = Number(age);
                if (ageNumber < 18 || ageNumber > 60) {
                    alert("La edad debe estar entre 18 y 60.");
                    document.getElementById('participant-age').focus();
                    document.getElementById('participant-age').select();
                    return;
                }

                // Validación de cédula / número de extranjería
                if (/^[0-9]+$/.test(id)) {
                    // Cédula normal: solo dígitos, 5 a 8 dígitos y no puede comenzar con 0.
                    if (id.startsWith('0')) {
                        alert('Error. La cédula de identidad no puede comenzar con 0.');
                        document.getElementById('participant-id').focus();
                        document.getElementById('participant-id').select();
                        return;
                    }
                    if (id.length < 5 || id.length > 8) {
                        alert('La cédula debe tener entre 5 y 8 dígitos.');
                        document.getElementById('participant-id').focus();
                        document.getElementById('participant-id').select();
                        return;
                    }
                } else {
                    // Número de extranjería: permite caracteres, pero máximo 20 en total.
                    if (id.length > 20) {
                        alert('El número de extranjería no puede tener más de 20 caracteres.');
                        document.getElementById('participant-id').focus();
                        document.getElementById('participant-id').select();
                        return;
                    }
                }

                // Verificar que la cédula no esté ya registrada.
                const idExists = participants.some(participant => participant.id === id);
                if (idExists) {
                    alert(`Error. La cédula de identidad ${id} ya está registrada.`);
                    document.getElementById('participant-id').focus();
                    document.getElementById('participant-id').select();
                    return;
                }

                if (name && id && municipality && age) {
                    const participant = {
                        id,
                        name,
                        municipality,
                        age,
                        progress: {
                            walk: { distance: 0.0, time: '00:00:00', start: 'N/A', end: 'N/A' },
                            swim: { distance: 0.0, time: '00:00:00', start: 'N/A', end: 'N/A' },
                            bike: { distance: 0.0, time: '00:00:00', start: 'N/A', end: 'N/A' },
                        },
                        totalDistance: 0.0,
                        totalTime: '00:00:00',
                        finished: false,
                        disqualified: false,
                    };
                    participants.push(participant);
                    localStorage.setItem('participants', JSON.stringify(participants));
                    registrationForm.reset();
                    alert('Registro exitoso.');
                    window.location.href = "participants.html";
                }
            });
        }
    }

    return {
        init
    };
})();
