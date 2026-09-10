/* eslint-disable no-debugger */
/**
 *
 * File con i tutti Dto in uscita, da Linfa verso API con le interfacie e le classe di mappatura
 *
 */

import { extend } from 'jquery'
import moment from 'moment'
import { expand } from 'rxjs'
import { forEach } from 'underscore'

import { TipoProdotto, TipoRichiesta } from '../_core/helpers/enums'
import { FiltroBase, FiltroGara, FiltroRicercaPaziente } from '../_models/common'
import { IConfezionamento, IGara, IGareConfezionamenti, IGestioneGareConfezionamenti, IconfezionamentoGare, IgestioneConfezionamentiGare, unitaMisura } from '../_models/confezionamenti'
import { CategoriaConfigurazione, Configurazione, DatMediciDistretti, IDistretto, IOspedale, IReparto, IUtenteDaAssociare } from '../_models/configurazione'
import { InvioMailXPiano, RefertoDaFirmare } from '../_models/documenti'
import { DettaglioRange, IAnalisiFormToRaw, IAnalisiProprietaToRaw, ProprietaAnalisi } from '../_models/paziente'
import { ProdottiAnamnesi, ProdottiPiano, ProdottoAlternativo, ProdottoDettaglio } from '../_models/prodotti'
import { NuovaRichiestaDaInviare, TipoPrestazione } from '../_models/richieste'
import { Prodotti } from '../_module/prodotti/_dto-prodotti/dto-prodotti'

/**
 * La interfacia base per oggetto search : numero elementi paginatore
 */
export interface IBaseSearchToDTO {
  sort: string
  columnSort: string
  page?: number
  elementForPage?: number
}
export interface INrsToDTO {
  idpaziente: string
  idRispostaNRS_StatoNutrizionale: number
  idRispostaNRS_Patologia: number
  rispostePrescreening: number[]
}

/**
 * Classe che trasforma Risposte da Nrs in DTO da inviare al API
 */
export class NrsToDTO implements INrsToDTO {
  idpaziente: string
  idRispostaNRS_StatoNutrizionale: number
  idRispostaNRS_Patologia: number
  rispostePrescreening: number[]
  constructor(
    idPaziente: string,
    idStatoNutrizionale: number,
    idPatologia: number,
    prescreening: number[]
  ) {
    this.idpaziente = idPaziente
    this.idRispostaNRS_StatoNutrizionale = idStatoNutrizionale
    this.idRispostaNRS_Patologia = idPatologia
    this.rispostePrescreening = prescreening
  }
}

/**
 * Passo o Id della visita o del paziente per ricavare i dati per il box
 */
export interface IBoxInfoParamsToDTO {
  idPaziente?: string
  idVisita?: string
}

export interface IDownloadDocumentToDTO {
  idDocumento: string
  idVisita: string
}

export interface IStatPazienteFilterToDTO {
  idPaziente: string
  dal: Date | null
  al: Date | null
}

//#region Prodotti
export interface IFiltroTipoProdottiToDTO {
  ListIdTipoProdotto: TipoProdotto[]
}

interface IProdottiAnamnesiToDTO {
  Prodotti: ProdottoPrincipaleToDTO[]
  Kcal: number
  Proteine: number
  Azoto: number
  Carboidrati: number
  Lipidi: number
  ApportoIdrico: number
  IdVisita: string
  IdPaziente: string
  Note: string
  DiagnosiNutrizionale: string
}


interface IProdottiPianoToDTO extends Omit<IProdottiAnamnesiToDTO, 'DiagnosiNutrizionale' | 'Note'> {
  Diagnosi: string
  NotePianoNutr: string
  IdValutazioneNutrizionale: string
  IdDietaRiferimento: any
}

export class ProdottiPianoToDTO implements IProdottiPianoToDTO {
  Prodotti: ProdottoPrincipaleToDTO[]
  Kcal: number
  Proteine: number
  Azoto: number
  Carboidrati: number
  Lipidi: number
  ApportoIdrico: number
  IdVisita: string
  IdPaziente: string
  Diagnosi: string
  NotePianoNutr: string
  IdValutazioneNutrizionale: string
  IdDietaRiferimento: any

