/**
 *
 * File con i tutti Dto in entrata , Da API verso Linfa
 *
 */

import { Data } from '@angular/router'

import { TipoRichiesta, TipoValoreAnalisi } from '../_core/helpers/enums'
import { unitaMisura } from '../_models/confezionamenti'
import { Richiesta } from '../_module/richieste/_dto-richieste/dto-richieste'

export interface IBaseResponseDTO {
  inError: boolean
  warning: boolean
  message: string
  exception: string
  resultData: any
}

//#region NRS
//* README: Dto in entrata per tutti i questionari

export interface IQuestionarioBaseDTO {
  id: number
  idQuestionario: number
  domanda: string
  orderNum: number
}

/** La versione estesa per questionario */
interface IQuestionarioExtDTO extends IQuestionarioBaseDTO {
  idRispostaSelezionata: null
  datRispostePreScreeningXpaziente: null
  datRisposteXpaziente: null
  xRisposte: null
}

/**
 * Le domande di NRS da API
 */
export interface INrsQuestion {
  id: number
  descrizione: string
  punteggio: number
  livello: string
}

/**
 * Domande da API divise per stato e patologia
 */
export interface INutritionalRiskScreeningDTO {
  statoNutrizionale: INrsQuestion[]
  patologia: INrsQuestion[]
}

/** Api riposte preescrinign nrs selezionate da utente */
export interface IPrescreeningAnswer {
  idDomanda: number
}

/** Risposte date da utente con punteggio attuale */
interface INutritionalScreeningAnswer {
  idNutritionalScreeningStatoNutrizionale: number
  idNutritionalScreeningPatologia: number
  punteggioTotale: number
}

/** Risposte per preesringing e nrs con punteggio  */
export interface INrsAnswersDTO {
  preScreening: IPrescreeningAnswer[]
  nrs: INutritionalScreeningAnswer
}

//#endregion NRS

//#region  Statistiche

/**
 * Interfacia per un singolo tab
 */

interface IGenericTabWidget {
  id: number
  cod: string
  descr: string
}
export interface ITabDTO extends IGenericTabWidget {
  widgetobj: IWidgetDTO[]
}

export interface IWidgetDTO extends IGenericTabWidget {
  titolo: string
  sottoTitolo: string
  idXTipiGrafici: number
  descrXTipiGrafici: string
  statisticObj: IGenericStatisticDTO
}

export interface IGenericStatisticDTO {
  datasets: IGenericStatisticDatasetDTO[]
  labels: string[]
}
export interface IGenericStatisticDatasetDTO {
  data: string[]
  label: string
}

//#endregion Statistiche

//#region Paziente

/**
 * Info paziente box
 */
export interface IPazienteBoxDTO {
  nome: string
  cognome: string
  cf: string
  dataNascita: Date
  sesso: string
  dataPresaInCarico: Date
  idPaziente: string
  ambulatorio: string
  repartoRichiedente: string
  eta: string
  datiNutrizionali: IDatiNutrizionali
  dataPrestazione: Date
  idStatoVisita: number
  statoVisita: string
  numeroImpegnativa? : string
  idTipoRichiesta? : TipoRichiesta
  //dataFirmaPrivacy: 2022-12-09T00:00:00+01:00,
  // idPrivacy: 15,
  //livelloPrivacy: Fascicolo sanitario,
  // dataPresaInCarico: null
}

interface IBoxPaziente {
  nome: string
  cognome: string
  cf: string
  dataNascita: Date
  sesso: string
  dataPresaInCarico: Date
  idPaziente: string
  ambulatorio: string
  repartoRichiedente: string
  eta: string
  datiNutrizionali: IDatiNutrizionali
  dataPrestazione: Date
  idStatoVisita: number
  statoVisita: string
}

interface IDatiNutrizionali {
  bmiattuale: number
  bmiottimale: number
  altezza: number
  pesoRilevato: number
  pesoOttimale: number
  malnutrizione: string
  caloPonderale: number
  caloPonderale3Mesi: number
  caloPonderale6Mesi: number
  idVisita: number
}

export interface IStatsPazienteDTO {
  pesoattuale: number | null
  pesoottimale: number | null
  bmiattuale: number | null
  bmiottimale: number | null
  dataVisita: Date
}

/** Utanto per la lista del pazienti nella nuova richiesta */
export interface IPazienteInternoDTO {
  idPaziente: string
  cf: string
  nome: string
  cognome: string
  sesso: string
  dataNascita: Date
}

