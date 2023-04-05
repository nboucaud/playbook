interface Window {
    /**
     * After analyzing the `exposeInMainWorld` calls,
     * `packages/preload/exposedInMainWorld.d.ts` file will be generated.
     * It contains all interfaces.
     * `packages/preload/exposedInMainWorld.d.ts` file is required for TS is `renderer`
     *
     * @see https://github.com/cawa-93/dts-for-context-bridge
     */
    readonly apis: { workspaceSync: (id: string) => Promise<any>; onThemeChange: (theme: string) => Promise<any>; onSidebarVisibilityChange: (visible: boolean) => Promise<any>; signIn: () => void; ipcRenderer: { on: (channel: string, listener: (event: any, ...args: any[]) => void) => void; off: (channel: string) => void; }; reload: () => void; };
    readonly appInfo: { electron: boolean; isMacOS: boolean; };
}
