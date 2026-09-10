/* eslint-disable no-prototype-builtins */

import moment from 'moment'

import { TipoRicerca, TipoRichiesta, TipoValoreAnalisi } from '../_core/helpers/enums'
import {
  IAnalisiPazienteDTO,
  IAnalisiPazienteDettaglioDTO,
  ICategoriaAnalisiDTO,
  IDettaglioRangeDTO,
  IPazienteBoxDTO,
  IPazienteEsternoDTO,
  IPazienteInternoDTO,
  IProprietaAnalisiDTO,
  IValoriAnalisiDTO,
  IComuneDto,
  IMacroPrecompiledDTO,
  IDatiAntropometriciDTO,
  IRefertoVisitaDTO,
  IPazienteXRefertoDTO,
  INutrizioneXRefertoDTO,
  IAnamnesiAlimentareXRefertoDTO,
  IAnamnesiXRefertoDTO,
  IMnaNrsKarnofskyMustXRefertoDTO,
  IVisitaXRefertoDTO,
} from '../_dtos/in'
import { unitaMisura } from './confezionamenti'

interface IBoxPaziente {
  paziente: string
  cf: string
  dataNascita: Date
  sesso: string
  dataPresaInCarico: Date
  altezza: number
  dataPrestazione: Date
  idStatoVisita: number
  statoVisita: string
  ambulatorio: string
  bmiattuale: number
  caloPonderale3Mesi: number
  caloPonderale6Mesi: number
  pesoRilevato: number
  repartoRichiedente: string
  eta: string
  numeroImpegnativa? : string
  idTipoRichiesta? : TipoRichiesta
}

export class BoxPaziente implements IBoxPaziente {
  paziente: string
  cf: string
  dataNascita: Date
  sesso: string
  dataPresaInCarico: Date
  altezza: number
  dataPrestazione: Date
  idStatoVisita: number
  statoVisita: string
  ambulatorio: string
  bmiattuale: number
  caloPonderale3Mesi: number
  caloPonderale6Mesi: number
  pesoRilevato: number
  repartoRichiedente: string
  eta: string
  numeroImpegnativa? : string
  idTipoRichiesta? : TipoRichiesta
  /**
   *
   */
  constructor(item: IPazienteBoxDTO) {
    this.paziente = item.nome + ' ' + item.cognome
    this.cf = item.cf
    this.dataNascita = item.dataNascita
    this.sesso = item.sesso
    this.dataPresaInCarico = item.dataPresaInCarico
    this.altezza = item.datiNutrizionali?.altezza
    this.dataPrestazione = item.dataPrestazione
    this.idStatoVisita = item.idStatoVisita
    this.statoVisita = item.statoVisita
    this.ambulatorio = item.ambulatorio
    this.bmiattuale = item.datiNutrizionali?.bmiattuale
    this.caloPonderale3Mesi = item.datiNutrizionali
      ? Math.abs(item.datiNutrizionali.caloPonderale3Mesi)
      : null
    this.caloPonderale6Mesi = item.datiNutrizionali
      ? Math.abs(item.datiNutrizionali.caloPonderale6Mesi)
      : null
    this.repartoRichiedente = item.repartoRichiedente
    this.pesoRilevato = item.datiNutrizionali?.pesoRilevato
    this.eta = this.getAge(item.dataNascita)
    this.numeroImpegnativa = item.numeroImpegnativa? item.numeroImpegnativa : null
    this.idTipoRichiesta = item.idTipoRichiesta; 
  }

  getAge(_date: Date) {
    let age: number | string = moment().diff(_date, 'years', true)

    let label = 'anni'
    if (age < 1) {
      age = moment().diff(_date, 'months', true)
      if (age == 1) {
        label = 'mese'
      } else {
        label = 'mesi'
      }
    } else if (age == 1) {
      label = 'anno'
    }
    return parseInt(age.toString()) + ' ' + label
  }
}

//#region Analisi per paziente

