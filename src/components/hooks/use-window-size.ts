import { useEffect, useState } from "react";



export default function useWindowSize() {
    const [windowSize, setWindowSize] = useState<{ width: number; height: number }>();

    useEffect(() => {
        window.addEventListener("resize", (e) => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        })
        setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
        })
    }, [])

    return windowSize
}