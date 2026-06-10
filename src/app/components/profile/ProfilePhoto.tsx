import { useState } from 'react';
import type { ChangeEvent, RefObject } from 'react';
import { Camera, Trash2, X, Upload } from 'lucide-react';
import { C, R, S } from '../ui/design-system';

interface ProfilePhotoProps {
  photoUrl?: string | null;
  fullName: string;
  initials: string;
  accent: string;
  gradient: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDeletePhoto: () => void;
}

export function ProfilePhoto({
  photoUrl,
  fullName,
  initials,
  accent,
  gradient,
  inputRef,
  onPhotoChange,
  onDeletePhoto,
}: ProfilePhotoProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleDelete = () => {
    if (!window.confirm('Supprimer la photo de profil ?')) return;
    setPreviewOpen(false);
    onDeletePhoto();
  };

  return (
    <>
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
        <button
          type="button"
          onClick={() => photoUrl && setPreviewOpen(true)}
          aria-label={photoUrl ? 'Voir la photo de profil' : 'Avatar par défaut'}
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: gradient,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '24px',
            fontWeight: 800,
            margin: '0 auto',
            overflow: 'hidden',
            cursor: photoUrl ? 'zoom-in' : 'default',
            padding: 0,
          }}
        >
          {photoUrl ? (
            <img src={photoUrl} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : initials}
        </button>

        <input ref={inputRef} type="file" accept="image/*" onChange={onPhotoChange} style={{ display: 'none' }} />

        <button
          type="button"
          onClick={event => {
            event.stopPropagation();
            inputRef.current?.click();
          }}
          aria-label="Importer une photo"
          style={{ position: 'absolute', bottom: 0, right: 0, width: '22px', height: '22px', borderRadius: '50%', backgroundColor: accent, border: '2px solid white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Camera style={{ width: '11px', height: '11px', color: '#fff' }} />
        </button>
      </div>

      {previewOpen && photoUrl && (
        <div
          onClick={() => setPreviewOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(15, 23, 42, 0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
        >
          <div
            onClick={event => event.stopPropagation()}
            style={{ position: 'relative', maxWidth: 'min(720px, 92vw)', maxHeight: '86vh', backgroundColor: C.white, borderRadius: R, boxShadow: S.elevated, padding: '12px' }}
          >
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              aria-label="Fermer"
              style={{ position: 'absolute', top: '10px', right: '10px', width: '30px', height: '30px', borderRadius: R, border: 'none', backgroundColor: 'rgba(15, 23, 42, 0.72)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
            <img
              src={photoUrl}
              alt={fullName}
              style={{ display: 'block', maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: R }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', paddingTop: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  setPreviewOpen(false);
                  inputRef.current?.click();
                }}
                style={{ border: `1px solid ${C.border}`, backgroundColor: C.white, color: C.text, borderRadius: R, padding: '7px 10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Upload style={{ width: '13px', height: '13px', color: accent }} />
                Modifier
              </button>
              <button
                type="button"
                onClick={handleDelete}
                style={{ border: `1px solid ${C.red}35`, backgroundColor: '#FEF2F2', color: '#B91C1C', borderRadius: R, padding: '7px 10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 style={{ width: '13px', height: '13px' }} />
                Supprimer
              </button>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                style={{ border: 'none', backgroundColor: accent, color: '#fff', borderRadius: R, padding: '7px 10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