export interface IPazienteEsternoDTO {
  cf: string
  nome: string
  cognome: string
  dataNascita: Date
  nosologico: string | number
  sesso: string
  comuneNascitaCodice: number
  comuneNascita: string
  comuneResidenzaCodice: number
  comuneResidenza: string
  indirizzoResidenza: string
  telefono: number
  cittadinanza: number

}


export interface IComuneDto {
  cap: string
  comune: string
  idComune: number
  idProvincia: number
  idRegione: number
  provincia: string
  regione: string
  targa: string
  codIstat: string
}

export interface IMacroPrecompiledDTO {
  kcal: number
  proteine: number
  azoto: number
  lipidi: number
  carboidrati: number
  kcalMin: number
  kcalMax: number
  protMin: number
  protMax: number
  lipidiMin: number
  lipidiMax: number
  carboidratiMin: number
  carboidratiMax: number
  azotoMin: number
  azotoMax: number
  apportoIdrico: number
  pesoMinimo: number
  pesoMassimo: number
  pesoAbituale: number
}

//#endregion Paziente



//#region Prodotti

export interface IOggettoDietaDTO{
  dieta : IDietaDTO;
  prodotti: IProdottoDettaglioDTO[];
}


export interface IDietaDTO{
  id: number
  dieta: string
  kcal: number
  proteine: number
  azoto: number
  carboidrati: number
  lipidi: number
  creatoDaUtenteLoggato: boolean
  creato: string
}

export interface ITipoProdottiDTO {
  id: number
  name: string
}


export interface IProdottoEasyDTO {
  id: number,
  prodotto: string,
  idTipoProdotto: number,
  tipoProdotto: string
}


export interface IProdottoDettaglioDTO{
  id: number
  prodotto: string
  codiceProdotto: string
  idTipoProdotto: number
  idCategoriaAlimentare: number
  acqua: number
  kcal: number
  proteineTotali: number
  lipidiTotali: number
  glucidiDispon: number
  quantita: number
  quantitaBase: number
  idUnitaMisura: number
  altroCodiceProdotto: string
  recordEliminato: boolean
  unitaMisura: string
  azoto: number,
  prodottiAlternativi: IProdottoAlternativoDTO[];
}

export interface IProdottoAlternativoDTO{
  id: number
  prodotto: string
  codiceProdotto: string
  idTipoProdotto: number
  idCategoriaAlimentare: number
  acqua: number
  kcal: number
  proteineTotali: number
  lipidiTotali: number
  glucidiDispon: number
  quantita: number
  quantitaBase: number
  idUnitaMisura: number
  altroCodiceProdotto: string
  recordEliminato: boolean
  unitaMisura: string
  azoto: number
}

///QUELLO CHE MI ARRIVA DALLA CHIAMATA getDettaglioAnamnesi
export interface IProdottoDettaglioAnamnesiDTO {
  idPasto: number
  idProdotto: number
  codiceProdotto: any
  quantitaBase: number
  prodotto: string
  pasto: string
  kcal: number
  proteine: number
  azoto: number
  quantita: number
  acqua: number
  carboidrati: number
  lipidi: number
  idUnitaMisura: number
  unitaMisura: string
  prodottiAlternativi: IProdottoDettaglioAnamnesiAlternativoDTO[]
  idprodottoxvisita? : number;
  settimana? : string[];
}

export interface IProdottoDettaglioAnamnesiAlternativoDTO{
  idPasto: number
  idProdotto: number
  codiceProdotto: any
  quantitaBase: number
  prodotto: string
  pasto: string
  kcal: number
  proteine: number
  azoto: number
  quantita: number
  acqua: number
  carboidrati: number
  lipidi: number
  idUnitaMisura: number
  unitaMisura: string
  idprodottoxvisita? : number
}

export interface IProprietaProdottoDTO{
  quantita: number
  kcal: number
  acqua: number
  lipidi: number
  carboidrati: number
  azoto: number
  proteine: number
  idUnitaMisura: number
  unitaMisura: string
}

//#endregion Prodotti

//#region  Analisi Paziente

export interface IValoriEsameDTO {
  valore: number
  idXValoriEsami: number
  descrizioneValore: string
  min: number
  max: number
  alert: boolean
}

// Usato nella lista analisi
export interface IAnalisiPazienteDTO {
  id: string
  dataEsame: Date
  descrizione: string
  tipoValore: TipoValoreAnalisi | null
  unitaMisura: string | null
}

