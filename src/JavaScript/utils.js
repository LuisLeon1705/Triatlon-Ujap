/**
 * Módulo de utilidades para el triatlón
 * Maneja el formato y cálculo de tiempos y distancias
 */
const utils = (() => {
    /**
     * Actualiza los datos de un participante para una actividad específica
     * @param {Object} participant - El participante a actualizar
     * @param {string} activity - La actividad (walk, swim, bike)
     * @param {number} maxDistance - Distancia máxima para la actividad
     * @param {number} speedFactor - Factor de velocidad para la actividad
     * @param {number} currentAbsoluteTime - Tiempo absoluto actual en segundos
     * @param {number} elapsedSimTime - Tiempo simulado transcurrido desde el inicio
     */
    function updateData(participant, activity, maxDistance, speedFactor, currentAbsoluteTime, elapsedSimTime) {
      // Si el participante está descalificado o ha terminado, no actualizar
      if (participant.disqualified || participant.finished) {
        return
      }
  
      // Calcular la distancia a añadir basada en el factor de velocidad
      const distanceIncrement = (speedFactor / 10) * (Math.random() * 0.4 + 0.8) // Variación aleatoria de velocidad
  
      // Posibilidad aleatoria de descalificación (0.1%)
      if (Math.random() < 0.001) {
        participant.disqualified = true
        return
      }
  
      // Si es la primera actualización para esta actividad, registrar el tiempo de inicio
      if (participant.progress[activity].simStart === undefined) {
        participant.progress[activity].simStart = currentAbsoluteTime
        participant.progress[activity].start = formatAbsoluteTime(currentAbsoluteTime)
      }
  
      // Añadir la distancia calculada
      participant.progress[activity].distance += distanceIncrement
  
      // Calcular el tiempo transcurrido para esta actividad
      const activityElapsed = currentAbsoluteTime - participant.progress[activity].simStart
      participant.progress[activity].time = formatTime(activityElapsed)
  
      // Si ha alcanzado la distancia máxima, marcar como completada
      if (participant.progress[activity].distance >= maxDistance) {
        participant.progress[activity].distance = maxDistance
  
        // Solo registrar el tiempo de finalización si no estaba registrado antes
        if (participant.progress[activity].end === "N/A") {
          participant.progress[activity].end = formatAbsoluteTime(currentAbsoluteTime)
          participant.progress[activity].endTime = currentAbsoluteTime
  
          // Iniciar la siguiente actividad con el mismo tiempo de finalización
          const nextActivity = getNextActivity(activity)
          if (nextActivity) {
            participant.progress[nextActivity].simStart = currentAbsoluteTime
            participant.progress[nextActivity].start = formatAbsoluteTime(currentAbsoluteTime)
          }
        }
      }
  
      // Actualizar la distancia total
      participant.totalDistance = calculateTotalDistance(participant.progress)
  
      // Actualizar el tiempo total (desde el inicio de la simulación)
      participant.totalTime = formatTime(elapsedSimTime)
  
      // Verificar si ha completado todas las actividades
      if (
        participant.progress.walk.distance >= 10000 &&
        participant.progress.swim.distance >= 10000 &&
        participant.progress.bike.distance >= 30000 &&
        !participant.finished
      ) {
        participant.finished = true
        participant.finishTime = currentAbsoluteTime
      }
    }
  
    /**
     * Obtiene la siguiente actividad en la secuencia
     * @param {string} currentActivity - Actividad actual
     * @returns {string|null} - Siguiente actividad o null si es la última
     */
    function getNextActivity(currentActivity) {
      const sequence = ["walk", "swim", "bike"]
      const currentIndex = sequence.indexOf(currentActivity)
  
      if (currentIndex < sequence.length - 1) {
        return sequence[currentIndex + 1]
      }
  
      return null
    }
  
    /**
     * Formatea una distancia en metros o kilómetros
     * @param {number} distance - Distancia en metros
     * @returns {string} - Distancia formateada
     */
    function formatDistance(distance) {
      if (distance >= 1000) {
        return `${(distance / 1000).toFixed(2)} Km`
      }
      return `${distance.toFixed(2)} m`
    }
  
    /**
     * Convierte un tiempo en formato HH:MM:SS a segundos
     * @param {string} time - Tiempo en formato HH:MM:SS
     * @returns {number} - Tiempo en segundos
     */
    function timeToSeconds(time) {
      if (!time || time === "00:00:00" || time === "N/A") return 0
  
      const [hrs, mins, secs] = time.split(":").map(Number)
      return hrs * 3600 + mins * 60 + secs
    }
  
    /**
     * Formatea un tiempo en segundos a formato HH:MM:SS
     * @param {number} seconds - Tiempo en segundos
     * @returns {string} - Tiempo formateado
     */
    function formatTime(seconds) {
      if (isNaN(seconds) || seconds < 0) seconds = 0
  
      const hrs = Math.floor(seconds / 3600)
      const mins = Math.floor((seconds % 3600) / 60)
      const secs = Math.floor(seconds % 60)
  
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
  
    /**
     * Formatea un timestamp Unix a formato de hora HH:MM:SS
     * @param {number} timestamp - Timestamp Unix en segundos
     * @returns {string} - Hora formateada
     */
    function formatAbsoluteTime(timestamp) {
      if (!timestamp) return "N/A"
      return new Date(timestamp * 1000).toLocaleTimeString("en-US", { hour12: false })
    }
  
    /**
     * Calcula la distancia total sumando las distancias de cada actividad
     * @param {Object} progress - Objeto con el progreso de las actividades
     * @returns {number} - Distancia total en metros
     */
    function calculateTotalDistance(progress) {
      return progress.walk.distance + progress.swim.distance + progress.bike.distance
    }
  
    /**
     * Asigna medallas a los participantes según su tiempo de finalización
     * @param {Array} participants - Lista de participantes
     */
    function assignMedals(participants) {
      // Filtrar participantes que han terminado y no están descalificados
      const finishedParticipants = participants.filter((p) => p.finished && !p.disqualified)
  
      // Ordenar por tiempo de finalización (menor a mayor)
      finishedParticipants.sort((a, b) => a.finishTime - b.finishTime)
  
      // Resetear todas las medallas
      participants.forEach((p) => (p.medal = null))
  
      // Asignar medallas a los 3 primeros
      if (finishedParticipants[0]) finishedParticipants[0].medal = "gold"
      if (finishedParticipants[1]) finishedParticipants[1].medal = "silver"
      if (finishedParticipants[2]) finishedParticipants[2].medal = "bronze"
    }
  
    // Exponer las funciones públicas
    return {
      updateData,
      getNextActivity,
      formatDistance,
      timeToSeconds,
      formatTime,
      formatAbsoluteTime,
      calculateTotalDistance,
      assignMedals,
    }
  })()
  
  // Exportar el módulo para que sea accesible desde otros archivos
  window.utils = utils
  
  