import styles from './Card.module.css';

export default function Card({ children, className = '', title, action }) {
    return (
        <div className={`${styles.card} ${className}`}>
            {(title || action) && (
                <div className={styles.header}>
                    {title && <h3 className={styles.title}>{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className={styles.content}>
                {children}
            </div>
        </div>
    );
}
