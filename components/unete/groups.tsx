// ── GROUPS data — Únete Page ──
// Centralised group definitions with their form selects.
import { IconViolin, IconMic, IconWind, IconDrum, IconSax, IconCello } from '@/components/ui/Icons';
import { Group } from './types';

export const GROUPS: Group[] = [
  {
    id: 'orquesta',
    name: 'Orquesta',
    description: 'Nuestra formación principal. Abiertos a músicos de todas las cuerdas, viento y percusión clásica.',
    color: 'var(--clr-primary)',
    icon: <IconViolin />,
    formExtra: (
      <select name="instrument" required className="form-control" style={{ background: '#fff' }} defaultValue="">
        <option value="" disabled>Instrumento *</option>
        <optgroup label="Cuerdas">
          <option>Violín</option><option>Viola</option><option>Violonchelo</option><option>Contrabajo</option>
        </optgroup>
        <optgroup label="Viento Madera">
          <option>Flauta / Flautín</option><option>Oboe / Corno Inglés</option><option>Clarinete</option><option>Fagot / Contrafagot</option>
        </optgroup>
        <optgroup label="Viento Metal">
          <option>Trompa</option><option>Trompeta</option><option>Trombón / Trombón Bajo</option><option>Tuba</option>
        </optgroup>
        <optgroup label="Percusión / Otros">
          <option>Percusión / Timbales</option><option>Piano / Celesta</option><option>Arpa</option><option>Otro Instrumento</option>
        </optgroup>
      </select>
    ),
  },
  {
    id: 'coro',
    name: 'Coro',
    description: 'La voz de la comunidad. Buscamos sopranos, altos, tenores y bajos con pasión por cantar en grupo.',
    color: '#8e44ad',
    icon: <IconMic />,
    formExtra: (
      <select name="instrument" required className="form-control" style={{ background: '#fff' }} defaultValue="">
        <option value="" disabled>Tipo de voz *</option>
        <option>Soprano</option><option>Alto / Contralto</option><option>Tenor</option><option>Bajo / Barítono</option><option>Aún no lo sé</option>
      </select>
    ),
  },
  {
    id: 'bigband',
    name: 'Big Band',
    description: 'Si el Jazz, el Swing o el Blues son lo tuyo. Metales, saxofones y base rítmica para aportar ritmo vital.',
    color: '#1a2a4b',
    icon: <IconSax />,
    formExtra: (
      <select name="instrument" required className="form-control" style={{ background: '#fff' }} defaultValue="">
        <option value="" disabled>Instrumento *</option>
        <option>Saxofón Alto</option><option>Saxofón Tenor</option><option>Saxofón Barítono</option>
        <option>Trompeta</option><option>Trombón</option><option>Batería</option><option>Guitarra</option>
        <option>Bajo / Contrabajo</option><option>Piano</option>
      </select>
    ),
  },
  {
    id: 'flautas',
    name: 'Ensemble Flautas',
    description: 'Agrupación centrada en la familia de las flautas traversas, desde el piccolo hasta la flauta bajo.',
    color: '#16a085',
    icon: <IconWind />,
    formExtra: (
      <select name="instrument" required className="form-control" style={{ background: '#fff' }} defaultValue="">
        <option value="" disabled>Instrumento *</option>
        <option>Flauta Travesera</option><option>Flautín (Piccolo)</option><option>Flauta en Sol (Alto)</option><option>Flauta Bajo</option>
      </select>
    ),
  },
  {
    id: 'metales',
    name: 'Ensemble Metales',
    description: 'Para músicos que toquen trompeta, trompa, trombón o tuba. Potencia y brillo en perfecta armonía.',
    color: '#d35400',
    icon: <IconDrum />,
    formExtra: (
      <select name="instrument" required className="form-control" style={{ background: '#fff' }} defaultValue="">
        <option value="" disabled>Instrumento *</option>
        <option>Trompeta</option><option>Trompa</option><option>Trombón</option><option>Tuba</option><option>Otro Metal</option>
      </select>
    ),
  },
  {
    id: 'chelos',
    name: 'Ensemble Violonchelos',
    description: 'Un espacio exclusivo dedicado al hermoso timbre del violonchelo. Una formación única en la isla.',
    color: '#c0392b',
    icon: <IconCello />,
    formExtra: (
      <input name="instrument" type="text" value="Violonchelo" readOnly className="form-control" style={{ background: '#f8f9fa' }} />
    ),
  },
];