export interface IAnalisiPaziente {
  // ex  IEsameXPaziente  = IAnalisiPaziente
  idAnalisi: string
  data: Date
  descrizione: string
  valoriAnalisi?: ValoreAnalisi[]
  expanded?: boolean | null
}

//** Usato per la list (seza Valori) e per singolo Analisi con i valori */
export class AnalisiPaziente implements IAnalisiPaziente {
  // ex   EsameXPaziente  = AnalisiPaziente
  idAnalisi!: string
  data!: Date
  descrizione!: string
  valoriAnalisi?: ValoreAnalisi[]
  expanded?: boolean | null | undefined

  constructor(item: IAnalisiPazienteDettaglioDTO) {
    // se DTO ha valoriEsame so che sono in detteglio
    if (item.hasOwnProperty('valoriEsame') && item.valoriEsame) {
      this.valoriAnalisi = []
      item.valoriEsame.forEach((element) => {
        this.valoriAnalisi.push(new ValoreAnalisi(element))
      })
    }
    // se non sono nel dettaglo sono nella lista
    if (!item.hasOwnProperty('valoriEsame')) {
      this.expanded = false
    }

    this.idAnalisi = item.id
    this.data = item.dataEsame
    this.descrizione = item.descrizione
  }
}

interface IValoreAnalisi {
  valore: number
  id: number
  descrizione: string
  min: number
  max: number
  alert: boolean
  unitaMisura:string
  tipoValore: TipoValoreAnalisi
}

export default class ValoreAnalisi implements IValoreAnalisi {
  valore: number
  id: number
  descrizione: string
  min: number
  max: number
  alert: boolean
  unitaMisura:string
  tipoValore: TipoValoreAnalisi

  /**
   *
   */
  constructor(item: IValoriAnalisiDTO) {
    this.valore = item.valore
    this.id = item.idXValoriEsami
    this.descrizione = item.descrizioneValore
    this.min = item.min
    this.max = item.max
    this.alert = item.alert
    this.tipoValore=item.tipoValore
    this.unitaMisura= item.unitaMisura
  }
}

interface ICategoriaAnalisi {
  id: number
  descrizioneAnalisi: string
}

export class CategoriaAnalisi implements ICategoriaAnalisi {
  id: number
  descrizioneAnalisi: string

  constructor(item: ICategoriaAnalisiDTO) {
    this.id = item.id
    this.descrizioneAnalisi = item.categoriaEsame
  }
}

interface IProprietaAnalisi {
  idProprieta: number
  descrizione: string
  idCategorieAnalisi: number // viene usato per filtrare con tipo esame
  tipoCampo: TipoValoreAnalisi | null
  unitaMisura: string | null
  recordEliminato?: boolean
}
export class ProprietaAnalisi implements IProprietaAnalisi {
  [x: string]: any
  idProprieta: number
  descrizione: string
  idCategorieAnalisi: number
  tipoCampo: TipoValoreAnalisi
  unitaMisura: string
  recordEliminato?: boolean

  constructor(item: IProprietaAnalisiDTO) {
    this.idProprieta = item.id
    this.descrizione = item.descrizione
    this.idCategorieAnalisi = item.idCategorieEsami
    this.tipoCampo= item.tipoValore
    this.unitaMisura = item.unitaMisura
  }
}

export interface IAnalisiFormToRaw {
  idAnalisi?: string
  idPaziente: string
  dataAnalisi: Date
  descrizione: string
  listaProprieta: IAnalisiProprietaToRaw[]
}

export interface IAnalisiProprietaToRaw {
  id: number
  valore: number
}

interface IDettaglioRange{
  id: number,
  descrizione: string,
  etaMax: number,
  etaMin: number,
  sesso: string,
  max: number,
  min: number,
  idValoriEsami: number,
  unitaMisura?: string,
  idUnitaMisura?: number,
  recordEliminato?: boolean
}

export class DettaglioRange implements IDettaglioRange{
  id: number;
  descrizione: string;
  etaMax: number;
  etaMin: number;
  sesso: string;
  max: number;
  min: number;
  idValoriEsami: number;
  unitaMisura?: string;
  idUnitaMisura?: number;
  recordEliminato: boolean;


