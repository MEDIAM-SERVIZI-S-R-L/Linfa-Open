import { ThisReceiver } from "@angular/compiler"
import { IErroriRefertiDTO, INotificheRefertiDTO } from "../_dtos/in"

interface IRefertoDaFirmare {
  idVisita: string
  idReferto: string
  test: boolean
  nomeReferto: string
  refertoBase64: string
}
export class RefertoDaFirmare implements IRefertoDaFirmare {
  idVisita: string
  idReferto: string
  test: boolean
  nomeReferto: string
  refertoBase64!: string

  constructor(idVisita, idReferto,test=false, nomeReferto) {
    //super();
    this.idVisita = idVisita
    this.idReferto = idReferto
    this.test= test
    this.nomeReferto = nomeReferto
  }



}

interface IInvioMailXPiano{
  base64File : string,
  mail : string,
  nome : string
}

export class InvioMailXPiano implements IInvioMailXPiano{
  base64File: string
  mail: string
  nome: string
}
interface INotificheReferti{
  DataInvio : Date,
  UtenteInvio : string,
  InvioCompletato : boolean,
  ErroriInvio : IErroriReferti[]
}

export class NotificheReferti implements INotificheReferti{
  DataInvio: Date
  UtenteInvio: string
  InvioCompletato: boolean
  ErroriInvio: IErroriReferti[]

  constructor(item: INotificheRefertiDTO){
    this.DataInvio = item.dataInvio;
    this.UtenteInvio = item.utenteInvio;
    this.InvioCompletato = item.invioCompletato;
    this.ErroriInvio = [];
    item.erroriInvio.forEach(element => {
      let x : ErroriReferti = new ErroriReferti(element);
      this.ErroriInvio.push(x); 
    });
  }
}

interface IErroriReferti{
  Errore :string,
  Ente : string
}
export class ErroriReferti implements IErroriReferti{
  Errore: string
  Ente: string

  constructor(item: IErroriRefertiDTO){
    this.Errore = item.errore;
    this.Ente = item.ente;
  }

}
