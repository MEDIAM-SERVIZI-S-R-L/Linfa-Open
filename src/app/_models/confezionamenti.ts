import { IConfezionamentoDTO, IGaraDTO } from "../_dtos/in";


export interface IConfezionamento{
    idProdotto: number;
    disponibile: boolean;
    id?: number;
    idUnitaMisura?: number;
    prezzo?: number;
    quantita?: number;
    unitaMisura?: string;
    nPianiCoinvolti?: number;
    recordEliminato?: boolean;
    listaGare?: number[];
  }

export class Confezionamento implements IConfezionamento{
    idProdotto!: number;
    disponibile!: boolean;
    id: number | undefined;
    idUnitaMisura: number | undefined;
    prezzo?: number | undefined;
    quantita?: number | undefined;
    unitaMisura?: string | undefined;
    nPianiCoinvolti?: number | undefined;
    recordEliminato?: boolean;
    listaGare?: number[];
  
    constructor(item: IConfezionamentoDTO) {
      this.idProdotto = item.idProdotto;
      this.disponibile = item.disponibile;
      this.id = item.id;
      this.idUnitaMisura = item.idUnitaMisura;
      this.prezzo = item.prezzo;
      this.quantita = item.quantita;
      this.unitaMisura = item.unitaMisura;
      this.nPianiCoinvolti = item.nPianiCoinvolti;
      this.listaGare = item.listaGare;
    }
  }

  export interface unitaMisura{
    id: number,
    unitaMisura: string,
  }



  export interface IGara{
    idGara?: number;
    gara: string;
    validaDal: Date;
    validaAl: Date;
    erogatore: string;
    fruitore: string;
    recordEliminato?: boolean;
    abilitata?: boolean;
  }

  export class Gara implements IGara{
    idGara!: number;
    gara!: string;
    validaDal!: Date;
    validaAl!: Date;
    erogatore!: string;
    fruitore!: string;
    recordEliminato?: boolean
    abilitata?: boolean

    constructor(item: IGaraDTO) {
      this.idGara = item.idgara;
      this.gara = item.gara;
      this.validaAl = item.validaAl;
      this.validaDal = item.validaDal;
      this.erogatore = item.erogatore;
      this.fruitore = item.fruitore;
      this.recordEliminato = item.RecordEliminato;
      this.abilitata = item.abilitata;
    }
  }


  export interface IgestioneConfezionamentiGare{
    idGara : number;
    confezionamentiGare: IconfezionamentoGare[];
  }

  export interface IconfezionamentoGare{
    idConfezionamento: number;
    recordEliminato: boolean;
  }

  export interface IDettaglioConfezionamenti{
    IdProdotto: number;
    IdGara: number
  }


  export interface IGestioneGareConfezionamenti{
    idConfezionamento : number;
    gareConfezionamenti: IGareConfezionamenti[];
  }

  export interface IGareConfezionamenti {
    idGara: number;
    recordEliminato: boolean
  }