"use client";

type CategoryId = number | "todas" | "documentos";

interface Cat {
  id: number;
  name: string;
  eventDate?: string | null;
}

interface Props {
  activeCategoryId: CategoryId;
  onSelect: (id: CategoryId) => void;
  categories: Cat[];
  /** Llamado tras elegir filtro (p. ej. cerrar drawer móvil) */
  onAfterSelect?: () => void;
  /** Cabecera «Archivos» (el drawer móvil usa su propia cabecera) */
  showBrand?: boolean;
}

export default function RepoFiltersNav({
  activeCategoryId,
  onSelect,
  categories,
  onAfterSelect,
  showBrand = true,
}: Props) {
  const pick = (id: CategoryId) => {
    onSelect(id);
    onAfterSelect?.();
  };

  return (
    <>
      {showBrand && (
        <div className="sidebar-brand">
          <h4>Archivos</h4>
        </div>
      )}

      <nav className="filter-group" aria-label="Tipo de archivo">
        <button
          type="button"
          className={`filter-btn ${activeCategoryId === "todas" ? "active" : ""}`}
          onClick={() => pick("todas")}
        >
          <i className="fa-solid fa-music" aria-hidden /> Partituras
        </button>
        <button
          type="button"
          className={`filter-btn ${activeCategoryId === "documentos" ? "active" : ""}`}
          onClick={() => pick("documentos")}
        >
          <i className="fa-solid fa-file-lines" aria-hidden /> Documentos
        </button>
      </nav>

      <div className="sidebar-divider">Programas</div>

      <nav className="filter-group" aria-label="Filtrar por programa o concierto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`filter-btn ${activeCategoryId === cat.id ? "active" : ""}`}
            onClick={() => pick(cat.id)}
          >
            <i className="fa-solid fa-compact-disc" aria-hidden />
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
              <span>{cat.name}</span>
              {cat.eventDate && (
                <span style={{ fontSize: "0.65rem", color: "#478AC9", fontWeight: 800 }}>
                  {new Date(cat.eventDate).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    timeZone: "UTC",
                  })}
                </span>
              )}
            </div>
          </button>
        ))}
      </nav>
    </>
  );
}
