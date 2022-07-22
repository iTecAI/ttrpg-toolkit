import { useEffect, useRef } from "react";

export function useHorizontalScroll(multiplier?: number) {
    const elRef = useRef<HTMLBaseElement>();
    useEffect(() => {
        const el = elRef.current;
        if (el) {
            const onWheel = (e: any) => {
                if (e.deltaY === 0) return;
                e.preventDefault();
                el.scrollTo({
                    left: el.scrollLeft + e.deltaY * (multiplier ?? 1),
                });
            };
            el.addEventListener("wheel", onWheel);
            return () => el.removeEventListener("wheel", onWheel);
        }
    }, [multiplier]);
    return elRef;
}