  constructor(item: ProdottiPiano) {
    this.Kcal = item.KcalTotaliDieta;
    this.Proteine = item.ProteineTotaliDieta;
    this.Azoto = item.AzotoTotaliDieta;
    this.Carboidrati = item.CarboidratiTotaliDieta;
    this.Lipidi = item.LipidiTotaliDieta;
    this.ApportoIdrico = item.ApportoIdrico;
    this.IdVisita = item.IdVisita;
    this.IdPaziente = item.IdPaziente;
    this.Diagnosi = item.Diagnosi;
    this.NotePianoNutr = item.NotePianoNutr;
    this.IdDietaRiferimento = item.IdDietaRiferimento;
    this.IdValutazioneNutrizionale = item.IdValutazioneNutrizionale;
    this.Prodotti = [];

    if (item.Prodotti) {
      item.Prodotti.forEach(prodotto => {
        let prodottoConvertito = new ProdottoPrincipaleToDTO(prodotto);
        this.Prodotti.push(prodottoConvertito);
      });
    }
  }
}

export class ProdottiAnamnesiToDTO implements IProdottiAnamnesiToDTO {
  Prodotti: ProdottoPrincipaleToDTO[]
  Kcal: number
  Proteine: number
  Azoto: number
  Carboidrati: number
  Lipidi: number
  ApportoIdrico: number
  IdVisita: string
  IdPaziente: string
  Note: string
  DiagnosiNutrizionale: string


  constructor(item: ProdottiAnamnesi) {
    this.Kcal = item.KcalTotaliDieta;
    this.Proteine = item.ProteineTotaliDieta;
    this.Azoto = item.AzotoTotaliDieta;
    this.Carboidrati = item.CarboidratiTotaliDieta;
    this.Lipidi = item.LipidiTotaliDieta;
    this.ApportoIdrico = item.ApportoIdrico;
    this.IdVisita = item.IdVisita;
    this.IdPaziente = item.IdPaziente;
    this.Note = item.Note;
    this.DiagnosiNutrizionale = item.DiagnosiNutrizionale;
    this.Prodotti = [];
    if (item.Prodotti) {
      item.Prodotti.forEach(prodotto => {
        let prodottoConvertito = new ProdottoPrincipaleToDTO(prodotto);
        this.Prodotti.push(prodottoConvertito);
      });
    }
  }

}



interface IProdottoPrincipaleToDTO {
  Kcal: number
  Proteine: number
  Azoto: number
  Quantita: number
  Acqua: number
  Carboidrati: number
  Lipidi: number
  IdProdotto: number
  IdUnitaMisura: number
  IdPasto: number
  Alternativo: boolean
  IsPercentuale: boolean
  ProdottiAlternativi: ProdottoAlternativoToDTO[]
  idprodottoxvisita?: any
  Settimana?: string[];
}

export class ProdottoPrincipaleToDTO implements IProdottoPrincipaleToDTO {
  Kcal: number
  Proteine: number
  Azoto: number
  Quantita: number
  Acqua: number
  Carboidrati: number
  Lipidi: number
  IdProdotto: number
  IdUnitaMisura: number
  //todo: prevedere la casistica dove non c'è la dieta x pasti
  IdPasto: number
  Alternativo: boolean
  IsPercentuale: boolean
  ProdottiAlternativi: ProdottoAlternativoToDTO[]
  idprodottoxvisita?: number
  Settimana?: string[];