  constructor(item: IDettaglioRangeDTO) {
    this.id = item.id;
    this.descrizione = item.descrizione;
    this.etaMax = item.etaMax;
    this.etaMin = item.etaMin;
    this.sesso = item.sesso;
    this.max = item.max;
    this.min = item.min;
    this.unitaMisura = item.unitaMisura;
    this.idValoriEsami = item.idValoriEsami;
    this.idUnitaMisura = item.idUnitaMisura;
  }
}
//#endregion Analisi per paziente


//#region lista Pazienti , usano nella ricerca paziente e da altra parte un modello unico per tutte tutti i posti dove



interface IComune{
  cap: string
  comune: string
  idComune: number
  idProvincia: number
  idRegione: number
  provincia: string
  regione: string
  targa: string
  codiceIstat : string
}

export class Comune implements IComune{

  cap: string
  comune: string
  idComune: number
  idProvincia: number
  idRegione: number
  provincia: string
  regione: string
  targa: string
  codiceIstat : string

  constructor(item: IComuneDto) {
    this.cap = item.cap;
    this.comune = item.comune;
    this.idComune = item.idComune;
    this.idProvincia = item.idProvincia;
    this.idRegione = item.idRegione;
    this.provincia = item.provincia;
    this.regione = item.regione;
    this.targa = item.targa;
    this.codiceIstat = item.codIstat;
  }
}


interface IPazienteBase {
  idPaziente?: string
  cf: string,
  nome: string,
  cognome: string,
  dataNascita: Date,
esterno:boolean

}




interface IPazienteEsterno {

  sesso: string,
  comuneNascitaCodice?: number,
  comuneNascita?: string,
  comuneResidenzaCodice?: number,
  comuneResidenza?: string,
  indirizzoResidenza: string,
  telefono: number,
  cittadinanza: number

}
interface IPazienteNuovaRichiesta extends IPazienteBase,IPazienteEsterno{
  capResidenza? : string
  comuneDomicilioCodice? : string
  comuneDomicilio? : string
  capDomicilio?: string  
  indirizzoDomicilio?: string
  email?: string
}

export class PazienteNuovaRichiesta implements IPazienteNuovaRichiesta{
  idPaziente?: string
  cf: string
  nome: string
  cognome: string
  dataNascita: Date
  esterno:boolean
  sesso: string
  comuneNascitaCodice?: number
  comuneNascita?: string

  comuneResidenzaCodice?: number
  comuneResidenza?: string
  capResidenza? : string

  comuneDomicilioCodice?: string
  comuneDomicilio ?: string
  capDomicilio?: string

  indirizzoResidenza: string
  indirizzoDomicilio?: string

  telefono: number
  email?: string
  cittadinanza: number
  nosologico: string | number
  postodegenza: string
/**
 * il construttore puo essere paziente interno o esterno
 */
constructor(item:IPazienteInternoDTO | IPazienteEsternoDTO) {
  if (item.hasOwnProperty('idPaziente')) {
    let x = item as IPazienteInternoDTO;
   this.idPaziente = x.idPaziente
  this.esterno= false
  this.sesso= x.sesso
  this.nosologico = "-"


  }else{
    let x = item as IPazienteEsternoDTO;
    this.comuneNascita= x.comuneNascita;
    this.comuneNascitaCodice= x.comuneNascitaCodice;
    this.comuneResidenzaCodice= x.comuneResidenzaCodice;
    this.comuneResidenza= x.comuneResidenza;
    this.telefono= x.telefono ;
    this.cittadinanza= x.cittadinanza;
    this.indirizzoResidenza= x.indirizzoResidenza;
    this.sesso= item.sesso
    this.nosologico= x.nosologico
    this.esterno= true

   // this.cf = x.cf
  }

  // i punti condivisi

  this.nome= item.nome;
  this.cognome= item.cognome;
  this.dataNascita= item.dataNascita;
  this.cf= item.cf;
  this.postodegenza= null;
}

}
interface IMacroPrecompiled{
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

export class MacroPrecompiled implements IMacroPrecompiled{
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
  
