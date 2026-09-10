
/*  dto data transfer object  */
export class AnagraficaPaziente {
  Persona: Persona;
  Paziente: Paziente;
  Domicilio: Domicilio;
  Residenza: Residenza;
  IdPaziente: string
  DataNascita
  DataFirmaPrivacy
}

export class Caregiver {
  noteDisponibilita: string;
  idGradoParentela: number;
}

export class Persona {
  CF: string;
  Nome: string;
  Cognome: string;
  Sesso: string;
  DataNascita:string;
  DataDecesso:string;
  IdComuneNascita: number;
  Telefono1: string;
  Telefono2: string;
  Email: string;
  IdPrivacy: number;
  DataFirmaPrivacy;
}

export class Paziente {
  // codiceNosologico: string;
  CodiceNosologico: string;
  IdASL: number;
  IdStatoCivile: number;
  IdTitoloStudio: number;
  OccupazioneAttuale: string;
  IdConvivenza: number;
  Mmg: string;
  AltroConvivenza: string;
  nNucleoFamiliare : number;
  CodiceEsenzione: string
}

export class Domicilio {
  IdComune: number;
  Indirizzo: string;
  CAP: string;
  IdTipoIndirizzo: number;
  IsUgualeDomicilio: boolean;
}
export class Residenza {
  IdComune: number;
  Indirizzo: string;
  CAP: string;
  IdTipoIndirizzo: number;
  IsUgualeDomicilio: boolean;
}


//LISTA TABELLA PAZIENTI
interface IPazienti {
  nome: string;
  cognome: string;
  cf: string;
}
export class Pazienti implements IPazienti {
  nome: string;
  cognome: string;
  cf: string;
}