//Usato nen dettaglio
export interface IAnalisiPazienteDettaglioDTO extends IAnalisiPazienteDTO {
  valoriEsame?: IValoriAnalisiDTO[] | null
}

export interface IValoriAnalisiDTO {
  valore: number
  idXValoriEsami: number
  descrizioneValore: string
  min: number
  max: number
  alert: boolean
  tipoValore: TipoValoreAnalisi | null
  unitaMisura: string | null
}

export interface ICategoriaAnalisiDTO {
  id: number
  categoriaEsame: string
}

export interface IProprietaAnalisiDTO {
  id: number
  descrizione: string
  idCategorieEsami: number // viene usato per filtrare con tipo esame
  tipoValore: TipoValoreAnalisi | null
  unitaMisura: string | null
}

export interface IDettaglioRangeDTO{
  id: number,
  descrizione: string,
  etaMax: number,
  etaMin: number,
  sesso: string,
  max: number,
  min: number,
  idValoriEsami: number,
  idUnitaMisura?: number
  unitaMisura?: string
}

export interface IDettaglioRangeDTO{
  id: number,
  descrizione: string,
  etaMax: number,
  etaMin: number,
  sesso: string,
  max: number,
  min: number,
  idValoriEsami: number,
  idUnitaMisura?: number
  unitaMisura?: string
}

//#endregion Analisi Paziente

//#region Distretto + OrderEntry

///Interfaccia distretti in arrivo
export interface IDistrettoDTO {
  iddistretto: number
  descr: string
  approvazioneAutomatica: boolean
}

export interface IOspedaleDTO {
  idospedale: number
  descr: string
  cod: string
}

export interface IRepartoDTO {
  idreparto: number
  descr: string
  idOspedale: number
  ospedale: string
  centroCosto: string
}

export interface IEnteDTO {
  idtipoente: number
  cod: string
  descr: string
}

export interface IEntiXUtenteDTO {
  idente: number
  ente: string
  ospedale?: string
  associato: boolean
}

export interface IMedicoXDistrettoDTO{
  idMedico:number,
  medico : string,
  associatoDistretto : boolean
}
//#endregion Distretto + OrderEntry

//#region Confezionamenti
export interface IUnitaMisuraDTO {
  id: number
  unitaMisura: string
}

export interface IConfezionamentoDTO {
  idProdotto: number
  disponibile: boolean
  id?: number
  idUnitaMisura?: number
  prezzo?: number
  quantita?: number
  unitaMisura?: string
  nPianiCoinvolti?: number
  listaGare : number[];
}

export interface IGaraDTO {
  idgara: number
  gara: string
  validaDal: Date
  validaAl: Date
  erogatore: string
  fruitore: string
  RecordEliminato?: boolean
  abilitata?: boolean
}

//#endregion Confezionamenti

//#region Richiesta

export interface IPrioritaDTO {
  id: number
  priorita: string
  acronimo: string
}

export interface ITipiRichiestaDTO {
  id: number
  tipoRichiesta: string
}

export interface ITipoPrestazioneDTO {
  id: number
  tipoPrestazione: string
}

export interface IAmbulatorioDTO {
  idStruttura: number
  idCup: string
  descr: string
  centrodiCosto: string
  id: number
  repartoInterno:boolean
}

//#endregion Richiesta


//#region Utente
export interface IUtenteBaseDTO{
   id: string
  nome: string
  cognome: string
 idUtente:number
 matricola:string


}
//#endregion Utente


//#region Documenti

export interface IRefertoNomeDTO{
  idDocumento: string;
  nomeDocumento: string;
}

//#endregion Documenti


//#region Visita
/**
 * Stato Visita
 */
export  interface IStatoVisitaDTO{
  idStatoVisita:number,
  statoVisita:string
}

//#endregion Visita

export interface IIcd9DTO{
  icd9: string,
  descr: string,
  cod: string
}

export interface ISignedLocalDocument{
  PdfSigned: any
  Success: boolean,
  LastErrorMessage: string,
  ResultData: any,
  ErrorType: number
}

export interface IManageDefaultDataDTO{
  import: boolean,
  table : string
}

export interface INotificheRefertiDTO{
  dataInvio : Date,
  utenteInvio : string,
  invioCompletato : boolean,
  erroriInvio : IErroriRefertiDTO[]
}

export interface IErroriRefertiDTO{
  errore :string,
  ente : string
}

