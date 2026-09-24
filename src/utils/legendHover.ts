/**
 * A diagram feletti hover a legend megfelelő gombját is kiemeli, React újrarenderelés
 * nélkül: a Highcharts pontfrissítéseit egy újrarenderelés visszaállítaná.
 * A gombok `data-variety` attribútumot viselnek, a stílust a `data-hovered` adja.
 */
export function markLegendHover(legend: HTMLElement | null, varietyName: string | null) {
  if (!legend) return;
  legend.querySelectorAll<HTMLElement>('[data-variety]').forEach(button => {
    if (button.dataset.variety === varietyName) button.dataset.hovered = '';
    else delete button.dataset.hovered;
  });
}