  constructor(item: ProdottoDettaglio) {
    this.Kcal = item.kcalCalcolate;
    this.Proteine = item.proteineCalcolate
    this.Azoto = item.azotoCalcolato;
    this.Quantita = item.quantita;
    this.Acqua = item.acquacalcolata;
    this.Carboidrati = item.carboidaratiCalcolati;
    this.Lipidi = item.lipidiCalcolati;
    this.IdProdotto = item.id;
    this.IdUnitaMisura = item.idUnitaMisura;
    //todo
    this.IdPasto = item.pasto?.id;

    this.Alternativo = item.alternativoAbilitato;
    this.IsPercentuale = false;
    this.idprodottoxvisita = item.idprodottoxvisita ? item.idprodottoxvisita : null;
    this.ProdottiAlternativi = [];

    if (item.prodottiAlternativi) {
      item.prodottiAlternativi.forEach(prodottoAlternativo => {
        let prodottoAltConvertito = new ProdottoAlternativoToDTO(prodottoAlternativo);
        this.ProdottiAlternativi.push(prodottoAltConvertito);
      });
    }

    if (item.settimana) {
      let stringArray: string[] = [];
      item.settimana.lunedi === true ? stringArray.push('lun') : stringArray = stringArray;
      item.settimana.martedi === true ? stringArray.push('mar') : stringArray = stringArray;
      item.settimana.mercoledi === true ? stringArray.push('mer') : stringArray = stringArray;
      item.settimana.giovedi === true ? stringArray.push('gio') : stringArray = stringArray;
      item.settimana.venerdi === true ? stringArray.push('ven') : stringArray = stringArray;
      item.settimana.sabato === true ? stringArray.push('sab') : stringArray = stringArray;
      item.settimana.domenica === true ? stringArray.push('dom') : stringArray = stringArray;
      this.Settimana = stringArray;
    }
  }
}

interface IProdottoAlternativoToDTO {
  Quantita: number
  IdProdotto: number
  IdUnitaMisura: number
  Proteine: number
  Azoto: number
  Kcal: number
  Carboidrati: number
  Lipidi: number
  Acqua: number
  IsPercentuale: boolean
  idprodottoxvisita: number
}

export class ProdottoAlternativoToDTO implements IProdottoAlternativoToDTO {
  Quantita: number
  IdProdotto: number
  IdUnitaMisura: number
  Proteine: number
  Azoto: number
  Kcal: number
  Carboidrati: number
  Lipidi: number
  Acqua: number
  IsPercentuale: boolean
  idprodottoxvisita: number

  constructor(item: ProdottoAlternativo) {
    this.Quantita = item.quantita;
    this.IdProdotto = item.id;
    this.IdUnitaMisura = item.idUnitaMisura;
    this.Proteine = item.proteineCalcolate;
    this.Azoto = item.azotoCalcolato;
    this.Kcal = item.kcalCalcolate;
    this.Carboidrati = item.carboidaratiCalcolati;
    this.Lipidi = item.lipidiCalcolati;
    this.Acqua = item.acquacalcolata;

    this.IsPercentuale = null;
    this.idprodottoxvisita = item.idprodottoxvisita ? item.idprodottoxvisita : null;
  }

}

//#endregion Prodotti

//#region Documenti
interface IDocumentSignToDTO {
  File: string // nome hash del documento,
  IdVisita: string
}
export class DocumentSignToDTO implements IDocumentSignToDTO {
  File: string
  IdVisita: string
  /**
   *
   */
  constructor(item: RefertoDaFirmare) {
    this.File = item.idReferto
    this.IdVisita = item.idVisita
  }
}

interface IToSignDTO extends IDocumentSignToDTO {
  Pin: string
  OTP: string
}

export class ToSignDTO implements IToSignDTO {
  Pin: string
  OTP: string
  File: string
  IdVisita: string
  /**
   *
   */
  constructor(file, idVisita, OTP, Pin) {
    this.File = file
    this.IdVisita = idVisita
    this.OTP = OTP
    this.Pin = Pin
  }
}

interface IToSignMultipleDTO {
  Pin: string
  OTP: string
  singleReport: IDocumentSignToDTO[]
}

