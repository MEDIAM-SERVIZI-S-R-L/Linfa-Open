/*  dto data transfer object  */

//LISTA TABELLA PRODOTTI
interface IProdotti {
  codice: string;
  prodotto: string;
  tipo: string;
  categoria: string;
  quantita: number;
  quantitaRiferimento: string;
  unitaMisura: string;
  parteEdibile: number;
  kcal: number;
  acqua: number;
  proteineTotali: number;
  lipidiTotali: number;
}
export class Prodotti implements IProdotti {
  codice: string;
  prodotto: string;
  tipo: string;
  categoria: string;
  quantita: number;
  quantitaRiferimento: string;
  unitaMisura: string;
  parteEdibile: number;
  kcal: number;
  acqua: number;
  proteineTotali: number;
  lipidiTotali: number;
}
