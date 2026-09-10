export class ValutazioneNutrizionale {
  IdVisita: string;
  IdRichiestaUtente: string;
  Eta: number;
  Altezza: number;
  IdPatologia: number;
  PesoRilevato: number;
  PesoDaRaggiungere: number;
  Pesoultimi3mesi: number;
  Pesoultimi6mesi: number;
  PesoAbituale: number;
  PesoMassimo: number;
  PesoMinimo: number;
  DataInizioPatologia: string;
  PiagheDecubito: boolean;
  Allettato: boolean;
  LatoMisurazione: string;
  Bicipitale: number;
  Tricipitale: number;
  Sottoscapolare: number;
  Sovrailiaca: number;
  Braccio: number;
  Polpaccio: number;
  LunghezzaUlna: number;
  IdRitmoSonnoVeglia: number;
  IdAttivita: number;
  IdAlvo: number;
  IdBristolChart: number;
  IdDiuresi: number;
  IdDisfagia: number;
  IdGradoDisfagia: number;
  IdTipoAlimentazioneAttuale: number;
  IdConsistenzaPasto: number;
  Rz: number;
  Xc: number;
  Impedenza: number;
  CircAddominale: number;
  CircPolso: number;
  Wh: number;
  Note: string;
}


export class SalvaDietaRequest {
  Prodotti: any[];
  IdVisita: string;
  IdPaziente: string;
  Kcal: number;
  Proteine: number;
  Azoto: number;
  Carboidrati: number;
  Lipidi: number;
  ApportoIdrico: number;
  NomeDieta: string;
  Anamnesi: string;
  IdDieta: number;
  Note: string;
  DiagnosiNutrizionale:string
}
export class SalvaDietaXpazienteRequest {
  Kcal: number;
  Proteine: number;
  Azoto: number;
  Carboidrati: number;
  Lipidi: number;
  Diagnosi: string;
  Note: string;
  NotePianoNutr: string;
  IdValutazioneNutrizionale: string;
  IdVisita: string;
  ApportoIdrico: number;
  IdDietaRiferimento: number;
  Prodotti: any[];
}
