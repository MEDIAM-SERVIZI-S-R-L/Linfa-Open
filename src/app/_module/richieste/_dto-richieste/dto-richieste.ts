/*  dto data transfer object  */
export enum TipoListaRichieste {
    Tutte = 0,
    Nuove = 1,
    Rifiutate=2,
    AccettateMie=3,
    AccettateAltri=4

  }

   interface IRichiesta
  {
    idRichiesta: number; // mettere il hash
    utenteRichiesta: string;
    cfPaziente: string;
    tipoRichiesta: string;
    priorita: string;
    statoRichiesta: string
  }
 export class Richiesta implements IRichiesta{
  idRichiesta: number; // mettere il hash
  utenteRichiesta: string;
  cfPaziente: string;
  tipoRichiesta: string;
  priorita: string;
  statoRichiesta: string
 }