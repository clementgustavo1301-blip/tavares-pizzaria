/**
 * Utilitários para detecção de dispositivos
 */

/**
 * Verifica se o dispositivo atual é mobile ou tablet
 * @returns true se for dispositivo móvel, false caso contrário
 */
export const isMobileDevice = (): boolean => {
    return (
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth < 1024
    );
};
