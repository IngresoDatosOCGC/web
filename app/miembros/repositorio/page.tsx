"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import RepoFiltersNav from "./RepoFiltersNav";

export default function RepositorioPageClient() {
  const { isLoaded } = useUser();
  const [scores, setScores] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | "todas" | "documentos">("todas");
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const isMobileRepo = useMediaQuery("(max-width: 900px)");

  useEffect(() => {
    if (!isMobileRepo) setFiltersOpen(false);
  }, [isMobileRepo]);

  useEffect(() => {
    if (!isMobileRepo || !filtersOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobileRepo, filtersOpen]);

  useEffect(() => {
    if (isLoaded) {
      Promise.all([
        fetch("/api/scores").then((res) => res.json()),
        fetch("/api/categories").then((res) => res.json()),
      ])
        .then(([scoresData, catsData]) => {
          setScores(Array.isArray(scoresData) ? scoresData : []);
          setCategories(Array.isArray(catsData) ? catsData : []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error cargando repositorio:", err);
          setLoading(false);
        });
    }
  }, [isLoaded]);

  const forceDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }
  };

  if (!isLoaded || loading) {
    return <div className="p-10 text-center">Cargando archivo...</div>;
  }

  const filteredScores =
    activeCategoryId === "documentos"
      ? scores.filter((s) => s.isDocument)
      : activeCategoryId === "todas"
        ? scores.filter((s) => !s.isDocument)
        : scores.filter((s) => s.categoryId === activeCategoryId && !s.isDocument);

  const activeCat = categories.find((c) => c.id === activeCategoryId);

  return (
    <div className="repositorio-fixed-view">
      {isMobileRepo && filtersOpen && (
        <button
          type="button"
          className="repo-filters-backdrop"
          aria-label="Cerrar menú de filtros"
          onClick={() => setFiltersOpen(false)}
        />
      )}

      {isMobileRepo && (
        <div className="repo-mobile-toolbar">
          <button
            type="button"
            className="repo-filters-toggle-btn"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
            aria-controls="repo-filters-drawer"
          >
            <span className="repo-filters-toggle-icon" aria-hidden>
              ☰
            </span>
            Filtros y programas
          </button>
        </div>
      )}

      <div className="repo-grid-container">
        {!isMobileRepo && (
          <aside className="repo-sidebar-nav" aria-label="Filtros del repositorio">
            <RepoFiltersNav
              activeCategoryId={activeCategoryId}
              onSelect={setActiveCategoryId}
              categories={categories}
            />
          </aside>
        )}

        {isMobileRepo && (
          <aside
            id="repo-filters-drawer"
            className={`repo-filters-drawer ${filtersOpen ? "is-open" : ""}`}
            aria-hidden={!filtersOpen}
          >
            <div className="repo-filters-drawer-head">
              <h4 className="repo-filters-drawer-title">Archivos</h4>
              <button
                type="button"
                className="repo-filters-drawer-close"
                onClick={() => setFiltersOpen(false)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <div className="repo-filters-drawer-body">
              <RepoFiltersNav
                activeCategoryId={activeCategoryId}
                onSelect={setActiveCategoryId}
                categories={categories}
                onAfterSelect={() => setFiltersOpen(false)}
                showBrand={false}
              />
            </div>
          </aside>
        )}

        <main className="repo-content-pane">
          <div className="pane-title-row">
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <h2>
                {activeCategoryId === "todas"
                  ? "Partituras"
                  : activeCategoryId === "documentos"
                    ? "Documentación"
                    : activeCat?.name}
              </h2>
              {activeCategoryId !== "todas" && activeCategoryId !== "documentos" && activeCat?.eventDate && (
                <p style={{ color: "#478AC9", fontWeight: 800, margin: 0 }}>
                  CONCIERTO:{" "}
                  {new Date(activeCat.eventDate).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </p>
              )}
            </div>
            <span className="results-chip">{filteredScores.length} Archivos</span>
          </div>

          <div className="inventory-stack">
            {filteredScores.length === 0 ? (
              <div className="inventory-empty">No hay archivos en esta categoría.</div>
            ) : (
              filteredScores.map((score) => (
                <div key={score.id} className="inventory-card">
                  <div className="card-main">
                    <div className="card-doc-icon">PDF</div>
                    <div className="card-text">
                      <h4>{score.title}</h4>
                      <div className="card-tags">
                        <span className="tag-category">{score.category?.name || "REPERTORIO"}</span>
                        {score.allowedRoles?.length > 0 && (
                          <span className="tag-roles">{score.allowedRoles.join(" • ")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="card-actions-group">
                    <a
                      href={score.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-action-s"
                    >
                      ABRIR
                    </a>
                    <button
                      type="button"
                      onClick={() => forceDownload(score.fileUrl, `${score.title}.pdf`)}
                      className="btn-action-p"
                    >
                      BAJAR
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
