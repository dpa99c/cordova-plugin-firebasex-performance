interface FirebasexPerformancePlugin {
    startTrace(
        name: string,
        success: () => void,
        error: (err: string) => void
    ): void;
    incrementCounter(
        name: string,
        counterName: string,
        success: () => void,
        error: (err: string) => void
    ): void;
    stopTrace(
        name: string,
        success: () => void,
        error: (err: string) => void
    ): void;
    setPerformanceCollectionEnabled(
        enabled: boolean,
        success: () => void,
        error: (err: string) => void
    ): void;
    isPerformanceCollectionEnabled(
        success: (enabled: boolean) => void,
        error: (err: string) => void
    ): void;
}
