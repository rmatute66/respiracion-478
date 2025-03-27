import React, { useState, useEffect, useRef } from "react";

// Duraciones fijas para cada fase
const DURACIONES_FASE = {
  inhalar: 4,
  retener: 7,
  exhalar: 8,
};

// Colores para cada fase
const COLORES_FASE = {
  inhalar: "#4A90E2",
  retener: "#F5A623",
  exhalar: "#7ED321",
};

// Nombres mostrados en pantalla
const NOMBRES_FASE = {
  inhalar: "Inhalar",
  retener: "Retener",
  exhalar: "Exhalar",
};

// Inyecta un pequeño bloque de estilos globales para la animación
function GlobalStyles() {
  return (
    <style>{`
      @keyframes pulseAnim {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.7;
        }
      }

      .container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #f3f3f3;
        padding: 1rem;
      }

      .title {
        font-size: 3rem;
        margin-bottom: 1rem;
        text-align: center;
      }

      .countdown {
        font-size: 4rem;
        text-align: center;
      }

      .phaseTitle {
        font-size: 5rem;
        font-weight: bold;
        margin-bottom: 1rem;
        text-align: center;
        animation: pulseAnim 2s infinite;
      }

      .circleWrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 1rem;
      }

      .info {
        margin-bottom: 1rem;
        text-align: center;
      }

      .btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 0.25rem;
        color: #fff;
        background-color: #28a745;
        cursor: pointer;
        font-size: 1rem;
      }

      .btn:hover {
        background-color: #218838;
      }

      .configBox {
        background: #fff;
        padding: 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        text-align: center;
      }

      .inputField {
        display: block;
        width: 100%;
        max-width: 200px;
        margin: 0 auto 1rem auto;
        padding: 0.5rem;
        font-size: 1rem;
        border: 1px solid #ccc;
        border-radius: 0.25rem;
        text-align: center;
      }

      .circle {
        width: 160px;
        height: 160px;
        border-radius: 50%;
        animation: pulseAnim 2s infinite;
        transition: transform 0.3s ease;
      }
    `}</style>
  );
}

export default function Temporizador478() {
  const [etapa, setEtapa] = useState("config"); // "config", "countdown", "ejercicio", "finalizado"
  const [minutosInput, setMinutosInput] = useState("");
  const [tiempoGlobal, setTiempoGlobal] = useState(0);
  const [cuentaAtras, setCuentaAtras] = useState(5);
  const [fase, setFase] = useState("inhalar");
  const [tiempoFase, setTiempoFase] = useState(DURACIONES_FASE.inhalar);
  const [pausado, setPausado] = useState(false);

  // Referencia para controlar los intervalos
  const intervaloRef = useRef(null);

  // Objetos de audio (rutas en public/sounds/)
  const audioInhalar = useRef(new Audio("/sounds/campanilla.mp3"));
  const audioRetener = useRef(new Audio("/sounds/gongo.mp3"));
  const audioExhalar = useRef(new Audio("/sounds/cuenco.mp3"));

  // Inicia la cuenta atrás si la duración en minutos es válida
  const iniciarEjercicio = () => {
    const totalSegundos = parseInt(minutosInput, 10) * 60;
    if (!isNaN(totalSegundos) && totalSegundos > 0) {
      setTiempoGlobal(totalSegundos);
      setEtapa("countdown");
    }
  };

  // Maneja la cuenta atrás inicial (5s antes de arrancar el ejercicio)
  useEffect(() => {
    if (etapa === "countdown") {
      intervaloRef.current = setInterval(() => {
        setCuentaAtras((prev) => {
          if (prev <= 1) {
            clearInterval(intervaloRef.current);
            // Arranca la primera fase
            setFase("inhalar");
            setTiempoFase(DURACIONES_FASE.inhalar);
            audioInhalar.current.play(); // Sonido de inicio de fase inhalar
            setEtapa("ejercicio");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervaloRef.current);
  }, [etapa]);

  // Maneja el temporizador global y el temporizador de fase
  useEffect(() => {
    if (etapa === "ejercicio" && !pausado) {
      intervaloRef.current = setInterval(() => {
        // Disminuye el tiempo global
        setTiempoGlobal((prev) => {
          if (prev <= 1) {
            clearInterval(intervaloRef.current);
            setEtapa("finalizado");
            return 0;
          }
          return prev - 1;
        });
        // Disminuye el tiempo de fase
        setTiempoFase((prev) => {
          if (prev <= 1) {
            // Cambiar a la siguiente fase
            let nuevaFase;
            if (fase === "inhalar") {
              nuevaFase = "retener";
            } else if (fase === "retener") {
              nuevaFase = "exhalar";
            } else {
              nuevaFase = "inhalar";
            }

            // Reproduce sonido de la nueva fase
            if (nuevaFase === "inhalar") audioInhalar.current.play();
            if (nuevaFase === "retener") audioRetener.current.play();
            if (nuevaFase === "exhalar") audioExhalar.current.play();

            setFase(nuevaFase);
            return DURACIONES_FASE[nuevaFase];
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervaloRef.current);
  }, [etapa, pausado, fase]);

  // Formatea el tiempo en mm:ss
  const formatearTiempo = (segundos) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Devuelve estilo dinámico para el círculo según la fase
  const estiloCirculo = () => {
    let scale = 1;
    if (fase === "inhalar") scale = 1.1;
    else if (fase === "exhalar") scale = 0.9;

    return {
      backgroundColor: COLORES_FASE[fase],
      transform: `scale(${scale})`,
    };
  };

  // Alterna entre pausar y reanudar
  const togglePausa = () => {
    setPausado((prev) => !prev);
  };

  return (
    <div className="container">
      {/* Inyectamos estilos globales para animación */}
      <GlobalStyles />

      {etapa === "config" && (
        <div className="configBox">
          <h1 className="title">Temporizador de Respiración 4-7-8</h1>
          <input
            type="number"
            placeholder="Duración total (min)"
            value={minutosInput}
            onChange={(e) => setMinutosInput(e.target.value)}
            className="inputField"
          />
          <button onClick={iniciarEjercicio} className="btn" style={{backgroundColor:'#007bff'}}>
            Comenzar
          </button>
        </div>
      )}

      {etapa === "countdown" && (
        <div className="countdown">
          Comenzando en {cuentaAtras}
        </div>
      )}

      {etapa === "ejercicio" && (
        <>
          {/* Nombre de la fase */}
          <div
            className="phaseTitle"
            style={{ color: COLORES_FASE[fase] }}
          >
            {NOMBRES_FASE[fase]}
          </div>

          {/* Círculo animado */}
          <div className="circleWrapper">
            <div className="circle" style={estiloCirculo()} />
          </div>

          {/* Temporizadores */}
          <div className="info">
            Fase: {fase} — {tiempoFase}s / {DURACIONES_FASE[fase]}s
          </div>
          <div className="info">
            Tiempo restante: {formatearTiempo(tiempoGlobal)}
          </div>

          {/* Botón de Pausa/Reanudar */}
          <button onClick={togglePausa} className="btn">
            {pausado ? "Reanudar" : "Pausar"}
          </button>
        </>
      )}

      {etapa === "finalizado" && (
        <div className="title">
          Ejercicio terminado
        </div>
      )}
    </div>
  );
}