export interface IRefertoVisitaDTO {
  tutore: any[]
  paziente: IPazienteXRefertoDTO
  nutrizione: INutrizioneXRefertoDTO
  anamnesi: IAnamnesiXRefertoDTO
  mnaNrsKarnofskyMust: IMnaNrsKarnofskyMustXRefertoDTO
  anamnesiAlimentare: IAnamnesiAlimentareXRefertoDTO
  vn: IDatiAntropometriciDTO
  visita: IVisitaXRefertoDTO
  motivoRichiesta: string
  prossimaVisita: any
  nomeDocumneto : string
}

export interface IPazienteXRefertoDTO {
  cf: string
  nome: string
  nomepaziente: string
  cognomepaziente: string
  sesso: string
  sessodescr: string
  datanascita: string
  datanascitacda: string
  datadecesso: string
  dataPresaInCarico: string
  luogonascita: any
  luogonascita_descr: string
  luogonascita_prov: string
  luogonascita_regione: string
  luogonascita_stato: string
  indirizzoresidenza: string
  luogoresidenza: string
  isugualedomicilio: boolean
  indirizzodomicilio: any
  luogodomicilio: string
  telefono1: string
  telefono2: string
  email: any
  privacy: any
  json: any
}

export interface INutrizioneXRefertoDTO {
  kcal: number
  proteine: number
  azoto: number
  apportoIdrico: number
  carboidrati: number
  lipidi: number
}

export interface IAnamnesiXRefertoDTO {
  fisiologica: any[]
  familiare: any[]
  prossima: any[]
  remota: any[]
  terapie: any[]
  attivitaMotoria: any[]
  interventi: any[]
  allergieIntolleranze: any[]
  dipendenze: any[]
}

export interface IMnaNrsKarnofskyMustXRefertoDTO {
  valutazioneTotaleMust: any
  rischioMalnutrizioneMust: any
  valutazioneScreening: any
  valutazioneGlobale: any
  valutazioneTotale: any
  karnofsky: any
  nrs: any
}

export interface IAnamnesiAlimentareXRefertoDTO {
  note: string
  diagnosiNutrizionale: string
  kcal: number
  azoto: number
  proteine: number
  lipidi: number
  carboidrati: number
}
export interface IDatiAntropometriciDTO {
  altezza: number
  pesoattuale: number
  pesoottimale: number
  bmiattuale: number
  bmiottimale: number
  malnutrizione: string
  caloponderale: number
  caloPonderale3Mesi: number
  caloPonderale6Mesi: number
  dataInizioPatologia: string
  disfagia: string
  gradodisfagia: string
  note: string
  piagheDecubito: boolean
  allettato: boolean
  ritmoSonnoVeglia: string
  consistenzaPasto: string
  attivita: string
  alvo: string
  tipoFeci: string
  diuresi: string
  alimentazioneScelta: string
  dataCaloPonderale: string
  bicipitale: number
  tricipitale: number
  sovrailiaca: number
  sottoscapolare: number
  braccio: number
  polpaccio: number
  lunghezzaUlna: number
  rz: number
  xc: number
  circAddominale: number
  circPolso: number
  impedenza: number
  wh: string
  latoMisurazione: string
  pesominimo: number
  pesomassimo: number
  pesoabituale: number
}

export interface IVisitaXRefertoDTO {
  medico: string
  mediconome: string
  medicocognome: string
  medicocf: string
  medicomail: string
  medicoSecondario: string
  infermiere: string
  dataVisita: string
  dataeffettivainizio: string
  dataeffettivafine: string
  ambulatorio: string
  repartoRichiedente: string
  repartoDegenza: any
  postoDegenza: string
  nosologico: string
  tipoalimentazione: string
  idTipoAlimentazione: number
  idTipoPrestazione: number
  idVisita: string
  identificativodocumento: string
  diagnosi: string
}


//**** Conclusioni */

export interface IConclusioni{
  id: number
  conclusione: string
  tipo:string

}

  //#region Categoria configurazione
  export interface ICategoriaConfigurazioneDTO {
    id: number
    categoriaConfigurazione: string
    abilitato: boolean
    coreConfigurazioni: any
  }

  export interface IConfigurazioneEasyDTO{
    id: number,
    proprieta: string
  }
  //#endregion

  export interface IConfigurazioneDTO {
    id: number
    proprieta: string
    valore: string
    descrizione: string
    abilitato: boolean
    recordEliminato: boolean
    idCategoriaConfigurazione: number
    categoriaConfigurazione: string
  }
