import { Pasto, PastoString } from "../_core/helpers/enums";
import { IDietaDTO, IOggettoDietaDTO, IProdottoAlternativoDTO, IProdottoDettaglioAnamnesiAlternativoDTO, IProdottoDettaglioAnamnesiDTO, IProdottoDettaglioDTO, IProdottoEasyDTO, IProprietaProdottoDTO, ITipoProdottiDTO } from "../_dtos/in";

interface IOggettoDieta{
  dieta: Dieta
  prodotti : ProdottoDettaglio[]
}

export class OggettoDieta implements IOggettoDieta{
  dieta: Dieta;
  prodotti: ProdottoDettaglio[];
  constructor(item : IOggettoDietaDTO) {
    this.dieta = item.dieta;
    this.prodotti = [];
    item.prodotti?.forEach(prodotto => {
      let x :ProdottoDettaglio = new ProdottoDettaglio(prodotto);
      this.prodotti.push(x)
    });
  }
}

interface IOggettoAnamnesiAlimentare{
  anamnesi : any,
  prodotti: any
}

export class OggettoAnamnesiAlimentare implements IOggettoAnamnesiAlimentare{
  anamnesi: any;
  prodotti: any;
}

interface IOggettoPianoNutrizionale{
  diagnosi : string,
  noteDietista: string,
  notePianoNutrizionale : string,
  prodotti : ProdottoDettaglio[]
  xSettimana : boolean;
  xPasti : boolean
}

export class OggettoPianoNutrizionale implements IOggettoPianoNutrizionale{
  diagnosi: string;
  noteDietista: string;
  notePianoNutrizionale: any;
  prodotti: ProdottoDettaglio[];
  xSettimana : boolean;
  xPasti : boolean;
  // constructor() {
  //   if (this.prodotti) {
  //     this.prodotti[0].pasto? this.xPasti = true : this.xPasti = false;
  //     debugger
  //     this.prodotti[0].settimana;
  //   }
    
  // }
}

interface IDieta{
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

export class Dieta implements IDieta{
  id: number;
  dieta: string;
  kcal: number;
  proteine: number;
  azoto: number;
  carboidrati: number;
  lipidi: number;
  creatoDaUtenteLoggato: boolean;
  creato: string;
  constructor(item: IDietaDTO) {
    this.id = item.id;
    this.dieta = item.dieta;
    this.kcal = item.kcal;
    this.proteine = item.proteine;
    this.azoto = item.azoto;
    this.carboidrati = item.carboidrati;
    this.lipidi = item.lipidi;
    this.creatoDaUtenteLoggato = item.creatoDaUtenteLoggato;
    this.creato = item.creato;
  }
}

interface ITipoProdotti{
id:number,
name:string


}

export class TipoProdotti implements ITipoProdotti{
    id: number;
    name: string;

  constructor(item:ITipoProdottiDTO) {
    this.id= item.id;
    this.name= item.name
  }

}

interface IProdottoEasy{
  id: number,
  prodotto: string,
  prodottiAlternativi? : any[];
  idTipoProdotto: number,
  tipoProdotto: string
}

export class ProdottoEasy implements IProdottoEasy{ 
  id: number;
  prodotto: string;
  prodottiAlternativi? : any[];
  idTipoProdotto: number;
  tipoProdotto: string;

  constructor(item: IProdottoEasyDTO) {
    this.id = item.id;
    this.prodotto = item.prodotto;
    this.prodottiAlternativi = [];
    this.idTipoProdotto = item.idTipoProdotto;
    this.tipoProdotto = item.tipoProdotto
  }
}


interface IPasto{
  nome: string,
  expanded : boolean,
  id: Pasto,
  kcal : number,
}

export class PastoClass implements IPasto{
  nome: string;
  expanded: boolean;
  id: Pasto;
  kcal: number;

