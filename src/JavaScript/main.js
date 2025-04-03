document.addEventListener('DOMContentLoaded', () => {
    const currentUrl = window.location.href;

    if (currentUrl.endsWith('registration.html')) {
        // Carga el script de registro
        registrationModule.init();
    }

    if (currentUrl.endsWith('participants.html')) {
        // Carga el script de manejo de participantes
        participantsModule.init();
    }

    if (currentUrl.endsWith('updateform.html')) {
        // Carga el script para actualizar participantes
        updateModule.init();
    }

    if (currentUrl.endsWith('progress.html') && window.progressModule) {
        progressModule.init();
    }
});
/*document.addEventListener('DOMContentLoaded', () => {
    const currentUrl = window.location.href;

    if (currentUrl.endsWith('registration.html') && window.registrationModule) {
        registrationModule.init();
    }

    if (currentUrl.endsWith('participants.html') && window.participantsModule) {
        participantsModule.init();
    }

    if (currentUrl.endsWith('updateform.html') && window.updateModule) {
        updateModule.init();
    }

    
    }
});*/