export class ToSignMultipleDTO implements IToSignMultipleDTO {
  Pin: string
  OTP: string
  test: boolean
  singleReport: IDocumentSignToDTO[]
  /**
   *
   */
  constructor(Pin: string, OTP: string, test = false, singleReportArray: RefertoDaFirmare[]) {
    this.OTP = OTP,
      this.Pin = Pin,
      this.test = test
    this.singleReport = []

    singleReportArray?.forEach((item) => {
      this.singleReport?.push(new DocumentSignToDTO(item))
    })
  }
}

interface IFirmaLocalmente {
  IndexOfDeviceToUse: string,
  PinCode: string,
  PdfData: string,
  CF: string
}
/**
 * Oggetto che viene usato per inviare informazioni al servizio locale della firma digitale. Software di Mediam per le schede digitale
 */
export class FirmaLocalmenteToDTO implements IFirmaLocalmente {
  IndexOfDeviceToUse: string
  PinCode: string
  PdfData: string
  CF: string
  /**
   *
   */
  constructor(device: string, pin: string, pdfBase64: string, cf: string) {
    this.IndexOfDeviceToUse = device;
    this.CF = cf;
    this.PdfData = pdfBase64;
    this.PinCode = pin

  }
}


interface IInvioMailXPianoToDTO {
  file: string,
  email: string,
  name: string
}

export class InvioMailXPianoToDTO implements IInvioMailXPianoToDTO {
  file: string
  email: string
  name: string

  constructor(item: InvioMailXPiano) {
    this.file = item.base64File,
      this.email = item.mail,
      this.name = item.nome
  }
}


//#endregion Documenti

//#region Gare

interface IFiltroGaraToDTO {
  prodotto?: string
  idArtificiale: number
  idGara: number
}
export class FiltroGaraToDTO extends FiltroBase implements IFiltroGaraToDTO {
  prodotto?: string
  idArtificiale: number
  idGara: number
  constructor(options: FiltroGara) {
    super(options)
    this.prodotto = options.prodotto
    this.idArtificiale = options.idArtificiale
    this.idGara = options.idGara
  }
}
//#endregion gare

//#region Analisi

interface IAnalisiToDTO {
  id: string | null
  idPaziente: string | null
  DataEsame: Date
  Descrizione: string
  RecordEliminato: boolean
  valoriEsame: IAnalisiValoriToDTO[]
}

interface IAnalisiValoriToDTO {
  valore: string | null
  idXValoriEsami: number
}
class AnalisiValoriToDTO implements IAnalisiValoriToDTO {
  valore: string | null
  idXValoriEsami: number
  /**
   *
   */
  constructor(item: IAnalisiProprietaToRaw) {
    this.idXValoriEsami = item.id
    this.valore = item.valore != null ? item.valore.toString() : null
  }
}

export class AnalisiToDTO implements IAnalisiToDTO {
  id: string | null
  idPaziente: string
  DataEsame: Date
  Descrizione: string
  RecordEliminato: boolean
  valoriEsame: IAnalisiValoriToDTO[]
  /**
   *
   */
  constructor(item: IAnalisiFormToRaw) {
    // super();
    this.id = item.idAnalisi || null

    this.Descrizione = item.descrizione
    this.idPaziente = item.idPaziente
    this.DataEsame = item.dataAnalisi
    this.valoriEsame = []
    item.listaProprieta.forEach((element) => {
      this.valoriEsame.push(new AnalisiValoriToDTO(element))
    })
  }
}

//#endregion Analisi

//#region Distretto + OrderEntry

///Interfaccia Distretto in uscita
export interface IDistrettoToDTO {
  Id?: number
  Descr: string
  RecordEliminato?: boolean
  ApprovazioneAutomatica?: boolean
}

///Classe per la conversione dell'interfaccia del distretto da quella in uso a quella in uscita
export class DistrettoToDTO implements IDistrettoToDTO {
  Id?: number
  Descr!: string
  RecordEliminato?: boolean | undefined
  ApprovazioneAutomatica?: boolean | undefined

  constructor(item: IDistretto) {
    this.Id = item.id
    this.Descr = item.descrizione
    this.RecordEliminato = item.recordEliminato
    this.ApprovazioneAutomatica = item.approvazioneAutomatica
  }
}

