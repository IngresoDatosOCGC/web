"use client";

import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/unete.css';

export default function UnetePage() {
  const [activeForm, setActiveForm] = useState<string | null>(null);

  const toggleForm = (formId: string) => {
    setActiveForm(activeForm === formId ? null : formId);
  };

  const handleSubmit = (e: React.FormEvent, group: string) => {
    e.preventDefault();
    alert(`Solicitud para ${group} enviada con éxito.`);
    setActiveForm(null);
  };

  return (
    <>
      <Header />
      <main>
        <div className="unete-header">
          <h1>Haz música con nosotros</h1>
          <p>Elige la agrupación que más te guste e inscríbete para formar parte de la OCGC.</p>
        </div>
        <section className="section animate-on-scroll">
          <div className="unete-grid">
            
            {/* Orquesta */}
            <div className="join-card">
              <div className="card-content">
                <div className="join-icon"><i className="fas fa-music"></i></div>
                <h3>Orquesta Sinfónica</h3>
                <p>Nuestra formación principal. Abiertos a músicos de todas las cuerdas, viento y percusión clásica.</p>
              </div>
              <div className="join-btn-container">
                <button onClick={() => toggleForm('form-orquesta')} className="btn btn-outline" style={{ width: '100%', cursor: 'pointer' }}>Inscribirse en Orquesta</button>
              </div>
            </div>

            {/* Coro */}
            <div className="join-card">
              <div className="card-content">
                <div className="join-icon"><i className="fas fa-microphone-alt"></i></div>
                <h3>Coro (COCGC)</h3>
                <p>La voz de la comunidad. Buscamos sopranos, altos, tenores y bajos con pasión por cantar en grupo.</p>
              </div>
              <div className="join-btn-container">
                <button onClick={() => toggleForm('form-coro')} className="btn btn-outline" style={{ width: '100%', cursor: 'pointer' }}>Inscribirse en Coro</button>
              </div>
            </div>

            {/* Ensemble de Flautas */}
            <div className="join-card">
              <div className="card-content">
                <div className="join-icon"><i className="fas fa-wind"></i></div>
                <h3>Ensemble de Flautas</h3>
                <p>Agrupación centrada en la familia de las flautas traversas, desde el piccolo hasta la flauta bajo.</p>
              </div>
              <div className="join-btn-container">
                <button onClick={() => toggleForm('form-flautas')} className="btn btn-outline" style={{ width: '100%', cursor: 'pointer' }}>Inscripción Flautas</button>
              </div>
            </div>

            {/* Ensemble de Metales */}
            <div className="join-card">
              <div className="card-content">
                <div className="join-icon"><i className="fas fa-bullhorn"></i></div>
                <h3>Ensemble de Metales</h3>
                <p>Queremos potenciar el brillo armónico. Para músicos que toquen trompeta, trompa, trombón o tuba.</p>
              </div>
              <div className="join-btn-container">
                <button onClick={() => toggleForm('form-metales')} className="btn btn-outline" style={{ width: '100%', cursor: 'pointer' }}>Inscripción Metales</button>
              </div>
            </div>

            {/* Ensemble de Violonchelos */}
            <div className="join-card">
              <div className="card-content">
                <div className="join-icon"><i className="fas fa-compact-disc"></i></div>
                <h3>Ensemble de Violonchelos</h3>
                <p>Un espacio exclusivo dedicado al hermoso timbre del violonchelo. Forma parte de esta formación única.</p>
              </div>
              <div className="join-btn-container">
                <button onClick={() => toggleForm('form-chelos')} className="btn btn-outline" style={{ width: '100%', cursor: 'pointer' }}>Inscripción Chelos</button>
              </div>
            </div>

            {/* Big Band */}
            <div className="join-card">
              <div className="card-content">
                <div className="join-icon"><i className="fas fa-drum"></i></div>
                <h3>Big Band</h3>
                <p>Si el Jazz, el Swing o el Blues son lo tuyo. Metales, saxofones y base rítmica para aportar ritmo vital.</p>
              </div>
              <div className="join-btn-container">
                <button onClick={() => toggleForm('form-bigband')} className="btn btn-outline" style={{ width: '100%', cursor: 'pointer' }}>Inscripción Big Band</button>
              </div>
            </div>

          </div>

          {/* Formularios Modales Globales */}
          {activeForm === 'form-orquesta' && (
            <div className="join-form-container" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }}>
              <div className="form-modal-content" style={{ position: 'relative', margin: 0 }}>
                <span className="close-modal" aria-label="Cerrar" onClick={() => toggleForm('form-orquesta')}>&times;</span>
                <h3>Inscripción: Orquesta Sinfónica</h3>
                <form onSubmit={(e) => handleSubmit(e, 'la Orquesta')}>
                  <input type="text" placeholder="Nombre y Apellidos *" required className="form-control" />
                  <input type="email" placeholder="Correo Electrónico *" required className="form-control" />
                  <input type="tel" placeholder="Teléfono *" required className="form-control" />
                  <input type="text" placeholder="Instrumento *" required className="form-control" />
                  <textarea placeholder="Experiencia (Opcional)" rows={3} className="form-control"></textarea>
                  <button type="submit" className="btn btn-primary btn-submit">Enviar Solicitud</button>
                </form>
              </div>
            </div>
          )}

          {activeForm === 'form-coro' && (
            <div className="join-form-container" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }}>
              <div className="form-modal-content" style={{ position: 'relative', margin: 0 }}>
                <span className="close-modal" aria-label="Cerrar" onClick={() => toggleForm('form-coro')}>&times;</span>
                <h3>Inscripción: Coro (COCGC)</h3>
                <form onSubmit={(e) => handleSubmit(e, 'el Coro')}>
                  <input type="text" placeholder="Nombre y Apellidos *" required className="form-control" />
                  <input type="email" placeholder="Correo Electrónico *" required className="form-control" />
                  <input type="tel" placeholder="Teléfono *" required className="form-control" />
                  <select required className="form-control" style={{ background: '#fff' }} defaultValue="">
                    <option value="" disabled>Tipo de voz *</option>
                    <option value="Soprano">Soprano</option>
                    <option value="Alto">Alto / Contralto</option>
                    <option value="Tenor">Tenor</option>
                    <option value="Bajo">Bajo / Barítono</option>
                    <option value="No lo se">Aún no lo sé</option>
                  </select>
                  <textarea placeholder="Resumen vocal (Opcional)" rows={3} className="form-control"></textarea>
                  <button type="submit" className="btn btn-primary btn-submit">Enviar Solicitud</button>
                </form>
              </div>
            </div>
          )}

          {/* Mismo patrón para otros ensembles */}
          {activeForm === 'form-flautas' && (
            <div className="join-form-container" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }}>
              <div className="form-modal-content" style={{ position: 'relative', margin: 0 }}>
                <span className="close-modal" aria-label="Cerrar" onClick={() => toggleForm('form-flautas')}>&times;</span>
                <h3>Inscripción: Ensemble de Flautas</h3>
                <form onSubmit={(e) => handleSubmit(e, 'Ensemble de Flautas')}>
                    <input type="text" placeholder="Nombre y Apellidos *" required className="form-control" />
                    <input type="email" placeholder="Correo Electrónico *" required className="form-control" />
                    <input type="tel" placeholder="Teléfono *" required className="form-control" />
                    <textarea placeholder="Explícanos tu experiencia flautística" rows={3} className="form-control" required></textarea>
                    <button type="submit" className="btn btn-primary btn-submit">Enviar Solicitud</button>
                </form>
              </div>
            </div>
          )}

          {activeForm === 'form-metales' && (
            <div className="join-form-container" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }}>
              <div className="form-modal-content" style={{ position: 'relative', margin: 0 }}>
                <span className="close-modal" aria-label="Cerrar" onClick={() => toggleForm('form-metales')}>&times;</span>
                <h3>Inscripción: Ensemble de Metales</h3>
                <form onSubmit={(e) => handleSubmit(e, 'Ensemble de Metales')}>
                    <input type="text" placeholder="Nombre y Apellidos *" required className="form-control" />
                    <input type="email" placeholder="Correo Electrónico *" required className="form-control" />
                    <input type="tel" placeholder="Teléfono *" required className="form-control" />
                    <select required className="form-control" style={{ background: '#fff' }} defaultValue="">
                        <option value="" disabled>Instrumento que interpretas *</option>
                        <option value="Trompeta">Trompeta</option>
                        <option value="Trompa">Trompa</option>
                        <option value="Trombon">Trombón</option>
                        <option value="Tuba">Tuba</option>
                        <option value="Otro">Otro Metal</option>
                    </select>
                    <button type="submit" className="btn btn-primary btn-submit">Enviar Solicitud</button>
                </form>
              </div>
            </div>
          )}
          
          {activeForm === 'form-chelos' && (
            <div className="join-form-container" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }}>
              <div className="form-modal-content" style={{ position: 'relative', margin: 0 }}>
                <span className="close-modal" aria-label="Cerrar" onClick={() => toggleForm('form-chelos')}>&times;</span>
                <h3>Inscripción: Ensemble de Violonchelos</h3>
                <form onSubmit={(e) => handleSubmit(e, 'Ensemble de Violonchelos')}>
                    <input type="text" placeholder="Nombre y Apellidos *" required className="form-control" />
                    <input type="email" placeholder="Correo Electrónico *" required className="form-control" />
                    <input type="tel" placeholder="Teléfono *" required className="form-control" />
                    <textarea placeholder="Experiencia con el Violonchelo (Opcional)" rows={3} className="form-control"></textarea>
                    <button type="submit" className="btn btn-primary btn-submit">Enviar Solicitud</button>
                </form>
              </div>
            </div>
          )}

          {activeForm === 'form-bigband' && (
             <div className="join-form-container" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }}>
             <div className="form-modal-content" style={{ position: 'relative', margin: 0 }}>
                 <span className="close-modal" aria-label="Cerrar" onClick={() => toggleForm('form-bigband')}>&times;</span>
                 <h3>Inscripción: Big Band</h3>
                 <form onSubmit={(e) => handleSubmit(e, 'la Big Band')}>
                 <input type="text" placeholder="Nombre y Apellidos *" required className="form-control" />
                 <input type="email" placeholder="Correo Electrónico *" required className="form-control" />
                 <input type="tel" placeholder="Teléfono *" required className="form-control" />
                 <select required className="form-control" style={{ background: '#fff' }} defaultValue="">
                     <option value="" disabled>Instrumento (Ej: Saxo Mib, Batería...) *</option>
                     <option value="Saxo Alto">Saxofón Alto</option>
                     <option value="Saxo Tenor">Saxofón Tenor</option>
                     <option value="Saxo Baritono">Saxofón Barítono</option>
                     <option value="Trompeta">Trompeta</option>
                     <option value="Trombon">Trombón</option>
                     <option value="Bateria">Batería</option>
                     <option value="Guitarra">Guitarra</option>
                     <option value="Bajo">Bajo / Contrabajo</option>
                     <option value="Piano">Piano</option>
                 </select>
                 <button type="submit" className="btn btn-primary btn-submit">Enviar Solicitud</button>
             </form>
             </div>
         </div>
          )}


        </section>
      </main>
    </>
  );
}
