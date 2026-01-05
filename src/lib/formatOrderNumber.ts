/**
 * Formata o número de exibição do pedido de forma padronizada
 * @param displayId - ID de exibição do pedido (ex: "#010226-001")
 * @param id - ID UUID do pedido (fallback)
 * @returns String formatada do número do pedido
 */
export function formatOrderNumber(displayId?: string | null, id?: string): string {
    if (displayId) {
        return displayId;
    }
    if (id) {
        return `#${id.slice(0, 8).toUpperCase()}`;
    }
    return "#---";
}