export interface IOspedaleToDTO {
  Id?: number
  Cod: string
  Descr: string
  IdStruttura?: number
  RecordEliminato?: boolean
}

export class OspedaleToDTO implements IOspedaleToDTO {
  Id?: number | undefined
  Cod: string
  Descr: string
  IdStruttura?: number | undefined
  RecordEliminato?: boolean | undefined

  constructor(item: IOspedale) {
    this.Id = item.id
    this.Cod = item.cod
    this.Descr = item.descrizione
    this.IdStruttura = item.idStruttura
    this.RecordEliminato = item.recordEliminato
  }
}

export interface IRepartoToDTO {
  Id?: number
  Descr: string
  IdOspedale: number
  RecordEliminato?: boolean
  centroCosto: string;
}

export class RepartoToDTO implements IRepartoToDTO {
  Id?: number | undefined
  Descr: string
  IdOspedale: number
  RecordEliminato?: boolean | undefined
  centroCosto: string

  constructor(item: IReparto) {
    this.Id = item.id
    this.Descr = item.descrizione
    this.IdOspedale = item.idOspedale
    this.RecordEliminato = item.recordEliminato
    this.centroCosto = item.centroCosto;
  }
}

export interface IUtenteDaAssociareToDTO {
  IdUtente: string
  IdEnte: number
  IdTipoEnte: number
  RecordEliminato?: boolean
}

export class UtenteDaAssociareToDTO implements IUtenteDaAssociareToDTO {
  IdUtente: string
  IdEnte: number
  IdTipoEnte: number
  RecordEliminato?: boolean | undefined

  constructor(item: IUtenteDaAssociare) {
    this.IdUtente = item.idUtente
    this.IdEnte = item.idEnte
    this.IdTipoEnte = item.idTipoEnte
    this.RecordEliminato = !item.associato
  }
}


interface IDatMediciDistrettiToDTO {
  IdUtente: number,
  IdDistretto: number,
  RecordEliminato: boolean
}

export class DatMediciDistrettoToDTO implements IDatMediciDistrettiToDTO {
  IdUtente: number
  IdDistretto: number
  RecordEliminato: boolean
  constructor(item: DatMediciDistretti) {
    this.IdDistretto = item.idDistretto;
    this.IdUtente = item.idUtente;
    this.RecordEliminato = !item.associato;
  }
}
//#endregion Distretto + OrderEntry

//#region Confezionamenti

export interface IConfezionamentoToDTO {
  IdConfezionamento?: number;
  IdProdotto: number;
  IdUnitaMisura: number;
  Quantita: number;
  RecordEliminato?: boolean;
  Disponibile: boolean;
  Prezzo: number;
}


export class ConfezionamentoToDTO implements IConfezionamentoToDTO {
  IdConfezionamento?: number;
  IdProdotto!: number;
  IdUnitaMisura!: number;
  Quantita!: number;
  RecordEliminato?: boolean | undefined;
  Disponibile!: boolean;
  Prezzo!: number;

  constructor(item: IConfezionamento) {
    this.IdConfezionamento = item.id;
    this.IdProdotto = item.idProdotto;
    this.IdUnitaMisura = item.idUnitaMisura as number;
    this.Quantita = item.quantita as number;
    this.Disponibile = item.disponibile;
    this.Prezzo = item.prezzo as number;
    this.RecordEliminato = item.recordEliminato;
  }
}


export interface IGaraToDTO {
  Id?: number;
  Gara: string;
  ValidaDal: Date;
  ValidaAl: Date;
  Erogatore: string;
  Fruitore: string;
  RecordEliminato?: boolean;
}

export class GaraToDto implements IGaraToDTO {
  Id: number | undefined
  Gara!: string
  ValidaDal!: Date
  ValidaAl!: Date
  Erogatore!: string
  Fruitore!: string
  RecordEliminato?: boolean | undefined
  abilitata?: boolean

