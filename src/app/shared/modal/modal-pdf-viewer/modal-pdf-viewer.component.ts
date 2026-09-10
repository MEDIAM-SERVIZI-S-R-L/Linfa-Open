import { Component, Inject, OnInit, ViewChild } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { ActivatedRoute } from '@angular/router'
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer'
import printJS from 'print-js'
import { firstValueFrom, from } from 'rxjs'
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard'
import { AppGeneralService } from 'src/app/_core/services/app-general.service'
import { HttpSharedService } from 'src/app/_core/services/http-shared.service'
import { SnackBarService } from 'src/app/_core/services/loader.service'
import { ReportService } from 'src/app/_core/services/report.service'
import { FirmaLocalmenteToDTO, InvioMailXPianoToDTO, ToSignDTO, ToSignMultipleDTO } from 'src/app/_dtos/out'
import { InvioMailXPiano, RefertoDaFirmare } from 'src/app/_models/documenti'
import { DocumentiService } from 'src/app/_repositories/documenti_repo.service'
import { VisitaRepoService } from 'src/app/_repositories/visita_repo.service'
import Swal from "sweetalert2";
import _ from 'underscore'

enum ProvenienzaFirma {
  Test = 1, // pulsante tes nel profilo utente
  Visita = 2, // pulsante firma dentro visita stessa
  ListaReferti = 3, // firma nella lista referti da firmare
}
@Component({
  selector: 'app-modal-pdf-viewer',
  templateUrl: './modal-pdf-viewer.component.html',
  styleUrls: ['./modal-pdf-viewer.component.scss'],
})
export class ModalPdfViewerComponent implements OnInit {
  ProvenienzaFirma = ProvenienzaFirma
  formFirma: FormGroup
  firmaRemota = false
  pdfFile
  lstLettori: any[] = []
  arrayPdf: RefertoDaFirmare[] = []
  isReferto = false
  isRefertoConErrore = false;
  disableFirmaDigitale = false
  title
  isFirmaDigitale = false // per verificare se nel modale deve mostrare anche pdf preview (nel box firma non vene visualizzato)
  testFirma = false
  anteprimaIntestazione = false
  idVisita
  showPassword = false
  nomeDocumento: string
  allowPrint: any = false

  email: FormControl = new FormControl('')
  xInvioMail = false;
  bothMailPrint = false;
  emailPaziente

  otpManuale: boolean;
  otpButtonDisabilitato : boolean = false;
  timerCall=null;
  timer= 0;


  nome : string;

  isBase64 = false
  @ViewChild('password') password
  constructor(
    public authGuard: AuthGuard,
    public appGen: AppGeneralService,
    private formBuilder: FormBuilder,
    private service: HttpSharedService,
    private report: ReportService,
    private pdfService: NgxExtendedPdfViewerService,
    public dialogRef: MatDialogRef<ModalPdfViewerComponent>,
    private documentHttp: DocumentiService,
    private visitHttp: VisitaRepoService,
    @Inject(MAT_DIALOG_DATA) public data,
    private notificate : SnackBarService,
    private activateRoute: ActivatedRoute,
  ) {
    this.allowPrint = data.allowPrint || false

    this.arrayPdf = data.arrayPdf
    this.testFirma = data.testFirma
    this.anteprimaIntestazione = data.anteprimaIntestazione
    this.isReferto = data.isReferto
    this.disableFirmaDigitale =
      data && data.disableFirmaDigitale ? data.disableFirmaDigitale : false
    this.idVisita = data.idVisita
    this.title = data.title
    this.nomeDocumento = data.nomeDocumento
    this.pdfFile = data.pdfFile
    this.isFirmaDigitale = data.isFirmaDigitale || false
    this.xInvioMail = data.xInvioMail
    this.emailPaziente = data.email
    this.bothMailPrint = data.bothMailPrint? data.bothMailPrint : false;
    this.nome = data.nome;
  }

