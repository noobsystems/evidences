import styles from "../../css/Spinner.module.css"

interface SpinnerProps {
    black?: boolean;
}

export default function Spinner(props: SpinnerProps) {
    return <div className={props.black ? `${styles.spinner} ${styles.circle__black}` : `${styles.spinner} ${styles.circle__white}`}>
        {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`${styles.circle} ${styles[`circle__${i}`]}`} />
        ))}
    </div>
}