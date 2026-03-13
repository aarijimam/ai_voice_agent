export function startTimer(label: string){
    const start = Date.now();
    return {
        end: () => {
        const end  = Date.now();
        const duration = end - start;
        return duration;
    }
}
} 