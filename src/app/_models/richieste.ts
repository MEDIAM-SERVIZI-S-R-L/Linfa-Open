import { TipoRichiesta } from '../_core/helpers/enums'
import {
  IAmbulatorioDTO,
  IPrioritaDTO,
  ITipiRichiestaDTO,
  ITipoPrestazioneDTO,
} from '../_dtos/in'
import { PazienteNuovaRichiesta } from './paziente'

/**
 * Class per le priorita
 */
export class Priorita implements IPrioritaDTO {
  id: number
  priorita: string
  acronimo: string
  /**
   *
   */
  constructor(item: IPrioritaDTO) {
    //super();
    this.acronimo = item.acronimo
    this.id = item.id
    this.priorita = item.priorita
  }
}

/**
 *  Tipi richeista
 *  */
interface ITipiRichiesta {
  id: number
  tipoRichiesta: string
  disabled: boolean
}
export class TipiRichiesta implements ITipiRichiesta {
  id: number
  tipoRichiesta: string
  disabled: boolean
  constructor(item: ITipiRichiestaDTO, disabled: boolean) {
    this.id = item.id
    this.tipoRichiesta = item.tipoRichiesta
    this.disabled = disabled

    //** Qui gestisco se il tipo della richiesta è abilitato per utente che sta facendo la richiesta  */
  }
}

/**
 * Tipo Prestazione
 */
export class TipoPrestazione implements ITipoPrestazioneDTO {
  id: number
  tipoPrestazione: string

  constructor(item: ITipoPrestazioneDTO) {
    this.id = item.id
    this.tipoPrestazione = item.tipoPrestazione
  }
}

export class Ambulatorio implements IAmbulatorioDTO {
  idStruttura: number
  idCup: string
  descr: string
  centrodiCosto: string
  id: number
  repartoInterno: boolean
  /**
   *
   */
  constructor(item: IAmbulatorioDTO) {
    this.id = item.id
    this.idCup = item.idCup
    this.descr = item.descr
    this.idStruttura = item.idStruttura
    this.repartoInterno = item.repartoInterno
    //this.centrodiCosto= item.centrodiCosto


    this.centrodiCosto= item.centrodiCosto && item.centrodiCosto.length>0 ?item.centrodiCosto: null
  }
}

interface INuovaRichiesta {
  tipoRichiesta: TipoRichiesta
  tipoPrestazione: number
  priorita: Priorita
  dataOraPrestazione: Date
  motivoRichiesta: string // Quesito diagnostico
  matricolaMedico: string // dobbiamo usare la matricola usata in configurazione Linfa
  matricolaDietista: string
  matricolaAmbulatorio: string // centro di costo
  matricolaInfermiera: string  // matricola infermiera
  nosologico: string | number
  postoDegenza: string

  /*

"IdTipoRichiesta": 2,
		"IdPriorita": 1,
		"MotivoRichiesta": "",
		"DataPrestazione": "2023-06-01T11:15:00+02:00",
		"DurataPrestazione": 0,
		"IdTipoPrestazione": 1,
		"IdStatoRichiesta": 10,
		"IdMedicoPrincipale": 31,
		"IdMedicoSecondario": 26,
		"IdAmbulatorio": 3,
		"RepartoRichiedente": "Repartooo",
		"Infermiere": ""

*/
}

export class NuovaRichiesta implements INuovaRichiesta {
  tipoRichiesta: TipoRichiesta
  tipoPrestazione: number
  priorita: Priorita
  dataOraPrestazione: Date
  motivoRichiesta: string
  matricolaMedico: string
  matricolaDietista: string
  matricolaAmbulatorio: string
  matricolaInfermiera: string
  nosologico: string | number
  postoDegenza: string
  /**
   *
   */
  constructor(matricolaMedico,tipoRichiesta,tipoPrestazione,priorita,dataOraPrestazione= null,motivoRichiesta= null,matricolaDietista= null,matricolaAmbulatorio= null,matricolaInfermiera=null,  nosologico  = null, postoDegenza= null) {

   this.tipoRichiesta= tipoRichiesta;
   this.tipoPrestazione= tipoPrestazione;
   this.dataOraPrestazione = dataOraPrestazione;
   this.motivoRichiesta= motivoRichiesta;
   this.matricolaDietista= matricolaDietista;
   this.matricolaAmbulatorio= matricolaAmbulatorio;
   this.matricolaInfermiera= matricolaInfermiera
   this.priorita= priorita;
   this.matricolaMedico= matricolaMedico
   this.nosologico= nosologico
   this.postoDegenza= postoDegenza
  //  priorita;
   // dataOraPrestazione;
  //  motivoRichiesta;
  //  matricolaDietista;
  }
}

interface INuovaRichiestaDaInviare {
  paziente: PazienteNuovaRichiesta
  richiesta: NuovaRichiesta
}

export class NuovaRichiestaDaInviare implements INuovaRichiestaDaInviare {
  paziente: PazienteNuovaRichiesta
  richiesta: NuovaRichiesta
  /**
   *
   */
  constructor(paziente: PazienteNuovaRichiesta,richiesta: NuovaRichiesta) {
   // debugger;
    this.paziente=paziente;
   this.richiesta= richiesta
  }
}
