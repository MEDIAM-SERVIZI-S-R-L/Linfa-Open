import { omit } from 'underscore'

import { TipoProdotto } from '../_core/helpers/enums'
import { IUtenteBaseDTO } from '../_dtos/in'

/**
 * Filtro pase per prendere elementi con la paginazione
 */
interface IFiltroBase {
  page?: number // pagina corente
  elementForPage?: number // numero elementi per pagina
  sort?: string // tipo di sort : desc ,act
  columnSort?: string // la columna da sortare
}

/**
 * Classe base per i filtri
 */
export class FiltroBase implements IFiltroBase {
  page: number
  elementForPage: number
  sort: string
  columnSort: string

  /**
   * imposto valori default
   */
  constructor(item?: IFiltroBase | null) {
    ; (this.page = item.page ? item.page : 0),
      (this.elementForPage = item.elementForPage ? item.elementForPage : 10000), // se non passo il filtro imposto numero a 10000 per passare tutti
      (this.sort = item.sort ? item.sort : null),
      (this.columnSort = item.columnSort ? item.columnSort : null)
  }
}

/**
 * Estensione della interfaccia base
 */
interface IFiltroGara extends IFiltroBase {
  prodotto?: string
  idArtificiale: number
  idGara: number
}

/**
 * Classe per il Fitro che vienie usato per pescare prodotti per la gara specifica
 */
export class FiltroGara extends FiltroBase implements IFiltroGara {
  prodotto?: string
  idArtificiale: number
  idGara: number
  /**
   *
   */
  constructor(option: IFiltroGara) {
    super(option)
    this.prodotto = option.prodotto
    this.idArtificiale = option.idArtificiale
    this.idGara = option.idGara
  }
}

interface IFiltroRicercaPaziente extends IFiltroBase {
  nome?: string
  cognome?: string
  cf?: string,
  nosologico?: string,
  dataNascita?: string
}

export class FiltroRicercaPaziente extends FiltroBase implements IFiltroRicercaPaziente {
  nome?: string
  cognome?: string
  cf?: string
  nosologico?: string
  dataNascita?: string

  constructor(option: IFiltroRicercaPaziente) {
    super(option)
    this.nome = option.nome
    this.cognome = option.cognome
    this.cf = option.cf
    this.nosologico = option.nosologico
    this.dataNascita = option.dataNascita
  }
}

//#region Utenti
interface IUtenteBase {
  id: string
  nome: string
  cognome: string
  idUtente: number
}

export class UtenteBase implements IUtenteBase {
  id: string
  nome: string
  cognome: string
  idUtente: number
  matricola: string
  /**
   *
   */
  constructor(item: IUtenteBaseDTO) {
    this.id = item.id
    this.nome = item.nome
    this.cognome = item.cognome
    this.idUtente = item.idUtente

    this.matricola = item.matricola && item.matricola.length > 0 ? item.matricola : null
  }
}

export class UtenteMedico extends UtenteBase implements Omit<UtenteBase, 'idUtente'> {
  nome: string
  cognome: string
  id: string
  matricola: string

  constructor(item: UtenteBase) {
    super(item);

  }


}
//#endregion Utenti



interface IGenericObj {
  objName: string;
  objValue: any;
}
//** Un oggetto generico per passare nel request-udate  */
export class GenericObj implements IGenericObj {
  objName: string;
  objValue: any;
}