  constructor(_id: Pasto) {
    if(_id === Pasto.Colazione){
     this.nome = PastoString.Colazione;
    } else  if (_id == Pasto.Spuntino){
      this.nome = PastoString.Spuntino;
    } else if (_id === Pasto.Pranzo){
      this.nome = PastoString.Pranzo
    } else if (_id === Pasto.Merenda){
      this.nome = PastoString.Merenda
    } else if (_id === Pasto.Cena){
      this.nome = PastoString.Cena;
    } else if (_id === Pasto.SpuntinoSerale){
      this.nome = PastoString.SpuntinoSerale
    } else if (_id === Pasto.Integratori){
      this.nome = PastoString.Integratori
    } else if (_id === Pasto.LiquidiAssunti){
      this.nome = PastoString.LiquidiAssunti
    } else if (_id === Pasto.DietaUnica){
      this.nome = PastoString.DietaUnica
    }
    this.expanded = false;
    this.kcal = 0;
    this.id = _id;
  }
}

interface ISettimana{
  lunedi: boolean;
  martedi: boolean;
  mercoledi: boolean;
  giovedi: boolean;
  venerdi: boolean;
  sabato: boolean;
  domenica: boolean;
}

export class Settimana implements ISettimana{
  lunedi: boolean;
  martedi: boolean;
  mercoledi: boolean;
  giovedi: boolean;
  venerdi: boolean;
  sabato: boolean;
  domenica: boolean;

  constructor(item?: ProdottoDettaglio){
    if (item) {
      this.lunedi = item.settimana.lunedi;
      this.martedi = item.settimana.martedi;
      this.mercoledi = item.settimana.mercoledi;
      this.giovedi = item.settimana.giovedi;
      this.venerdi = item.settimana.venerdi;
      this.sabato = item.settimana.sabato;
      this.domenica = item.settimana.domenica;
    }
  }

  nuovoOggetto(){
    this.lunedi = false;
    this.martedi = false;
    this.mercoledi = false;
    this.giovedi = false;
    this.venerdi = false;
    this.sabato = false;
    this.domenica = false;
  }
}

interface IProdottiAnamnesi{
  Prodotti: ProdottoDettaglio[]
  KcalTotaliDieta: number
  ProteineTotaliDieta: number
  AzotoTotaliDieta: number
  CarboidratiTotaliDieta: number
  LipidiTotaliDieta: number
  ApportoIdrico: number
  IdVisita: string
  IdPaziente: string
  Note: string
  DiagnosiNutrizionale: string
  settimana? :Settimana
}

export class ProdottiAnamnesi implements IProdottiAnamnesi{
  Prodotti: ProdottoDettaglio[];
  KcalTotaliDieta: number;
  ProteineTotaliDieta: number;
  AzotoTotaliDieta: number;
  CarboidratiTotaliDieta: number;
  LipidiTotaliDieta: number;
  ApportoIdrico: number;
  IdVisita: string;
  IdPaziente: string;
  Note: string;
  DiagnosiNutrizionale: string;
  settimana?: Settimana
}

interface IProdottiPiano extends Omit<IProdottiAnamnesi, 'DiagnosiNutrizionale' | 'Note'>{
  Diagnosi: string
  NotePianoNutr: string
  IdValutazioneNutrizionale: string
  IdDietaRiferimento: string
}

export class ProdottiPiano implements IProdottiPiano{
  Diagnosi: string;
  NotePianoNutr: string;
  IdValutazioneNutrizionale: string;
  IdDietaRiferimento: string;
  Prodotti: ProdottoDettaglio[];
  KcalTotaliDieta: number;
  ProteineTotaliDieta: number;
  AzotoTotaliDieta: number;
  CarboidratiTotaliDieta: number;
  LipidiTotaliDieta: number;
  ApportoIdrico: number;
  IdVisita: string;
  IdPaziente: string;
}

interface IProdottoDettaglio{
  id: number
  prodotto: string
  codiceProdotto: string
  idTipoProdotto?: number
  idCategoriaAlimentare?: number
  acqua: number
  kcal: number
  proteine: number
  lipidi: number
  carboidrati: number
  quantita: number
  quantitaBase: number
  idUnitaMisura: number
  altroCodiceProdotto: string
  prodottiAlternativi? : ProdottoAlternativo[];
  alternativoAbilitato? : boolean;
  unitaMisura : string;
  azoto: number;

