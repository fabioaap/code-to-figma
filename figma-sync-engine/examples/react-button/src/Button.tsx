import React from 'react';

export interface ButtonProps {
    label: string;
    variant?: 'primary' | 'secondary';
    onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ label, variant = 'primary', onClick }) => {
    const style: React.CSSProperties = {
        padding: '12px 16px',
        borderRadius: 6,
        fontWeight: 500,
        display: 'inline-flex',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        background: variant === 'primary' ? '#2563eb' : '#e2e8f0',
        color: variant === 'primary' ? '#fff' : '#1e293b',
        border: '1px solid ' + (variant === 'primary' ? '#1d4ed8' : '#cbd5e1')
    };
    return <button style={style} onClick={onClick}>{label}</button>;
};
