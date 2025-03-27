import { useEffect, useState, useRef } from "react";

const DURACIONES = {
  inhalar: 4,
  retener: 7,
  exhalar: 8,
};

const SONIDOS = {
  inhalar: new Audio("/sounds/campanilla.mp3"),
  retener: new Audio("/sounds/gongo.mp3"),
  exhalar: new Audio("/sounds/cuenco.mp3"),
};

const FASES = ["inhalar", "retener", "exhalar"];
const COLORES = {
  inhalar: "#4A90E2",
  retener: "#F5A623",
  exhalar: "#7ED321",
};

export default function Temporizador478() {
  const [faseActual, setFaseActual] = useState(null);
  const [tiempoFase, setTiempoFase] = useState(0);
  const [tiempoTotal, setTiempoTotal] = useState(180);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [enEjecucion, setEnEjecucion] = useState(false);
  const [configurado, setConfigurado] = useState(false);
  const [cuentaAtras, setCuentaAtras] = useState(5);
  const intervaloRef = useRef(null);

  const avanzarFase = (fase) => {
    const siguienteFase = FASES[(FASES.indexOf(fase) + 1) % FASES.length];
    setFaseActual(siguienteFase);
    setTiempoFase(0);
    SONIDOS[siguienteFase].play();
  };

  const iniciarEjercicio = () => {
    setTiempoRestante(tiempoTotal);
    setCuentaAtras(5);
    setConfigurado(true);
  };

  const pausar = () => setEnEjecucion(false);
  const reanudar = () => setEnEjecucion(true);

  useEffect(() => {
    if (configurado && cuentaAtras > 0) {
      const t = setTimeout(() => setCuentaAtras(cuentaAtras - 1), 1000);
      return () => clearTimeout(t);
    }
    if (configurado && cuentaAtras === 0) {
      setFaseActual("inhalar");
      SONIDOS["inhalar"].play();
      setEnEjecucion(true);
    }
  }, [configurado, cuentaAtras]);

  useEffect(() => {
    if (!enEjecucion || tiempoRestante <= 0) return;

    intervaloRef.current = setInterval(() => {
      setTiempoFase((prev) => {
        if (prev + 1 >= DURACIONES[faseActual]) {
          avanzarFase(faseActual);
          return 0;
        }
        return prev + 1;
      });
      setTiempoRestante((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervaloRef.current);
  }, [enEjecucion, faseActual]);

  const renderControles = () => (
    <div className="flex gap-4 justify-center mt-4">
      {!enEjecucion ? (
        <button onClick={reanudar} className="px-4 py-2 bg-green-600 text-white rounded-xl">Reanudar</button>
      ) : (
        <button onClick={pausar} className="px-4 py-2 bg-red-600 text-white rounded-xl">Pausar</button>
      )}
    </div>
  );

  const renderConfiguracion = () => (
    <div className="flex flex-col items-center gap-4">
      <label className="text-lg font-semibold">Duración total del ejercicio (en minutos):</label>
      <input
        type="number"
        min={1}
        defaultValue={3}
        onChange={(e) => setTiempoTotal(Number(e.target.value) * 60)}
        className="border p-2 rounded-xl text-center w-24"
      />
      <button onClick={iniciarEjercicio} className="px-4 py-2 bg-blue-600 text-white rounded-xl">Comenzar</button>
    </div>
  );

  const renderTemporizador = () => (
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-40 h-40 rounded-full transition-all duration-1000"
        style={{
          backgroundColor: COLORES[faseActual],
          transform:
            faseActual === "inhalar"
              ? "scale(1.2)"
              : faseActual === "exhalar"
              ? "scale(0.8)"
              : "scale(1.0)",
        }}
      ></div>
      <div className="text-2xl font-bold capitalize">{faseActual}</div>
      <div className="text-xl">Tiempo fase: {tiempoFase}s / {DURACIONES[faseActual]}s</div>
      <div className="text-lg text-gray-600">Tiempo restante total: {Math.floor(tiempoRestante / 60)}:{String(tiempoRestante % 60).padStart(2, '0')}</div>
      {renderControles()}
    </div>
  );

  const renderCuentaAtras = () => (
    <div className="text-5xl font-bold text-center">Empieza en... {cuentaAtras}</div>
  );

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      {!configurado && renderConfiguracion()}
      {configurado && cuentaAtras > 0 && renderCuentaAtras()}
      {configurado && cuentaAtras === 0 && renderTemporizador()}
    </div>
  );
}
