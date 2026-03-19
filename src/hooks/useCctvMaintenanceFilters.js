import { useState, useMemo } from "react";

export function useCctvMaintenanceFilters(historial = []) {
  const [filtros, setFiltros] = useState({
    OTROSI7: true,
    OTROSI20: true,
    SERVIDORES: true,
    CISA: true
  });

  const datosFiltrados = useMemo(() => {
    if (!Array.isArray(historial)) return [];

    return historial.filter(reg => {
      // 1. Limpieza de datos
      const obs = (reg.observacion || "").toUpperCase().replace(/\s+/g, ''); // Quitamos TODOS los espacios
      const fase = (reg.fase || "").toUpperCase().replace(/\s+/g, '');

      // 2. Definición de OS20 (Buscamos el patrón "OTROSI20" o "OS20" sin espacios)
      const esOS20 = obs.includes("OTROSI20") || 
                     obs.includes("OS20") || 
                     fase.includes("OTROSI20") || 
                     fase.includes("OS20");

      // 3. Clasificación del resto (si no son OS20)
      const esServidor = !esOS20 && fase.includes("SERVIDOR");
      const esCisa = !esOS20 && !esServidor && (fase.includes("CISA") || fase.includes("EXTERIOR"));
      const esOS7 = !esOS20 && !esServidor && !esCisa;

      // 4. Lógica de los Checkboxes
      if (esOS20 && !filtros.OTROSI20) return false;
      if (esServidor && !filtros.SERVIDORES) return false;
      if (esCisa && !filtros.CISA) return false;
      if (esOS7 && !filtros.OTROSI7) return false;

      return true;
    });
  }, [historial, filtros]);

  const toggleFiltro = (tipo) => {
    setFiltros(prev => ({ ...prev, [tipo]: !prev[tipo] }));
  };

  return { filtros, toggleFiltro, datosFiltrados };
}