  constructor(item: IGara) {
    this.Id = item.idGara
    this.Gara = item.gara
    this.ValidaDal = item.validaDal
    this.ValidaAl = item.validaAl
    this.Erogatore = item.erogatore
    this.Fruitore = item.fruitore
    this.RecordEliminato = item.recordEliminato
    this.abilitata = item.abilitata
  }
}

export interface IgestioneConfezionamentiGareToDTO {
  IdGara: number
  ConfezionamentiGare: IconfezionamentoGareToDTO[]
}

export class gestioneConfezionamentiGareToDTO
  implements IgestioneConfezionamentiGareToDTO {
  IdGara: number
  ConfezionamentiGare: IconfezionamentoGareToDTO[]

  constructor(item: IgestioneConfezionamentiGare) {
    this.IdGara = item.idGara;
    this.ConfezionamentiGare = [];
    for (const confezionamento of item.confezionamentiGare) {
      const x = new confezionamentoGareToDTO(confezionamento);
      this.ConfezionamentiGare.push(x);
    }
  }
}

export interface IconfezionamentoGareToDTO {
  IdConfezionamento: number
  RecordEliminato: boolean
}

export class confezionamentoGareToDTO implements IconfezionamentoGareToDTO {
  IdConfezionamento: number
  RecordEliminato: boolean

  constructor(item: IconfezionamentoGare) {
    this.IdConfezionamento = item.idConfezionamento
    this.RecordEliminato = item.recordEliminato
  }
}

export interface IGestioneGareConfezionamentiToDTO {
  IdConfezionamento: number;
  GareConfezionamenti: IGareConfezionamentiToDTO[];
}

export class GestioneConfezionamentiToDTO implements IGestioneGareConfezionamentiToDTO {
  IdConfezionamento: number
  GareConfezionamenti: IGareConfezionamentiToDTO[]

  constructor(item: IGestioneGareConfezionamenti) {
    this.IdConfezionamento = item.idConfezionamento;
    this.GareConfezionamenti = [];

    for (const gara of item.gareConfezionamenti) {
      const x = new GareConfezionamentiToDTO(gara);
      this.GareConfezionamenti.push(x);
    }
  }
}



export interface IGareConfezionamentiToDTO {
  IdGara: number;
  RecordEliminato: boolean;
}


export class GareConfezionamentiToDTO implements IGareConfezionamentiToDTO {
  IdGara: number
  RecordEliminato: boolean

  constructor(item: IGareConfezionamenti) {
    this.IdGara = item.idGara;
    this.RecordEliminato = item.recordEliminato;
  }

}
//#endregion Confezionamenti

//#region ricerca paziente interna e esterna

export interface IPazienteEsternoToDTO {
  cf?: string
  nome?: string
  cognome?: string
  dataNascita?: string
}

export class PazienteEsternoToDto implements IPazienteEsternoToDTO {
  cf?: string
  nome?: string
  cognome?: string
  dataNascita?: string

  constructor(item: FiltroRicercaPaziente) {
    this.cf = item.cf
    this.nome = item.nome
    this.cognome = item.cognome
    this.dataNascita = item.dataNascita
    // if(item.hasOwnProperty('codice'))
    // {
    //   this.codice = item.codice
    // }
  }
}

//#endregion ricerca paziente interna e esterna

//#region Richieste

interface INuovaRichiestaMirth {
  idPazienteLinfa: string
  primaVisita: string
  idPazienteCup: string
  cognome: string
  nome: string
  cf: string
  dataNascita: string
  sesso: string
  comuneIstatResidenza: string
  capResidenza: string
  indirizzoResidenza: string
  comuneIstatDomicilio: string
  capDomicilio: string
  indirizzoDomicilio: string
  email: string
  telefono1: string
  telefono2: string
  nosologico: string | number | null
  postoDegenza: string | null
  dataPrestazione: string
  idRichiestaCup: string
  priorita: string
  centrodiCosto: string
  repartoRichiedente: string
  matricolaMedico: string
  motivoRichiesta: string

}


