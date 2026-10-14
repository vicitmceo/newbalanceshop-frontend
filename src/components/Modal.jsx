import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// Модальне вікно: Esc і клік по затемненню закривають його, фокус потрапляє у вікно.
export default function Modal({ title, children, onClose, footer, wide = false }) {
    const { t } = useTranslation();
    const ref = useRef(null);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        ref.current?.focus();
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [onClose]);

    return (
        <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
                <div className="modal-head">
                    <h3>{title}</h3>
                    <button className="icon-btn" onClick={onClose} aria-label={t('common.close')}>✕</button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-foot">{footer}</div>}
            </div>
        </div>
    );
}

export function ConfirmModal({ title, text, confirmLabel, danger = true, onConfirm, onCancel }) {
    const { t } = useTranslation();
    return (
        <Modal
            title={title}
            onClose={onCancel}
            footer={(
                <>
                    <button className="btn btn-ghost" onClick={onCancel}>{t('common.cancel')}</button>
                    <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
                        {confirmLabel || t('common.yes')}
                    </button>
                </>
            )}
        >
            <p className="modal-text">{text}</p>
        </Modal>
    );
}