  constructor(item: IMacroPrecompiledDTO){
    this.kcal = item.kcal 
    this.proteine= item.proteine
    this.azoto= item.azoto
    this.lipidi= item.lipidi
    this.carboidrati= item.carboidrati
    this.kcalMin= item.kcalMin
    this.kcalMax= item.kcalMax
    this.protMin= item.protMin
    this.protMax= item.protMax
    this.lipidiMin= item.lipidiMin
    this.lipidiMax= item.lipidiMax
    this.carboidratiMin= item.carboidratiMin
    this.carboidratiMax= item.carboidratiMax
    this.azotoMin= item.azotoMin
    this.azotoMax= item.azotoMax
    this.apportoIdrico= item.apportoIdrico
    this.pesoMinimo= item.pesoMinimo
    this.pesoMassimo= item.pesoMassimo
    this.pesoAbituale= item.pesoAbituale
  }
}

 interface IRefertoVisita {
  tutore: any[]
  paziente: PazienteXReferto
  nutrizione: NutrizioneXReferto
  anamnesi: AnamnesiXReferto
  mnaNrsKarnofskyMust: IMnaNrsKarnofskyMustXReferto
  anamnesiAlimentare: IAnamnesiAlimentareXReferto
  vn: IDatiAntropometrici
  visita: IVisitaXReferto
  motivoRichiesta: string
  prossimaVisita: any
  nomeDocumento? : string
}

export class RefertoVisita implements IRefertoVisita{
  tutore: any[]
  paziente: PazienteXReferto
  nutrizione: NutrizioneXReferto
  anamnesi: AnamnesiXReferto
  mnaNrsKarnofskyMust: MnaNrsKarnofskyMustXReferto
  anamnesiAlimentare: AnamnesiAlimentareXReferto
  vn: DatiAntropometrici
  visita: VisitaXReferto
  motivoRichiesta: string
  prossimaVisita: any
  nomeDocumento? : string

  constructor(item: IRefertoVisitaDTO) {
    this.tutore = item.tutore;
    this.paziente = item.paziente;
    this.nutrizione = item.nutrizione;
    this.anamnesi = item.anamnesi;
    this.mnaNrsKarnofskyMust = item.mnaNrsKarnofskyMust;
    this.anamnesiAlimentare = item.anamnesiAlimentare;
    this.vn = item.vn;
    this.visita = item.visita;
    this.motivoRichiesta = item.motivoRichiesta; 
    this.prossimaVisita = item.prossimaVisita;
    this.nomeDocumento = item.nomeDocumneto
  }
}

interface IPazienteXReferto {
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

export class PazienteXReferto implements IPazienteXReferto{
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