export class NuovaRichiestaMirthToDTO implements INuovaRichiestaMirth {
  idPazienteLinfa: string
  primaVisita: string
  idPazienteCup: string
  cognome: string
  nome: string
  cf: string
  dataNascita: string
  sesso: string
  comuneIstatResidenza: string
  comuneIstatIstatNascita: string
  comuneNascita: string // forse non serve ?
  cittadinanza: string  // forse non serve ?
  capResidenza: string
  indirizzoResidenza: string
  comuneIstatDomicilio: string
  capDomicilio: string
  indirizzoDomicilio: string
  email: string
  telefono1: string
  telefono2: string
  nosologico: string | number | null
  postoDegenza: string | null
  dataPrestazione: string
  idRichiestaCup: string
  priorita: string
  centrodiCosto: string
  repartoRichiedente: string
  motivoRichiesta: string
  esterno: boolean
  matricolaMedico: string
  matricolaDietista: string
  matricolaInfermiera: string
  durataPrestazione: number
  secondaVisita: string
  idTipoRichiesta: number
  idTipoPrestazione: number;
  forzaInserimento: boolean;

  constructor(item: NuovaRichiestaDaInviare) {

    //TODO: Oggetto che vienie passato da Mirth
    this.idPazienteLinfa = item.paziente.idPaziente;
    this.primaVisita = null;  // compilato solo da ASL1 in LinfaSync
    this.secondaVisita = null // compilato solo da ASL1 in LinfaSync
    this.idPazienteCup = null;
    this.cognome = item.paziente.cognome;
    this.nome = item.paziente.nome;
    this.cf = item.paziente.cf;
    this.dataNascita = item.paziente.dataNascita ? moment(item.paziente.dataNascita).format('YYYY-MM-DD HH:mm:ss') : null; //item.paziente.dataNascita.toString();
    this.sesso = item.paziente.sesso;

    this.comuneIstatResidenza = (item.paziente.comuneResidenzaCodice)?.toString();
    this.comuneIstatDomicilio = item.paziente.comuneDomicilioCodice ? item.paziente.comuneDomicilioCodice : null;

    this.indirizzoResidenza = item.paziente.indirizzoResidenza;
    this.indirizzoDomicilio = item.paziente.indirizzoDomicilio;

    this.capResidenza = item.paziente.capResidenza;
    this.capDomicilio = item.paziente.capDomicilio;

    this.email = item.paziente.email ? item.paziente.email : null;
    this.telefono1 = item.paziente.telefono ? item.paziente.telefono.toString() : null;
    this.telefono2 = null;

    this.nosologico = item.richiesta.nosologico ? item.richiesta.nosologico : null;
    this.postoDegenza = item.richiesta.postoDegenza ? item.richiesta.postoDegenza : null;
    this.dataPrestazione = item.richiesta.dataOraPrestazione ? moment(item.richiesta.dataOraPrestazione).format('YYYY-MM-DD HH:mm:ss') : null;

    this.idRichiestaCup = null;
    this.priorita = item.richiesta.priorita ? item.richiesta.priorita.toString() : null;
    this.centrodiCosto = item.richiesta.matricolaAmbulatorio // centroDiCosto
    this.repartoRichiedente = null;
    this.matricolaMedico = item.richiesta.matricolaMedico;
    this.matricolaDietista = item.richiesta.matricolaDietista ? item.richiesta.matricolaDietista : null;
    this.matricolaInfermiera = item.richiesta.matricolaInfermiera ? item.richiesta.matricolaInfermiera : null
    this.motivoRichiesta = item.richiesta.motivoRichiesta;
    this.esterno = item.paziente.esterno;

    this.comuneIstatIstatNascita = item.paziente.comuneNascitaCodice ? item.paziente.comuneNascitaCodice.toString() : null;

    this.durataPrestazione = null;

    this.idTipoRichiesta = item.richiesta.tipoRichiesta;

    this.idTipoPrestazione = item.richiesta.tipoPrestazione;
    this.forzaInserimento = null // per cosa serve ?
    //TODO: Proprieta della richiesta fatta da linfa



  }

}
//#endregion Richiesta
//#region Analisi del sangue

