import { MatPaginatorIntl } from '@angular/material/paginator';

const itRangeLabel = (page: number, pageSize: number, length: number) => {
  if (length == 0 || pageSize == 0) { return `0 di ${length}`; }

  length = Math.max(length, 0);

  const startIndex = page * pageSize;

  // If the start index exceeds the list length, do not try and fix the end index to the end.
  const endIndex = startIndex < length ?
    Math.min(startIndex + pageSize, length) :
    startIndex + pageSize;

  return `${startIndex + 1} - ${endIndex} di ${length}`;
}


export function getItPaginatorIntl() {
  const paginatorIntl = new MatPaginatorIntl();

  paginatorIntl.itemsPerPageLabel = 'Elementi per pagina:';
  paginatorIntl.nextPageLabel = 'Avanti';
  paginatorIntl.previousPageLabel = 'Indietro';
  paginatorIntl.firstPageLabel = 'Prima pagina';
  paginatorIntl.lastPageLabel = 'Ultima pagina';
  paginatorIntl.getRangeLabel = itRangeLabel;

  return paginatorIntl;
}
