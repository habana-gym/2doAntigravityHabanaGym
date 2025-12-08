import styles from './PageHeader.module.css';

export default function PageHeader({ title, subtitle, actions }) {
    return (
        <header className={styles.header}>
            <div className={styles.textContainer}>
                <h1 className={styles.title}>{title}</h1>
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>

            <div className={styles.centerBranding}>
                <img
                    src="/logo-header.jpg"
                    alt="Habana Gym"
                    className={styles.logo}
                />
            </div>

            <div className={styles.rightSide}>
                {actions && <div className={styles.actions}>{actions}</div>}
            </div>
        </header>
    );
}