interface IDettaglioRangeToDTO {
  Id: number,
  Descrizione: string,
  IdUnitaMisura?: number,
  IdValoriEsami: number,
  Min: number,
  Max: number,
  EtaMin: number,
  EtaMax: number,
  Sesso: string,
  unitaMisura?: string,
  recordEliminato?: boolean
}

export class DettaglioRangeToDTO implements IDettaglioRangeToDTO {
  Id: number
  Descrizione: string
  IdUnitaMisura?: number
  IdValoriEsami: number
  Min: number
  Max: number
  EtaMin: number
  EtaMax: number
  Sesso: string
  unitaMisura?: string
  recordEliminato?: boolean

  constructor(item: DettaglioRange) {
    this.Id = item.id;
    this.Descrizione = item.descrizione;
    this.IdUnitaMisura = item.idUnitaMisura;
    this.IdValoriEsami = item.idValoriEsami;
    this.Min = item.min;
    this.Max = item.max;
    this.EtaMin = item.etaMin;
    this.EtaMax = item.etaMax;
    this.Sesso = item.sesso;
    this.unitaMisura = item.unitaMisura;
    this.recordEliminato = item.recordEliminato;

  }
}


interface IProprietaAnalisiToDTO {
  Id: number,
  Descrizione: string,
  IdCategorieEsami: number,
  UnitaMisura: string | null,
  TipoValore: string,
  RecordEliminato?: boolean,
}


export class ProprietaAnalisiToDTO implements IProprietaAnalisiToDTO {
  Id: number
  Descrizione: string
  IdCategorieEsami: number
  UnitaMisura: string
  TipoValore: string
  RecordEliminato?: boolean

  constructor(item: ProprietaAnalisi) {
    this.Id = item.idProprieta;
    this.Descrizione = item.descrizione;
    this.IdCategorieEsami = item.idCategorieAnalisi;
    this.UnitaMisura = item.unitaMisura;
    this.TipoValore = item.tipoCampo;
    if (item.recordEliminato) {
      this.RecordEliminato = item.recordEliminato;
    }
  }
}

interface ISaveDiagnosiToDTO {
  idVisita: string,
  diagnosi: string
}

export class SaveDiagnosiToDTO implements ISaveDiagnosiToDTO {
  idVisita: string
  diagnosi: string
  constructor(idVisita: string, diagnosi: string) {
    this.idVisita = idVisita;
    this.diagnosi = diagnosi;
  }
}

  //#region Categoria configurazione
  interface ICategoriaConfigurazioneToDTO {
    id: number
    categoriaConfigurazione: string
    abilitato: boolean
  }

  export class CategoriaConfigurazioneToDTO implements ICategoriaConfigurazioneToDTO{
    id: number;
    categoriaConfigurazione: string;
    abilitato: boolean;

    constructor(item: CategoriaConfigurazione) {
        this.id = item.id;
        this.categoriaConfigurazione = item.categoriaConfigurazione;
        this.abilitato = item.abilitato;
    }
  }
  //#endregion

    //#region config
    interface IConfigurazioneToDTO {
      Id: number
      Descrizione: string
      Proprieta: string
      Valore: string
      Abilitato: boolean
      IdCategoriaConfigurazione : number
    }
  
    export class ConfigurazioneToDTO implements IConfigurazioneToDTO{
      Id: number
      Descrizione: string
      Proprieta: string
      Valore: string
      Abilitato: boolean
      IdCategoriaConfigurazione: number
      constructor(item: Configurazione){
        this.Id = item.id;
        this.Descrizione = item.descrizione;
        this.Proprieta = item.proprieta;
        this.Valore = item.valore;
        this.Abilitato = item.abilitato;
        this.IdCategoriaConfigurazione = item.idcategoriaConfig;
      }
    }
    //#endregion