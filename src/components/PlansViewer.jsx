import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "pdfjs-dist/web/pdf_viewer.css";
import { useSearchParams, useLocation } from "react-router-dom";
import SearchMain from "./SearchMain";
import useMaintenancePopup from "../hooks/useMaintenancePopup.jsx";
import "../style/PlansViewerNew.css";

// Configuración obligatoria del worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function PlansViewer() {
  /* ================= ROUTER / STATE MANAGEMENT ================= */
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Prioridad de carga del PDF: Query Param -> Estado de Navegación -> Cache Local
  const pdfFromQuery = searchParams.get("pdf");
  const pdfFromState = location.state?.pdfUrl;
  const savedState = JSON.parse(localStorage.getItem("pdfState") || "null");

  const pdfUrl = pdfFromQuery || pdfFromState || savedState?.url || null;

  /* ================= REFS ================= */
  const containerRef = useRef(null);    // El scroll container (Viewport del usuario)
  const wrapperRef = useRef(null);      // El contenedor real del contenido (Canvas + Capas)
  const canvasRef = useRef(null);
  const highlightsRef = useRef(null);
  const pdfDocRef = useRef(null);
  const renderTaskRef = useRef(null);
  const pageRef = useRef(savedState?.page || 1);

  /* ================= STATE ================= */
  const [scale, setScale] = useState(savedState?.scale || 1.5);
  const [fileName, setFileName] = useState(null);
  const [matches, setMatches] = useState([]);

  /* ================= POPUP HOOK ================= */
  const { openPopup, PopupComponent } = useMaintenancePopup();

  /* ================= LOAD FROM FILE ================= */
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    pdfDocRef.current = pdf;
    pageRef.current = 1;
    await renderPage(pageRef.current, scale);
  };

  /* ================= LOAD FROM URL ================= */
  const loadPdfFromUrl = async (url) => {
    if (!url) return;
    try {
      setFileName(url.split("/").pop());
      const pdf = await pdfjsLib.getDocument({ url }).promise;
      pdfDocRef.current = pdf;

      // Persistir estado para recargas
      localStorage.setItem("pdfState", JSON.stringify({
        url, page: pageRef.current, scale,
      }));

      await renderPage(pageRef.current, scale);
    } catch (err) {
      console.error("Error cargando PDF:", err);
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    if (pdfUrl && canvasRef.current) {
      loadPdfFromUrl(pdfUrl);
    }
  }, [pdfUrl]);

  /* ================= RENDER PAGE (CORE) ================= */
  const renderPage = async (pageNum, zoom) => {
    const pdf = pdfDocRef.current;
    if (!pdf) return;

    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: zoom });

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Cancelar renderizados previos para evitar parpadeos o superposiciones
    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel(); } catch (_) {}
    }

    // Sincronizar dimensiones físicas de todas las capas con el viewport del PDF
    const widthPx = `${viewport.width}px`;
    const heightPx = `${viewport.height}px`;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (highlightsRef.current) {
      highlightsRef.current.style.width = widthPx;
      highlightsRef.current.style.height = heightPx;
    }

    // Sincronizamos el wrapper para que el PopupComponent use el mismo sistema de coordenadas
    if (wrapperRef.current) {
      wrapperRef.current.style.width = widthPx;
      wrapperRef.current.style.height = heightPx;
    }

    const renderContext = { canvasContext: ctx, viewport };
    renderTaskRef.current = page.render(renderContext);

    try {
      await renderTaskRef.current.promise;
      // Dibujamos marcas solo cuando el canvas está listo para asegurar precisión milimétrica
      drawHighlights(matches, viewport);
    } catch (err) {
      if (err?.name !== "RenderingCancelledException") console.error(err);
    }
  };

  /* ================= DRAW HIGHLIGHTS ================= */
  const drawHighlights = (data, viewport) => {
    const layer = highlightsRef.current;
    if (!layer) return;

    layer.innerHTML = "";

    data.forEach((m) => {
      // Convertir coordenadas lógicas del PDF a píxeles de pantalla según el zoom
      const [x1, y1, x2, y2] = viewport.convertToViewportRectangle([
        m.x, m.y, m.x + m.width, m.y + m.height,
      ]);

      const centerX = (x1 + x2) / 2;
      const centerY = (y1 + y2) / 2;

      const mark = document.createElement("div");
mark.className = "checkmark"; 

mark.onclick = (e) => {
  e.stopPropagation();
  // centerX y centerY ya vienen calculados con el viewport.convertToViewportRectangle
  // esto asegura que el popup sepa exactamente en qué píxel del canvas debe aparecer
  openPopup(centerX, centerY, m.text); 
};

      mark.style.left = `${centerX}px`;
      mark.style.top = `${centerY}px`;

      layer.appendChild(mark);
    });
  };

  /* ================= SEARCH LOGIC ================= */
  const handleSearch = async (term) => {
    if (!term || !pdfDocRef.current) return;

    const page = await pdfDocRef.current.getPage(pageRef.current);
    const viewport = page.getViewport({ scale });
    const text = await page.getTextContent();
    const regex = new RegExp(term, "gi");
    const found = [];

    text.items.forEach((item) => {
      let m;
      while ((m = regex.exec(item.str || ""))) {
        found.push({
          x: item.transform[4],
          y: item.transform[5],
          width: item.width || 10,
          height: Math.abs(item.transform[3]) || 10,
          text: term.toUpperCase(),
        });
      }
    });

    setMatches(found);
    drawHighlights(found, viewport);

    if (found.length > 0) {
      centerOnMatch(found[0], viewport);
    }
  };

  /* ================= ZOOM (CTRL + SCROLL) ================= */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setScale((prev) => {
        const next = e.deltaY > 0 ? prev - 0.15 : prev + 0.15;
        return Math.min(Math.max(next, 0.5), 4);
      });
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, []);

  /* ================= RE-RENDER ON ZOOM ================= */
  useEffect(() => {
    if (pdfDocRef.current) {
      renderPage(pageRef.current, scale);
    }
  }, [scale]);

  /* ================= CENTER MATCH ================= */
  const centerOnMatch = (match, viewport) => {
    const container = containerRef.current;
    if (!container || !match) return;

    const [x1, y1, x2, y2] = viewport.convertToViewportRectangle([
      match.x, match.y, match.x + match.width, match.y + match.height,
    ]);

    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;

    container.scrollTo({
      left: Math.max(0, centerX - container.clientWidth / 2),
      top: Math.max(0, centerY - container.clientHeight / 2),
      behavior: "smooth",
    });
  };

  /* ================= UI LAYOUT (C-CURE STYLE) ================= */
  return (
    <div className="plans-viewer">
      {/* Toolbar Superior */}
      <SearchMain onSearch={handleSearch} />

      {/* Selector de archivo (si no hay PDF cargado) */}
      {!pdfUrl && (
        <div className="file-input-container">
          <input type="file" accept="application/pdf" onChange={handleFile} />
          {fileName && <p className="file-name">Current: {fileName}</p>}
        </div>
      )}

      {/* Área del Mapa / Monitor */}
      <div className="pdf-container" ref={containerRef}>
        {/* El wrapper es vital: asegura que canvas, marcas y popup escalen igual */}
        <div className="pdf-wrapper" ref={wrapperRef}>
          <canvas ref={canvasRef} />
          <div className="highlights-layer" ref={highlightsRef} />
          {/* El popup ahora se ancla al lado del punto verde dentro del mismo sistema */}
          <PopupComponent />
        </div>
      </div>
    </div>
  );
}