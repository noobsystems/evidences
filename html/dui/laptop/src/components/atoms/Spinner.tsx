interface SpinnerProps {
    black?: boolean;
    size?: number;
}

export default function Spinner({ black, size = 80 }: SpinnerProps) {
    const bgColor = black ? "bg-black" : "bg-white";
    const scale = size / 80;

    return <div className="flex justify-center items-center shrink-0" style={{ width: size, height: size }}>
        <div className="relative w-16 h-16 origin-center" style={{ transform: `scale(${scale})` }}>
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`absolute w-3 h-3 rounded-full top-1/2 left-1/2 mt-[-6px] ml-[-6px] animate-orbit ${bgColor}`} style={{ animationDelay: `${i * 0.125}s`, animationFillMode: "both" }} />
            ))}
        </div>
    </div>
}