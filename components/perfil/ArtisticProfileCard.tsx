import React from 'react';
import { Music2, AlertCircle } from 'lucide-react';

interface ArtisticProfileCardProps {
  estructuras: any[];
}

export const ArtisticProfileCard = ({ estructuras }: ArtisticProfileCardProps) => {
  return (
    <div className="profile-card">
      <div className="profile-card__header profile-card__header--gold">
        <Music2 size={17} />
        <h3 className="profile-card__title">Perfil Artístico</h3>
      </div>

      <div className="profile-card__body">
        {estructuras && estructuras.length > 0 ? (
          <div className="profile-artistic-list">
            {estructuras.map((est: any) => (
              <div key={est.id} className={`profile-artistic-item${est.activo ? '' : ' profile-artistic-item--inactive'}`}>
                <div className="profile-artistic-item__header">
                  <span className="profile-artistic-item__name">{est.seccion?.seccion || est.seccion}</span>
                  <span className={`profile-artistic-item__status${est.activo ? ' profile-artistic-item__status--active' : ''}`}>
                    {est.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="profile-artistic-item__details">
                  {est.atril && (
                    <div className="profile-artistic-detail">
                      <strong>Atril:</strong> {est.atril}
                    </div>
                  )}
                  <div className="profile-artistic-detail">
                    <strong>Agrupación:</strong> {est.agrupacion?.agrupacion || est.agrupacion}
                  </div>
                  <div className="profile-artistic-detail">
                    <strong>Papel:</strong> {est.papel?.papel || est.papel}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="profile-empty-state">
            <AlertCircle size={28} />
            <p>Sin perfil artístico asignado.<br />Contacta con tu administrador.</p>
          </div>
        )}
        <p className="profile-readonly-notice">
          Para modificar estos datos, contacta con tu jefe de sección o un administrador.
        </p>
      </div>
    </div>
  );
};
