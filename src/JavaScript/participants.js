const participantsModule = (() => {
    function init() {
        let participants = JSON.parse(localStorage.getItem('participants')) || [];
        const tableBody = document.getElementById('participants-table-body');
        tableBody.innerHTML = '';

        participants.forEach((participant, index) => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${participant.id}</td>
                <td>${participant.name}</td>
                <td>${participant.municipality}</td>
                <td>${participant.age}</td>
                <td>
                    <input type="checkbox" class="participation-checkbox" data-index="${index}" ${participant.willParticipate ? 'checked' : ''}>
                </td>
                <td>
                    <div class='button-group'>
                        <button class='edit-button' data-index='${index}'>Editar</button>
                        <button class='delete-button' data-index='${index}'>Eliminar</button>
                    </div>
                </td>
            `;

            tableBody.appendChild(row);
        });

        // Actualizar estado de participantes en tiempo real
        function updateParticipants() {
            participants = JSON.parse(localStorage.getItem('participants')) || [];
        }

        // Manejo de eventos para checkboxes
        document.querySelectorAll('.participation-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                const index = event.target.getAttribute('data-index');
                participants[index].willParticipate = event.target.checked;
                localStorage.setItem('participants', JSON.stringify(participants));
            });
        });

        // Eventos para edición
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = event.target.getAttribute('data-index');
                const participant = participants[index];
                localStorage.setItem('participant-to-update', JSON.stringify(participant));
                window.location.href = 'updateform.html';
            });
        });

        // Eventos para eliminación
        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = event.target.getAttribute('data-index');
                const confirmDelete = confirm(`¿Está seguro de que desea eliminar al participante con cédula de identidad ${participants[index].id}?`);
                if (confirmDelete) {
                    participants.splice(index, 1);
                    localStorage.setItem('participants', JSON.stringify(participants));
                    alert('Participante eliminado exitosamente.');
                    location.reload();
                }
            });
        });

        // Botón para iniciar triatlón
        document.getElementById('start-button').addEventListener('click', () => {
            updateParticipants(); // Asegura que el estado esté actualizado
            const participantsReady = participants.filter(p => p.willParticipate);
            if (participantsReady.length === 0) {
                alert('El triatlón no puede iniciar sin participantes seleccionados.');
                return;
            } else {
                window.location.href = '../public/progress.html';
            }
        });

        // Botón para reiniciar registros
        document.getElementById('reset-button').addEventListener('click', () => {
            if (participants.length > 0) {
                const confirmReset = confirm('¿Está seguro de que desea eliminar los registros?');
                if (confirmReset) {
                    localStorage.removeItem('participants');
                    alert('Se han eliminado los registros de participantes.');
                    location.reload();
                }
            }
        });
    }

    return {
        init
    };
})();

// Inicializar módulo cuando cargue la página
document.addEventListener('DOMContentLoaded', participantsModule.init);