  listaAlternativiIncompleti? : ProdottoAlternativo[];

  pasto? : PastoClass;
  settimana? : Settimana;

  isInScelta?: boolean;
  isInLoading?: boolean;
  isFromPrecedente?:boolean;
  
  kcalCalcolate? : number;
  azotoCalcolato?: number;
  proteineCalcolate?: number;
  carboidaratiCalcolati?: number;
  lipidiCalcolati?:number;
  acquacalcolata?: number;
  disabilitato? : boolean
  idprodottoxvisita? : number;
}

export class ProdottoDettaglio implements IProdottoDettaglio{
  id: number;
  prodotto: string;
  codiceProdotto: string;
  idTipoProdotto?: number;
  idCategoriaAlimentare?: number;
  acqua: number;
  kcal: number;
  proteine: number;
  lipidi: number;
  carboidrati: number;
  quantita: number;
  quantitaBase: number
  idUnitaMisura: number;
  altroCodiceProdotto: string;
  unitaMisura: string;
  prodottiAlternativi? : ProdottoAlternativo[];
  alternativoAbilitato? : boolean;
  azoto: number;

  //proprietà che serve quando viene effettuato il check prima di salvare
  listaAlternativiIncompleti? : ProdottoAlternativo[];

  /// proprietà che servono all'interno del codice
  pasto? : PastoClass;
  settimana?: Settimana;

  //booleani che servono per grafica
  //cambia l'array dalla quale viene preso il prodotto per evitare il glitch dove il prodotto sparisce mentre se ne cerca un altro
  isInScelta?: boolean;
  //gestisce il caricamento per la singola div che contiene l'alimento principale
  isInLoading?: boolean;
  //serve a capire se arriva da anamnesi o meno
  isFromPrecedente?:boolean;


  /// proprietà che vengono calcolate
  kcalCalcolate? : number;
  azotoCalcolato?: number;
  proteineCalcolate?: number;
  carboidaratiCalcolati?: number;
  lipidiCalcolati?:number;
  acquacalcolata?: number;
  disabilitato? :boolean;
  idprodottoxvisita? : number;

