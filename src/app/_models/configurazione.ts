import { ICategoriaConfigurazioneDTO,  IConfezionamentoDTO, IConfigurazioneDTO, IConfigurazioneEasyDTO, IDistrettoDTO, IEnteDTO, IEntiXUtenteDTO, IManageDefaultDataDTO, IMedicoXDistrettoDTO, IOspedaleDTO, IRepartoDTO } from "../_dtos/in";



//#region Distretto + OrderEntry


///interfaccia distretto
export interface IDistretto{
    id?: number;
    descrizione: string;
    recordEliminato?: boolean;
    approvazioneAutomatica?: boolean;
    arrayMediciAssociati? : MedicoXDistretto[];
    arrayMedici? : MedicoXDistretto[];
  }
  
  ///Classe per la conversione dell'interfaccia, da quella in arrivo a quella che si usa
  export class Distretto implements IDistretto {
    id?: number
    descrizione: string
    recordEliminato?: boolean
    approvazioneAutomatica?: boolean
    arrayMediciAssociati? : MedicoXDistretto[];
    arrayMedici? : MedicoXDistretto[];

  
    constructor(item: IDistrettoDTO){
      this.id = item.iddistretto;
      this.descrizione = item.descr;
      this.approvazioneAutomatica = item.approvazioneAutomatica;
    }
  
  }

  interface IMedicoXDistretto{
    idMedico:number,
    medico : string,
    associatoDistretto : boolean
  }

  export class MedicoXDistretto implements IMedicoXDistretto{
    idMedico : number;
    medico : string;
    associatoDistretto : boolean;

    constructor(item: IMedicoXDistrettoDTO) {
      this.idMedico = item.idMedico;
      this.medico = item.medico;
      this.associatoDistretto = item.associatoDistretto? item.associatoDistretto : false;
    }
  }


  interface IDatMediciDistretti {
    idUtente : number,
    idDistretto : number,
    associato : boolean
  }

  export class DatMediciDistretti implements IDatMediciDistretti{
    idUtente: number;
    idDistretto: number;
    associato: boolean;
  }


  export interface IOspedale {
    id? : number;
    cod: string;
    descrizione: string;
    idStruttura?: number;
    recordEliminato? : boolean;
  }


  export class Ospedale implements IOspedale{

    id?: number | undefined;
    cod: string;
    descrizione: string;
    idStruttura?: number | undefined;
    recordEliminato?: boolean | undefined;

    constructor(item: IOspedaleDTO) {
      this.id = item.idospedale;
      this.cod = item.cod;
      this.descrizione = item.descr;
    }
  }


  export interface IReparto {
    id?: number;
    descrizione: string;
    idOspedale : number;
    recordEliminato?: boolean;
    ospedale?: string
    centroCosto: string
  }

  export class Reparto implements IReparto{
    id?: number | undefined;
    descrizione: string;
    idOspedale: number;
    recordEliminato?: boolean | undefined;
    ospedale?: string | undefined;
    centroCosto: string;

    constructor(item: IRepartoDTO){
      this.id = item.idreparto;
      this.descrizione = item.descr;
      this.idOspedale = item.idOspedale;
      this.ospedale = item.ospedale;
      this.centroCosto = item.centroCosto;
    }
  }

  export interface IEnte{
    idTipoEnte?: number;
    cod: string;
    descrizione: string;
  }
  
  
  export class Ente implements IEnte{
  
    idTipoEnte?: number;
    cod: string;
    descrizione: string;
  
    constructor(item: IEnteDTO){
      this.idTipoEnte = item.idtipoente;
      this.cod = item.cod;
      this.descrizione = item.descr;
    }
  }
  
  export interface IEntiXUtente{
    idente: number;
    ente: string;
    ospedale? : string;
    associato: boolean;
  }
  
  export class EntiXUtente implements IEntiXUtente{
  
    idente: number;
    ente: string;
    ospedale?: string | undefined;
    associato: boolean;
  
    constructor(item: IEntiXUtenteDTO){
      this.idente = item.idente;
      this.ente = item.ente;
      this.ospedale = item.ospedale;
      this.associato = item.associato;
    }
  
  }
  export interface IUtenteDaAssociare{
    idUtente: string;
    idEnte: number;
    idTipoEnte: number;
    associato?: boolean;
  }
  //#endregion Distretto + OrderEntry

  interface IManageDefaultData{
    nomeTabella : string,
    stato : boolean
  }
  export class ManageDefaultData implements IManageDefaultData{
    nomeTabella: string;
    stato: boolean;
    constructor(item : IManageDefaultDataDTO) {
      this.nomeTabella = item.table;
      this.stato = item.import; 
    }
  }


  interface IDefaultData{
    nomeTabella : string;
    check? : boolean
  }

  export class DefaultData implements IDefaultData{
    nomeTabella: string;
    check?: boolean;
    length: boolean;
    constructor(item: string){
      this.nomeTabella = item;
      this.check = false;
    }
  }

  //#region Categoria configurazione
  interface ICategoriaConfigurazione {
    id: number
    categoriaConfigurazione: string
    abilitato: boolean
    coreConfigurazioni: any
  }

  export class CategoriaConfigurazione implements ICategoriaConfigurazione{
    id: number;
    categoriaConfigurazione: string;
    abilitato: boolean;
    coreConfigurazioni: any;

    constructor(item: ICategoriaConfigurazioneDTO) {
        this.id = item.id;
        this.categoriaConfigurazione = item.categoriaConfigurazione;
        this.abilitato = item.abilitato;
        this.coreConfigurazioni = item.coreConfigurazioni;
    }
  }


  interface IConfigurazioneEasy{
    id: number,
    proprieta: string
  }

  export class ConfigurazioneEasy implements IConfigurazioneEasy{
    id: number;
    proprieta: string;
    constructor(item: IConfigurazioneEasyDTO){
      this.id = item.id;
      this.proprieta = item.proprieta;
    }
  }
  //#endregion

  //#region config
  interface IConfigurazione {
    id: number
    descrizione: string
    proprieta: string
    valore: string
    abilitato: boolean
    idcategoriaConfig : number
    categoriaConfigurazione?: string
    recordEliminato? :boolean
  }

  export class Configurazione implements IConfigurazione{
    id: number;
    descrizione: string;
    proprieta: string;
    valore: string;
    abilitato: boolean;
    idcategoriaConfig: number;
    categoriaConfigurazione?: string
    recordEliminato? :boolean

    constructor(item:IConfigurazioneDTO){
      this.id = item.id,
      this.descrizione = item.descrizione,
      this.proprieta = item.proprieta,
      this.valore = item.valore,
      this.abilitato = item.abilitato,
      this.idcategoriaConfig = item.idCategoriaConfigurazione,
      this.categoriaConfigurazione = item.categoriaConfigurazione,
      this.recordEliminato = item.recordEliminato
    }
  }
  //#endregion