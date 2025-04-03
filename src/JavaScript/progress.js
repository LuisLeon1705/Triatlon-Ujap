/**
 * Módulo principal para la simulación del triatlón
 * Maneja la inicialización, actualización y visualización del progreso
 */

// Variables globales para la simulación
let interval
let simulationDuration = null
let simulationStartTimestamp = null // Tiempo real de inicio de la simulación
let simulationUserStartTimestamp = null // Tiempo de inicio ingresado por el usuario
let previousPositions = {} // Almacena las posiciones anteriores para la animación

const progressModule = (() => {
  /**
   * Inicializa el módulo de progreso
   */
  function init() {
    console.log("Inicializando módulo de progreso...")

    // Restaurar el modo de simulación seleccionado
    restoreSimulationMode()

    // Actualizar la tabla de participantes
    updateTable()

    // Configurar los botones
    setupEventListeners()

    // Añadir estilos CSS para la animación
    addAnimationStyles()
  }

  /**
   * Añade estilos CSS para la animación de cambio de posición
   */
  function addAnimationStyles() {
    const styleElement = document.createElement("style")
    styleElement.textContent = `
            @keyframes highlightRow {
                0% { background-color: rgba(255, 255, 0, 0.5); }
                100% { background-color: transparent; }
            }
            
            .position-changed {
                animation: highlightRow 1.5s ease-out;
            }
            
            .table-row {
                transition: transform 0.8s ease-out;
            }
        `
    document.head.appendChild(styleElement)
  }

  /**
   * Configura los event listeners para los botones y controles
   */
  function setupEventListeners() {
    const startButton = document.getElementById("start-button")
    const restartButton = document.getElementById("restart-button")
    const modeRapida = document.getElementById("mode-rapida")
    const modeNormal = document.getElementById("mode-normal")

    if (startButton) {
      startButton.addEventListener("click", startSimulation)
    }

    if (restartButton) {
      restartButton.addEventListener("click", restartSimulation)
    }

    if (modeRapida && modeNormal) {
      modeRapida.addEventListener("click", () => {
        modeRapida.classList.add("selected")
        modeNormal.classList.remove("selected")
        localStorage.setItem("simulationMode", "rapida")
      })

      modeNormal.addEventListener("click", () => {
        modeNormal.classList.add("selected")
        modeRapida.classList.remove("selected")
        localStorage.setItem("simulationMode", "normal")
      })
    }
  }

  /**
   * Restaura el modo de simulación desde localStorage
   */
  function restoreSimulationMode() {
    const savedMode = localStorage.getItem("simulationMode")
    const modeRapida = document.getElementById("mode-rapida")
    const modeNormal = document.getElementById("mode-normal")

    if (!modeRapida || !modeNormal) return

    if (savedMode === "normal") {
      modeRapida.classList.remove("selected")
      modeNormal.classList.add("selected")
    } else {
      // Por defecto o si es 'rapida'
      modeRapida.classList.add("selected")
      modeNormal.classList.remove("selected")

      // Si no hay modo guardado, guardar el predeterminado
      if (!savedMode) {
        localStorage.setItem("simulationMode", "rapida")
      }
    }
  }

  /**
   * Inicia la simulación del triatlón
   */
  function startSimulation() {
    console.log("Iniciando simulación...")

    // Validar que se haya ingresado una fecha y hora de inicio
    const startDateTimeInput = document.getElementById("start-datetime")
    if (!startDateTimeInput || !startDateTimeInput.value) {
      alert("Por favor ingrese la fecha y hora de inicio.")
      return
    }

    // Detener cualquier simulación en curso
    if (interval) {
      clearInterval(interval)
    }

    // Obtener la fecha y hora de inicio ingresada por el usuario
    const userStartTime = new Date(startDateTimeInput.value)
    simulationUserStartTimestamp = Math.floor(userStartTime.getTime() / 1000)
    const formattedStartTime = userStartTime.toLocaleTimeString("en-US", { hour12: false })

    // Mostrar la hora de inicio
    const startTimeElem = document.getElementById("start-time")
    if (startTimeElem) {
      startTimeElem.textContent = `HORA DE INICIO: ${formattedStartTime}`
    }

    // Determinar el modo de simulación y configurar los parámetros
    const modeRapida = document.getElementById("mode-rapida")
    const isRapidMode = modeRapida && modeRapida.classList.contains("selected")
    const speedMultiplier = isRapidMode ? 1000 : 1

    // Duración de la simulación (4 horas en tiempo real o simulado)
    simulationDuration = isRapidMode ? 4 * 60 : 4 * 60 * 60

    // Registrar el tiempo de inicio de la simulación
    simulationStartTimestamp = Math.floor(Date.now() / 1000)

    // Inicializar los participantes
    const participants = JSON.parse(localStorage.getItem("participants")) || []
    participants.forEach((participant) => {
      if (participant.willParticipate) {
        // Reiniciar el progreso para esta simulación
        participant.progress = {
          walk: {
            distance: 0.0,
            time: "00:00:00",
            start: formattedStartTime,
            end: "N/A",
            simStart: simulationUserStartTimestamp,
          },
          swim: {
            distance: 0.0,
            time: "00:00:00",
            start: "N/A",
            end: "N/A",
            simStart: undefined,
          },
          bike: {
            distance: 0.0,
            time: "00:00:00",
            start: "N/A",
            end: "N/A",
            simStart: undefined,
          },
        }
        participant.totalDistance = 0.0
        participant.totalTime = "00:00:00"
        participant.finished = false
        participant.disqualified = false
        participant.finishTime = undefined
        participant.medal = null
        participant.position = 0 // Posición inicial
      }
    })

    // Guardar los participantes inicializados
    localStorage.setItem("participants", JSON.stringify(participants))

    // Reiniciar las posiciones anteriores
    previousPositions = {}

    // Iniciar el intervalo de actualización
    interval = setInterval(() => {
      updateSimulation(speedMultiplier)
    }, 1000)

    console.log("Simulación iniciada con éxito.")
  }

  /**
   * Actualiza el estado de la simulación en cada tick
   * @param {number} speedMultiplier - Multiplicador de velocidad
   */
  function updateSimulation(speedMultiplier) {
    // Calcular el tiempo actual una sola vez antes de procesar a los participantes
    const currentTimestamp = Math.floor(Date.now() / 1000)

    // Calcular el tiempo transcurrido real desde el inicio de la simulación
    const elapsedRealSeconds = currentTimestamp - simulationStartTimestamp

    // Verificar si la simulación debe terminar
    if (elapsedRealSeconds >= simulationDuration) {
      clearInterval(interval)
      alert("Simulación finalizada por límite de tiempo.")
      return
    }

    // Calcular el tiempo simulado (aplicando el multiplicador de velocidad)
    const simulatedElapsedSeconds = elapsedRealSeconds * speedMultiplier

    // Calcular el tiempo absoluto simulado actual
    const simulatedCurrentTime = simulationUserStartTimestamp + simulatedElapsedSeconds

    // Obtener los participantes
    const participants = JSON.parse(localStorage.getItem("participants")) || []

    // Guardar las posiciones actuales antes de actualizar
    participants.forEach((p) => {
      if (p.willParticipate) {
        previousPositions[p.id] = p.position || 0
      }
    })

    // Actualizar cada participante con el mismo tiempo simulado
    participants.forEach((participant) => {
      if (participant.willParticipate && !participant.disqualified && !participant.finished) {
        // Actualizar la actividad actual del participante
        if (participant.progress.walk.distance < 10000) {
          // Caminata
          utils.updateData(
            participant,
            "walk",
            10000,
            1.94 * speedMultiplier,
            simulatedCurrentTime,
            simulatedElapsedSeconds,
          )
        } else if (participant.progress.swim.distance < 10000) {
          // Natación
          utils.updateData(
            participant,
            "swim",
            10000,
            1.72 * speedMultiplier,
            simulatedCurrentTime,
            simulatedElapsedSeconds,
          )
        } else if (participant.progress.bike.distance < 30000) {
          // Ciclismo
          utils.updateData(
            participant,
            "bike",
            30000,
            12.5 * speedMultiplier,
            simulatedCurrentTime,
            simulatedElapsedSeconds,
          )
        }
      }
    })

    // Asignar medallas después de actualizar a todos los participantes
    utils.assignMedals(participants)

    // Calcular las posiciones actuales
    calculatePositions(participants)

    // Guardar los participantes actualizados
    localStorage.setItem("participants", JSON.stringify(participants))

    // Actualizar la tabla con las nuevas posiciones
    updateTable()
  }

  /**
   * Calcula las posiciones actuales de los participantes
   * @param {Array} participants - Lista de participantes
   */
  function calculatePositions(participants) {
    // Filtrar participantes activos
    const activeParticipants = participants.filter((p) => p.willParticipate && !p.disqualified)

    // Ordenar por distancia total (mayor a menor)
    activeParticipants.sort((a, b) => b.totalDistance - a.totalDistance)

    // Asignar posiciones
    activeParticipants.forEach((participant, index) => {
      participant.position = index + 1
    })
  }

  /**
   * Reinicia la simulación del triatlón
   */
  function restartSimulation() {
    if (
      confirm(
        "¿Está seguro de que desea reiniciar la simulación? Esto reiniciará el progreso de todos los participantes.",
      )
    ) {
      // Detener la simulación en curso
      if (interval) clearInterval(interval)

      // Reiniciar el progreso de todos los participantes
      const participants = JSON.parse(localStorage.getItem("participants")) || []
      participants.forEach((participant) => {
        participant.progress = {
          walk: { distance: 0.0, time: "00:00:00", start: "N/A", end: "N/A", simStart: undefined },
          swim: { distance: 0.0, time: "00:00:00", start: "N/A", end: "N/A", simStart: undefined },
          bike: { distance: 0.0, time: "00:00:00", start: "N/A", end: "N/A", simStart: undefined },
        }
        participant.totalDistance = 0.0
        participant.totalTime = "00:00:00"
        participant.finished = false
        participant.disqualified = false
        participant.finishTime = undefined
        participant.medal = null
        participant.position = 0
      })

      // Guardar los participantes reiniciados
      localStorage.setItem("participants", JSON.stringify(participants))

      // Reiniciar la interfaz
      const startTimeElem = document.getElementById("start-time")
      if (startTimeElem) startTimeElem.textContent = "HORA DE INICIO:"

      // Reiniciar las posiciones anteriores
      previousPositions = {}

      // Actualizar la tabla
      updateTable()

      alert("La simulación ha sido reiniciada.")
    }
  }

  /**
   * Actualiza la tabla de participantes con los datos actuales
   */
  function updateTable() {
    const tableBody = document.getElementById("progress-table-body")
    if (!tableBody) return

    // Obtener los participantes
    let participants = JSON.parse(localStorage.getItem("participants")) || []
    participants = participants.filter((p) => p.willParticipate)

    // Ordenar por posición (menor a mayor)
    participants.sort((a, b) => {
      // Los que han terminado van primero, ordenados por tiempo de finalización
      if (a.finished && b.finished) {
        return a.finishTime - b.finishTime
      } else if (a.finished) {
        return -1
      } else if (b.finished) {
        return 1
      }

      // Luego por posición (distancia recorrida)
      return (a.position || 999) - (b.position || 999)
    })

    // Generar el HTML para la tabla
    let newHtml = ""
    participants.forEach((participant) => {
      // Determinar el color de fondo basado en la medalla
      let rowStyle = ""
      if (participant.medal === "gold") {
        rowStyle = 'style="background-color: #FFD700;"' // Gold
      } else if (participant.medal === "silver") {
        rowStyle = 'style="background-color: #C0C0C0;"' // Silver
      } else if (participant.medal === "bronze") {
        rowStyle = 'style="background-color: #CD7F32;"' // Bronze
      }

      // Determinar si la posición ha cambiado
      const positionChanged =
        previousPositions[participant.id] !== undefined && previousPositions[participant.id] !== participant.position

      // Clase para la animación
      const animationClass = positionChanged ? "position-changed" : ""

      newHtml += `
                <tr data-id="${participant.id}" 
                    class="table-row ${animationClass} ${participant.disqualified ? "disqualified" : ""}" 
                    ${rowStyle}>
                    <td>${participant.id}</td>
                    <td>${participant.name}</td>
                    <td>${participant.municipality}</td>
                    <td>${participant.age}</td>
                    <td>${participant.willParticipate ? "Activo" : "Inactivo"}</td>
                    <td>${participant.progress.walk.start || "N/A"}</td>
                    <td>${participant.progress.walk.end || "N/A"}</td>
                    <td>${utils.formatDistance(participant.progress.walk.distance)}</td>
                    <td>${participant.progress.walk.time}</td>
                    <td>${participant.progress.swim.start || "N/A"}</td>
                    <td>${participant.progress.swim.end || "N/A"}</td>
                    <td>${utils.formatDistance(participant.progress.swim.distance)}</td>
                    <td>${participant.progress.swim.time}</td>
                    <td>${participant.progress.bike.start || "N/A"}</td>
                    <td>${participant.progress.bike.end || "N/A"}</td>
                    <td>${utils.formatDistance(participant.progress.bike.distance)}</td>
                    <td>${participant.progress.bike.time}</td>
                    <td>${utils.formatDistance(participant.totalDistance)}</td>
                    <td>${participant.totalTime || "00:00:00"}</td>
                    <td>${participant.finished ? participant.progress.bike.end : "N/A"}</td>
                    <td>${participant.disqualified ? "Descalificado" : "Activo"}</td>
                    <td>
                        ${
                          !participant.disqualified && !participant.finished
                            ? `<button class="disqualify-button" onclick="progressModule.disqualifyParticipant('${participant.id}')">Descalificar</button>`
                            : "N/A"
                        }
                    </td>
                </tr>
            `
    })

    // Mantener al menos 3 filas visibles en la tabla
    const numBlankRows = Math.max(0, 3 - participants.length)
    for (let i = 0; i < numBlankRows; i++) {
      newHtml += `<tr class="blank-row"><td colspan="22">&nbsp;</td></tr>`
    }

    // Actualizar el contenido de la tabla
    tableBody.innerHTML = newHtml
  }

  /**
   * Descalifica a un participante
   * @param {string} id - ID del participante a descalificar
   */
  function disqualifyParticipant(id) {
    const participants = JSON.parse(localStorage.getItem("participants")) || []
    const participant = participants.find((p) => p.id === id)

    if (participant && !participant.disqualified) {
      participant.disqualified = true
      localStorage.setItem("participants", JSON.stringify(participants))

      // Recalcular posiciones y medallas
      calculatePositions(participants)
      utils.assignMedals(participants)
      localStorage.setItem("participants", JSON.stringify(participants))

      updateTable()
    }
  }

  // Exponer las funciones públicas
  return {
    init,
    startSimulation,
    restartSimulation,
    updateSimulation,
    updateTable,
    disqualifyParticipant,
    restoreSimulationMode,
  }
})()

// Exponer el módulo globalmente
window.progressModule = progressModule

// Inicializar el módulo cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", progressModule.init)