  ngOnInit() {
    this.formCreate()
    this.compilazioneCampoMail();
    this.checkOtp();
  }
  /**
   * Verifico se firma remota o normale se normale lettore e pin se remota pin e otp
   */
  formCreate() {
    try {
      if (this.appGen.configLinfa && this.appGen.configLinfa.ConfigDigitalSign) {
        // firma remota
        if (this.appGen.configLinfa.ConfigDigitalSign.remote === true) {
          this.firmaRemota = true

          this.formFirma = this.formBuilder.group({
            otp: new FormControl('', Validators.required), //'0973487814'
            pin: new FormControl('', Validators.required),
          })
        } else {
          // firma standard (scheda)

          this.formFirma = this.formBuilder.group({
            lettore: new FormControl('', Validators.required),
            pin: new FormControl('', Validators.required),
          })

          this.getDispositiviDiFirma()
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  async checkOtp(){
    this.activateRoute.queryParams.subscribe(async (params) => {
      this.isRefertoConErrore = params.conErrore;
    })
    if (this.appGen.configLinfa && this.appGen.configLinfa.ConfigDigitalSign && this.isRefertoConErrore) {
      if (this.appGen.configLinfa.ConfigDigitalSign.remote === true){
        this.otpManuale = await firstValueFrom(this.documentHttp.checkOtp());
        if(this.otpManuale){
          this.richiestaOtp();
        }  
      }
    }
  }

  async richiestaOtp(){
    this.timer = 15;
    await firstValueFrom(this.documentHttp.richiestaOtp());
    this.startTimer();
  }
 

startTimer() {
  this.stopTimer();
  this.timerCall = setInterval(() => { 

    if (this.timer > 0) {
      this.timer = this.timer -1;
    } else if(this.timer <= 0){
      this.stopTimer();
    }

  }, 1000);
}

stopTimer() {
  if (this.timerCall) {
    clearInterval(this.timerCall);
  }
}



  onDismiss(): void {
    this.dialogRef.close()
  }
  /** Devo prendere la lista di lettori scheda , seleziono il primo */

  async getDispositiviDiFirma() {
    try {
      this.lstLettori = []
      await this.service.getListaDispositiviDiFirma().then(async (data) => {
        this.lstLettori = data.ResultData
        if (this.lstLettori.length === 1) {
          this.formFirma.get('lettore').setValue(this.lstLettori[0].CardIndex)
        }
      })
    } catch (error) {
      return
    }
  }

  firmaDigitaleSelezionati() {
    this.arrayPdf.forEach((pdf) => {
      this.callFirma(pdf)
    })
    this.dialogRef.close(true)
  }

  /* */
  firmaDigitale(provenienzaFirma: ProvenienzaFirma) {
    debugger;
    try {
      if (this.formFirma.invalid) {
        this.appGen.validateAllFormFields(this.formFirma)

        return
      }
      switch (provenienzaFirma) {
        case ProvenienzaFirma.Test:
        case ProvenienzaFirma.Visita:
          //TODO Creare Base64 e inserire
          this.pdfFile.getBase64(async (base64) => {
            this.firmaSchedaRemota(provenienzaFirma, base64)
          })
          break

        case ProvenienzaFirma.ListaReferti:
          if (this.arrayPdf.length > 0) {
            this.firmaSchedaRemota(provenienzaFirma)
          }
          break

        default:
          break
      }
      /*  if (provenienzaFirma.Test || provenienzaFirma) {


        /// firma senza sync
      } else {

        if (this.arrayPdf.length > 0) {
          this.firmaSchedaRemota(isTest)
        }*/

      // sync se abbilitato
    } catch (error) {
      console.error(error)
    }
  }
  //ZAJAC
  /** qui guardando la configurazione richiamo o la firma locale o remota */
  //!TODO - modificare la fuzione invio locale xk non invio il pdf ma invio solo il nome del pdf qundi nel locale devo prendere la parte del PDF cpme base64
  async firmaSchedaRemota(provenienzaFirma: ProvenienzaFirma, base64 = null) {
    try {
      //loading e chiudo la modale
      this.appGen.loadingPanel.show()
      provenienzaFirma
      const _multifirma = this.appGen.configLinfa.ConfigDigitalSign.multiple
      //const _multifirma = false
      if (_multifirma) {
        if (this.firmaRemota) {
          const json: ToSignMultipleDTO = new ToSignMultipleDTO(
            this.formFirma.get('pin').value,
            this.formFirma.get('otp').value,
            provenienzaFirma == ProvenienzaFirma.Test ? true : false, // nel caso del pulsante test imposto test a true per fare la chiamata remota di test
            this.arrayPdf
          )

          const pdfSigned: any[] = await firstValueFrom(this.documentHttp.multipleRemoteSign(json))



          this.chcekAllSigned(pdfSigned)

          // Mando al Mirth
          if (this.appGen.configLinfa.InvioVersoMirth) {

            _.each(pdfSigned, async (item) => {
              // per ogni documento firmato senza errore mando al mirth
              if (item.errorSign == null) {
                await this.sendToMirth(item.idVisita);
              }

            })



          }



        } else {
          // firma locale

          await this.firmaLocale(provenienzaFirma, base64)
        }
      } else {
        // sirma singolare
        if (this.firmaRemota) {
          const json: ToSignDTO = new ToSignDTO(
            this.arrayPdf[0].idReferto,
            this.arrayPdf[0].idVisita,
            this.formFirma.get('otp').value,
            this.formFirma.get('pin').value
          )

          const pdfSign = await firstValueFrom(this.documentHttp.signleRemoteSing(json))

          // Mando al Mirth
          if (this.appGen.configLinfa.InvioVersoMirth) {

            await this.sendToMirth(this.arrayPdf[0].idVisita);
          }

        } else {
          //firma locale
          await this.firmaLocale(provenienzaFirma, base64)
        }
      }
    } catch (error) {
      this.appGen.notificate.error('Errore nella firma digitale  112')
    } finally {
      // chiusura del dialod solo in visita scatta anche il refresh della lista di referti cercare :  dialogRef.afterClosed() in lista referti

      if (
        provenienzaFirma == ProvenienzaFirma.Visita ||
        provenienzaFirma == ProvenienzaFirma.ListaReferti
      ) {
        this.dialogRef.close(true)
      }

      this.appGen.loadingPanel.hide()
    }
  }
  /** Firma locale con il lettore */
  async firmaLocale(provenienzaFirma: ProvenienzaFirma, base64 = null) {
    try {
      this.appGen.loadingPanel.show()
      //Prendo Base64 del file per visualizarre
      // guardo se utente ha il CF che serve per la firma Locale se non non parto con download base64
      const _userCf = await firstValueFrom(this.documentHttp.getCfUtente())

      //Controllo se CF è CF
      const regex = new RegExp(
        '^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$'
      )

      if (!regex.test(_userCf)) {
        throw new Error('CF salvato non è CF')
      }

      // Sono in test quindi devo creare un array
      if (provenienzaFirma == ProvenienzaFirma.Test) {
        this.arrayPdf = [
          {
            idReferto: 'test',
            idVisita: 'test',
            nomeReferto: 'test',
            refertoBase64: base64,
            test: true,
          },
        ]
      } else if (provenienzaFirma == ProvenienzaFirma.Visita) {
        this.arrayPdf = [
          {
            idReferto: 'test',
            idVisita: 'test',
            nomeReferto: 'test',
            refertoBase64: base64,
            test: true,
          },
        ]
      }

      for await (const item of this.arrayPdf) {
        let _pdf64: string
        if (provenienzaFirma == ProvenienzaFirma.Test) {
          // sono in test della firma
          _pdf64 = item.refertoBase64
        } else {
          // firmo con la scheda vero referto
          _pdf64 = await firstValueFrom(
            this.documentHttp.donwloadFileBase64(item.idReferto)
          )
        }

        // !TODO Inserire la verifiche se utente logato ha il CF se no esco
        console.log('Lettore id:' + this.formFirma.get('lettore').value)

        const _documentoDaFirmare: FirmaLocalmenteToDTO = new FirmaLocalmenteToDTO(
          this.formFirma.get('lettore').value,
          this.formFirma.get('pin').value,
          _pdf64,
          _userCf
        )

        const _firmato = await firstValueFrom(
          this.documentHttp.singleLocalSign(_documentoDaFirmare)
        )
//debugger;
        if (
          !_firmato.Success
         //&& (_firmato.ErrorType == 1000 || _firmato.ErrorType == 2000)
        ) {
          let _error
          switch (_firmato.ErrorType) {
            case 1000:
              _error =
                'Il certificato inviato da Linfa non corrisponde con il certificato sulla scheda.'
              break
            case 2000:
              _error =
                'Codice fiscale non impostato, è necessario per effettuare la firma.'
              break
              case 0:
                _error =
                  'Pin non coretto'
                break
            default:
              _error = 'Errore non gestito error'
              break
          }

          throw new Error(_error)
        }else if (provenienzaFirma != ProvenienzaFirma.Test) {

          // Salvo documento sul server
          await this.saveRefertoServer(_firmato.PdfSigned, item.idReferto)

          //aggiorno il flag della firma digitale
          await firstValueFrom(this.documentHttp.updateDocumentAsSignet(item.idVisita))

          //Sincronizzo con integrazione
          //!TODO verificare se invio funziona correttamente

          if (this.appGen.configLinfa.InvioVersoMirth) {
            //mando il referto firmato a patidok

            await this.sendToMirth(item.idVisita)
          }
        } else {
          this.isBase64 = true
          this.pdfFile = _firmato.PdfSigned
        }
      }

      // metodo di salvataggio dove salvo il referto firmato e sovrascrivo sul server quello non firmato
    } catch (error) {
      Swal.fire({
        text: error && error.message ? error.message : 'Errore non gestito',
        icon: 'error',
        //    iconColor: '#00afa6',
      })
    } finally {
      // chiudo loader e refresh la lista
      this.appGen.loadingPanel.hide()
    }
  }

  // funzione che verifica che sono stati firmati tutti i documenti
  chcekAllSigned(_pdfSigned) {
    const pdfWithError = []
    _.each(_pdfSigned, (item) => {
      if (item.errorSign != null) {
        pdfWithError.push(item.newReportName)
      }
    })
    if (pdfWithError.length > 0) {
      // vado prendere tutti i nomi del documenti non firmati , nella proprietà newReportName per questi con errore ci sara il vecchio nome
      Swal.fire({
        icon: 'warning',
        title: 'I seguenti referti non sono stati firmati:',
        html: pdfWithError.join(', '),
      })
    } else {
      Swal.fire({
        icon: 'success',
        title: 'I referti sono stati firmati correttamente',
      })
    }
  }

  /**Prima effettuo la firma, se tutto ok e sincronizzazione attiva allora manderò tutto */
  async callFirma(pdf) {
    //Faccio un controllo sull'utente loggato se presente il codice fiscale che verrà passato poi per firmare il referto
    await this.service
      .getCallRequest({ action: 'checkUtenteLoggatoCF' })
      .then(async (data) => {
        if (this.appGen.isNullOrUndefined(data.cf)) {
          this.appGen.openDialog(
            'Attenzione!',
            'Codice fiscale non impostato, è necessario per effettuare la firma.'
          )
          return
        }

        const cfUtenteLoggato = data.cf

        //procedo con la firma, trasformo pdf in base64
        await pdf.getBase64(async (blob) => {
          const obj = {
            IndexOfDeviceToUse: this.formFirma.get('lettore').value, //PAOLO: da parametrizzare
            PinCode: this.formFirma.get('pin').value, //PAOLO: da parametrizzare
            PdfData: blob,
            CF: cfUtenteLoggato,
          }

          return;

          await this.service.firmaRefertoDigitale(obj).then(async (data) => {
            //PAOLO

            if (!data.Success) {
              this.appGen.notificate.error(data.LastErrorMessage)

              if (!this.appGen.isNullOrUndefined(data.ErrorType)) {
                let message = ''
                switch (data.ErrorType) {
                  case 1000:
                    message =
                      'Il certificato inviato da Linfa non corrisponde con il certificato sulla scheda.'
                    break
                  case 2000:
                    message =
                      'Codice fiscale non impostato, è necessario per effettuare la firma.'
                    break

                  default:
                    break
                }
                if (message !== '') {
                  this.appGen.openDialog('Attenzione!', message)
                }
                return
              }
            } else {
              //se faccio  un test della firma digitale dal profilo lo apro direttamente e basta
              if (this.testFirma) {
                const fileUrl = await this.getFileFromBlob(data.PdfSigned)
                window.open(fileUrl, 'SignedPdf.pdf')
              } else {
                // metodo di salvataggio dove salvo il referto firmato e sovrascrivo sul server quello non firmato
                await this.saveToServer(data.PdfSigned)

                //aggiorno il flag della firma digitale
                //      await this.updateDocumentoFirmato()

                //Sincronizzo con integrazione --obsoleto
                if (this.appGen.configLinfa.Sincronizzazione) {
                  //mando il referto firmato a patidok
                  //
                }

                this.pdfFile = await this.getFileFromBlob(data.PdfSigned)
              }
            }
          })
        })
      })
  }

  async saveRefertoServer(file, idDocumento) {
    const obj = {
      filebase64: file,
      idDocumento: idDocumento,
    }
    await this.service.postCallRequest({ action: 'saveFileReport', param: obj })
  }

  async getPDFBase64Text(pdfDoc) {
    let b64 = await pdfDoc.getBase64(pdfDoc)
    //debugger;
    return b64
  }



  confirmSendEmail(){
    Swal.fire({
      title: 'Vuoi inviare il piano nutrizionale al paziente ' + this.nome + ' ?',
      icon: 'info',
      showCancelButton: true,
      cancelButtonText: 'No, annulla',
      confirmButtonColor: '#00afa6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confermo',
    }).then((result) => {
      if (result.isConfirmed) {
          this.getBase64ForMail();
      }
    })
  }


  /**
   * Funzione che converte il pdf in base64 e richiama poi la funzione per l'invio
   */
  async getBase64ForMail() {
    let base64File;
    if (!this.appGen.isNullOrUndefined(this.pdfFile)) {
      const pdf = this.pdfFile;

      pdf.getBase64(async (file) => {

        base64File = file;
        this.base64Mail(base64File);
      })
    }
  }

  /**
   * Funzione adibita all'invio del file per mail
   * @param fileBase64 file in base 64 convertito nella funzione precedente
   */
  async base64Mail(fileBase64) {
    try {
      this.appGen.loadingPanel.show();
      const obj : InvioMailXPiano = {
        base64File : fileBase64,
        mail : this.email.value,
        nome : this.nome
      };

      let objXMail = new InvioMailXPianoToDTO(obj);
      await firstValueFrom(this.documentHttp.invioMail(objXMail));
      this.appGen.loadingPanel.hide();
      this.notificate.ok("Piano nutrizionale inviato correttamnte");
      this.onDismiss();

    } catch (error) {
      console.error(error);
      this.appGen.loadingPanel.hide();
      this.notificate.error("Errore durante l'invio, riprovare");
    }

  }

  async saveToServer(file) {
    const obj = {
      filebase64: file,
      idVisita: this.idVisita,
    }
    await this.service.postCallRequest({ action: 'saveFileReport', param: obj })
  }

  async stampa() {
    if (this.pdfFile instanceof Blob) {
      const fileURL = window.URL.createObjectURL(this.pdfFile)
      printJS(fileURL)
    } else {
      await this.pdfFile.getBlob((data) => {
        const fileURL = window.URL.createObjectURL(data)
        printJS(fileURL)
      })

      // this.pdfFile.print();
    }

    // this.pdfService.print();
  }

  async getFileFromBlob(data) {
    const buffer = await this.appGen._base64ToArrayBuffer(data)
    const byteArray = new Uint8Array(buffer)
    const blob = new Blob([byteArray], { type: 'application/pdf' })
    return URL.createObjectURL(blob)
  }



  async sendToMirth(_idVisita: string) {
    try {

      const x = await firstValueFrom(this.visitHttp.sendToMirth(_idVisita))

    } catch (error) {
    console.log("problema invio mirth")

    }
  }


  toggleShow() {
    this.showPassword = !this.showPassword
    this.password.type = this.showPassword ? 'text' : 'password'
  }

  async createFileReqInfo() {
    return this.pdfFile
      .getBase64()
      .toPromise()
      .then(async (x) => {
        return x
      })

    /*this.reportModel.getReportSecurity(reportId).done((result) => {
        uCanView = result.CanViewReport;
        var info: ReportSecurityInfo = {
            fileRequest: fileReq,
            userCanView: uCanView
        }
        resolve(info)
    });*/
  }

  compilazioneCampoMail() {
    if (this.xInvioMail) {
      this.email.setValidators([Validators.required, Validators.email])
      this.email.updateValueAndValidity()
    }

    if (this.xInvioMail && !this.appGen.isNullOrUndefined(this.emailPaziente)) {
      this.email.setValue(this.emailPaziente)
    }
  }
}