  constructor(item?: IProdottoDettaglioDTO | IProdottoDettaglioAnamnesiDTO, dis = false){
    try {
      if (item) {
        if (item.hasOwnProperty('id')) {
          const x = item as IProdottoDettaglioDTO;
          this.id = x.id;
          this.prodotto = x.prodotto;
          this.codiceProdotto = x.codiceProdotto;
          this.idTipoProdotto = x.idTipoProdotto;
          this.idCategoriaAlimentare = x.idCategoriaAlimentare;
          this.acqua = x.acqua;
          this.kcal = x.kcal;
          this.proteine = x.proteineTotali;
          this.lipidi = x.lipidiTotali;
          this.carboidrati = x.glucidiDispon;
          this.quantita = x.quantita? x.quantita: null;
          this.quantitaBase = x.quantitaBase
          this.idUnitaMisura = x.idUnitaMisura;
          this.altroCodiceProdotto = x.altroCodiceProdotto;
          this.prodottiAlternativi = [];
          if (x.prodottiAlternativi?.length > 0) {
            this.alternativoAbilitato = true;
            x.prodottiAlternativi.forEach(element => {
              let y : ProdottoAlternativo;
              y = new ProdottoAlternativo(element, this.disabilitato);
              this.prodottiAlternativi.push(y);
            });
          }
          this.unitaMisura = x.unitaMisura
          this.azoto = x.azoto
          this.disabilitato = dis;

        } else if(item.hasOwnProperty('idPasto')){
          const x = item as IProdottoDettaglioAnamnesiDTO;
          this.id = x.idProdotto;
          this.prodotto = x.prodotto;
          this.codiceProdotto = x.codiceProdotto;
          this.acqua = x.acqua;
          this.kcal = x.kcal;
          this.carboidrati = x.carboidrati;
          this.proteine = x.proteine;
          this.lipidi = x.lipidi
          this.quantita = x.quantita;
          this.quantitaBase = x.quantitaBase;
          this.unitaMisura = x.unitaMisura;
          this.idUnitaMisura = x.idUnitaMisura;
          this.prodottiAlternativi = [];
          this.pasto = new PastoClass(x.idPasto);

          if (x.prodottiAlternativi?.length > 0) {
            this.alternativoAbilitato = true;
            x.prodottiAlternativi.forEach(element => {
              let y : ProdottoAlternativo;
              y = new ProdottoAlternativo(element, this.disabilitato);
              this.prodottiAlternativi.push(y);
            });
          }

          this.isFromPrecedente = true;

          this.settimana = new Settimana();
          this.settimana.nuovoOggetto(); 
          if (x.settimana?.length > 0) {
            x.settimana.includes('lun')? this.settimana.lunedi = true : this.settimana.lunedi = false; 
            x.settimana.includes('mar')? this.settimana.martedi = true : this.settimana.martedi = false; 
            x.settimana.includes('mer')? this.settimana.mercoledi = true : this.settimana.mercoledi = false; 
            x.settimana.includes('gio')? this.settimana.giovedi = true : this.settimana.giovedi = false; 
            x.settimana.includes('ven')? this.settimana.venerdi = true : this.settimana.venerdi = false; 
            x.settimana.includes('sab')? this.settimana.sabato = true : this.settimana.sabato = false; 
            x.settimana.includes('dom')? this.settimana.domenica = true : this.settimana.domenica = false; 
          }

          this.isInScelta = false;
          this.kcalCalcolate = x.kcal;
          this.lipidiCalcolati = x.lipidi;
          this.carboidaratiCalcolati = x.carboidrati;
          this.proteineCalcolate = x.proteine;
          this.acquacalcolata = x.acqua;
          this.azotoCalcolato = x.azoto;
          this.idprodottoxvisita = x.idprodottoxvisita? x.idprodottoxvisita : null;

          this.disabilitato = dis;
        }
  
      }
    } catch (error) {
      console.error(error);
    }

  }
  oggettoVuoto(){
      this.id =  null,
      this.prodotto = '',
      this.prodottiAlternativi= [],
      this.listaAlternativiIncompleti = [];
      this.codiceProdotto= '',
      this.idTipoProdotto= 0,
      this.idCategoriaAlimentare= 0,
      this.acqua= 0,
      this.kcal= 0,
      this.proteine= 0,
      this.lipidi= 0,
      this.carboidrati= 0,
      this.quantita= null,
      this.quantitaBase= 0,
      this.idUnitaMisura= 0,
      this.altroCodiceProdotto= '',
      this.alternativoAbilitato = false,
      this.unitaMisura= '',
      this.azoto = 0,
      this.isInLoading = false;
      this.disabilitato = false;
  }
}

export class ProdottoAlternativo implements Omit<ProdottoDettaglio, 
'prodottiAlternativi' | 'listaAlternativiIncompleti' | 'alternativoAbilitato' | 'disabilitato'>{
  id: number;
  prodotto: string;
  codiceProdotto: string;
  idTipoProdotto: number;
  idCategoriaAlimentare: number;
  acqua: number;
  kcal: number;
  proteine: number;
  lipidi: number;
  carboidrati: number;
  quantita: number;
  quantitaBase: number;
  idUnitaMisura: number;
  altroCodiceProdotto: string;
  unitaMisura: string;
  azoto: number;
  pasto?: PastoClass;
  settimana?: Settimana;
  isInScelta?: boolean;
  isInLoading?: boolean;
  kcalCalcolate?: number;
  azotoCalcolato?: number;
  proteineCalcolate?: number;
  carboidaratiCalcolati?: number;
  lipidiCalcolati?: number;
  acquacalcolata?: number;
  idprodottoxvisita? : number;

  constructor(element: IProdottoAlternativoDTO | IProdottoDettaglioAnamnesiAlternativoDTO, dis = false) {
    if (element) {
      if (element.hasOwnProperty('id')) {
        const item = element as IProdottoAlternativoDTO
        this.id = item.id;
        this.prodotto = item.prodotto;
        this.codiceProdotto = item.codiceProdotto;
        this.idTipoProdotto = item.idTipoProdotto;
        this.idCategoriaAlimentare = item.idCategoriaAlimentare;
        this.acqua = item.acqua;
        this.kcal = item.kcal;
        this.proteine = item.proteineTotali;
        this.lipidi = item.lipidiTotali;
        this.carboidrati = item.glucidiDispon;
        this.quantita = item.quantita? item.quantita: null;
        this.quantitaBase = item.quantitaBase
        this.idUnitaMisura = item.idUnitaMisura;
        this.altroCodiceProdotto = item.altroCodiceProdotto;
        this.unitaMisura = item.unitaMisura
        this.azoto = item.azoto

      }else if(element.hasOwnProperty('idProdotto')){
        const item = element as IProdottoDettaglioAnamnesiAlternativoDTO
        this.id = item.idProdotto;
        this.prodotto = item.prodotto;
        this.codiceProdotto = item.codiceProdotto;
        this.acqua = item.acqua;
        this.kcal = item.kcal;
        this.proteine = item.proteine;
        this.lipidi = item.lipidi;
        this.carboidrati = item.carboidrati;
        this.quantita = item.quantita? item.quantita: null;
        this.quantitaBase = item.quantitaBase
        this.idUnitaMisura = item.idUnitaMisura;
        this.unitaMisura = item.unitaMisura
        this.azoto = item.azoto;
        this.idprodottoxvisita = item.idprodottoxvisita? item.idprodottoxvisita : null; 

        this.acquacalcolata = item.acqua;
        this.kcalCalcolate = item.kcal;
        this.azotoCalcolato = item.azoto;
        this.lipidiCalcolati = item.lipidi;
        this.carboidaratiCalcolati = item.carboidrati;
        this.proteineCalcolate = item.proteine;
      }

    }
  }

  oggettoVuoto(): void {
    this.id =  null,
    this.prodotto = '',

    this.codiceProdotto= '',
    this.idTipoProdotto= 0,
    this.idCategoriaAlimentare= 0,
    this.acqua= 0,
    this.kcal= 0,
    this.proteine= 0,
    this.lipidi= 0,
    this.carboidrati= 0,
    this.quantita= null,
    this.quantitaBase= 0,
    this.idUnitaMisura= 0,
    this.altroCodiceProdotto= '',
    this.unitaMisura= '',
    this.azoto = 0,
    this.isInLoading = false;
  }

}


interface IProprietaProdotto{
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

export class ProprietaProdotto implements IProprietaProdotto{
  quantita: number;
  kcal: number;
  acqua: number;
  lipidi: number;
  carboidrati: number;
  azoto: number;
  proteine: number;
  idUnitaMisura: number;
  unitaMisura: string;

  constructor(item: IProprietaProdottoDTO) {
    this.quantita = item.quantita;
    this.kcal = item.kcal;
    this.acqua = item.acqua;
    this.lipidi = item.lipidi;
    this.carboidrati = item.carboidrati;
    this.azoto = item.azoto;
    this.proteine = item.proteine;
    this.idUnitaMisura = item.idUnitaMisura;
    this.unitaMisura = item.unitaMisura;
  }
}