  constructor(item: IPazienteXRefertoDTO) {
    this.cf = item.cf;
    this.nome = item.nome;
    this.nomepaziente = item.nomepaziente;
    this.cognomepaziente = item.cognomepaziente;
    this.sesso = item.sesso;
    this.sessodescr = item.sessodescr;
    this.datanascita = item.datanascita;
    this.datanascitacda = item.datanascitacda;
    this.datadecesso = item.datadecesso;
    this.dataPresaInCarico = item.dataPresaInCarico;
    this.luogonascita = item.luogonascita;
    this.luogonascita_descr = item.luogonascita_descr;
    this.luogonascita_prov = item.luogonascita_prov;
    this.luogonascita_regione = item.luogonascita_regione;
    this.luogonascita_stato = item.luogonascita_stato;
    this.indirizzoresidenza = item.indirizzoresidenza;
    this.luogoresidenza = item.luogoresidenza;
    this.isugualedomicilio = item.isugualedomicilio;
    this.indirizzodomicilio = item.indirizzodomicilio;
    this.luogodomicilio = item.luogodomicilio; 
    this.telefono1 = item.telefono1;
    this.telefono2 = item.telefono2;
    this.email = item.email;
    this.privacy = item.privacy;
    this.json = item.json;
    
  }
}

interface INutrizioneXReferto {
  kcal: number
  proteine: number
  azoto: number
  apportoIdrico: number
  carboidrati: number
  lipidi: number
}

export class NutrizioneXReferto implements INutrizioneXReferto{
  kcal: number
  proteine: number
  azoto: number
  apportoIdrico: number
  carboidrati: number
  lipidi: number
  constructor(item: INutrizioneXRefertoDTO) {
    this.kcal = item.kcal;
    this.proteine = item.proteine;
    this.azoto = item.azoto;
    this.apportoIdrico = item.apportoIdrico;
    this.carboidrati = item.carboidrati;
    this.lipidi = item.lipidi;
  }
}

interface IAnamnesiXReferto {
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

export class AnamnesiXReferto implements IAnamnesiXReferto{
  fisiologica: any[]
  familiare: any[]
  prossima: any[]
  remota: any[]
  terapie: any[]
  attivitaMotoria: any[]
  interventi: any[]
  allergieIntolleranze: any[]
  dipendenze: any[]
  
  constructor(item: IAnamnesiXRefertoDTO) {
    this.fisiologica = item?.fisiologica? item.fisiologica : [];
    this.familiare = item?.familiare? item.familiare : []
    this.prossima = item?.prossima? item.prossima : []
    this.remota = item?.remota? item.remota : []
    this.terapie = item?.terapie? item.terapie : []
    this.attivitaMotoria = item?.attivitaMotoria? item.attivitaMotoria : []
    this.interventi = item?.interventi? item.interventi : []
    this.allergieIntolleranze = item?.allergieIntolleranze? item.allergieIntolleranze : []
    this.dipendenze = item?.dipendenze? item.dipendenze : []
  }
}

export interface IModelImpegnativaCupModel{
  idVisita : number,
  NumeroImpegnativa : string
}

interface IMnaNrsKarnofskyMustXReferto {
  valutazioneTotaleMust: any
  rischioMalnutrizioneMust: any
  valutazioneScreening: any
  valutazioneGlobale: any
  valutazioneTotale: any
  karnofsky: any
  nrs: any
}

export class MnaNrsKarnofskyMustXReferto implements IMnaNrsKarnofskyMustXReferto{
  valutazioneTotaleMust: any
  rischioMalnutrizioneMust: any
  valutazioneScreening: any
  valutazioneGlobale: any
  valutazioneTotale: any
  karnofsky: any
  nrs: any

  constructor(item: IMnaNrsKarnofskyMustXRefertoDTO) {
    this.valutazioneTotaleMust = item.valutazioneTotaleMust;
    this.rischioMalnutrizioneMust = item.rischioMalnutrizioneMust;
    this.valutazioneScreening = item.valutazioneScreening;
    this.valutazioneGlobale = item.valutazioneGlobale;
    this.valutazioneTotale = item.valutazioneTotale
    this.karnofsky = item.karnofsky;
    this.nrs = item.nrs;
  }
}

interface IAnamnesiAlimentareXReferto {
  note: string
  diagnosiNutrizionale: string
  kcal: number
  azoto: number
  proteine: number
  lipidi: number
  carboidrati: number
}

export class AnamnesiAlimentareXReferto implements IAnamnesiAlimentareXReferto{
  note: string
  diagnosiNutrizionale: string
  kcal: number
  azoto: number
  proteine: number
  lipidi: number
  carboidrati: number

