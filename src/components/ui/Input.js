import styles from './Input.module.css';

export default function Input({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    name,
    error,
    required = false,
    ...props
}) {
    return (
        <div className={styles.container}>
            {label && (
                <label className={styles.label}>
                    {label} {required && <span className={styles.required}>*</span>}
                </label>
            )}
            <input
                type={type}
                name={name}
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                {...props}
            />
            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
}