  constructor(item: IAnamnesiAlimentareXRefertoDTO) {
    this.note = item.note;
    this.diagnosiNutrizionale = item.diagnosiNutrizionale;
    this.kcal = item.kcal;
    this.azoto = item.azoto;
    this.proteine = item.proteine;
    this.lipidi = item.lipidi;
    this.carboidrati = item.carboidrati;
  }
}

interface IDatiAntropometrici{
  altezza: number
  pesoattuale: number
  pesoottimale: number
  bmiattuale: number
  bmiottimale: number
  malnutrizione: string
  caloponderale: number
  caloPonderale3Mesi: any
  caloPonderale6Mesi: any
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
  bicipitale: any
  tricipitale: any
  sovrailiaca: any
  sottoscapolare: any
  braccio: any
  polpaccio: any
  lunghezzaUlna: any
  rz: any
  xc: any
  circAddominale: any
  circPolso: any
  impedenza: any
  wh: string
  latoMisurazione: string
  pesominimo: any
  pesomassimo: any
  pesoabituale: any
}

export class DatiAntropometrici implements IDatiAntropometrici{
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

  constructor(item: IDatiAntropometriciDTO) {
    this.altezza = item.altezza;
    this.pesoattuale = item.pesoattuale;
    this.pesoottimale = item.pesoottimale;
    this.bmiattuale = item.bmiattuale;
    this.bmiottimale = item.bmiottimale;
    this.malnutrizione = item.malnutrizione;
    this.caloponderale = item.caloponderale;
    this.caloPonderale3Mesi = item.caloPonderale3Mesi;
    this.caloPonderale6Mesi = item.caloPonderale6Mesi;
    this.dataInizioPatologia = item.dataInizioPatologia;
    this.disfagia = item.disfagia;
    this.gradodisfagia = item.gradodisfagia;
    this.note = item.note;
    this.piagheDecubito = item.piagheDecubito;
    this.allettato = item.allettato;
    this.ritmoSonnoVeglia = item.ritmoSonnoVeglia;
    this.consistenzaPasto = item.consistenzaPasto;
    this.attivita = item.attivita;
    this.alvo = item.alvo;
    this.tipoFeci = item.tipoFeci;
    this.diuresi = item.diuresi;
    this.alimentazioneScelta = item.alimentazioneScelta;
    this.dataCaloPonderale = item.dataCaloPonderale; 
    this.bicipitale = item.bicipitale;
    this.tricipitale = item.tricipitale;
    this.sovrailiaca = item.sovrailiaca;
    this.sottoscapolare = item.sottoscapolare;
    this.braccio = item.braccio;
    this.polpaccio = item.polpaccio;
    this.lunghezzaUlna = item.lunghezzaUlna;
    this.rz = item.rz;
    this.xc = item.xc;
    this.circAddominale = item.circAddominale;
    this.circPolso = item.circPolso;
    this.impedenza = item.impedenza;
    this.wh = item.wh;
    this.latoMisurazione = item.latoMisurazione;
    this.pesominimo = item.pesominimo;
    this.pesomassimo = item.pesomassimo;
    this.pesoabituale = item.pesoabituale;
  }
}

interface IVisitaXReferto {
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

export class VisitaXReferto implements IVisitaXReferto{
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

  constructor(item: IVisitaXRefertoDTO) {
    this.medico = item.medico;
    this.mediconome = item.mediconome;
    this.medicocognome = item.medicocognome;
    this.medicocf = item.medicocf;
    this.medicomail = item.medicomail;
    this.medicoSecondario = item.medicoSecondario;
    this.infermiere = item.infermiere;
    this.dataVisita = item.dataVisita; 
    this.dataeffettivainizio = item.dataeffettivainizio;
    this.dataeffettivafine = item.dataeffettivafine;
    this.ambulatorio = item.ambulatorio;
    this.repartoRichiedente = item.repartoRichiedente;
    this.repartoDegenza = item.repartoDegenza;
    this.postoDegenza = item.postoDegenza;
    this.nosologico = item.nosologico;
    this.tipoalimentazione = item.tipoalimentazione;
    this.idTipoAlimentazione = item.idTipoAlimentazione
    this.idTipoPrestazione = item.idTipoPrestazione;
    this.idVisita = item.idVisita;
    this.identificativodocumento = item.identificativodocumento;
    this.diagnosi = item.diagnosi;
    
  }
}  


