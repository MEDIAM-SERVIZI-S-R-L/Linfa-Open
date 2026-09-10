import { Component, Input, OnInit, Optional } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard';
import { StepVisita, TipoAlimentazione, TipoNutrizioneArtificiale } from 'src/app/_core/helpers/enums';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { ReportService } from 'src/app/_core/services/report.service';
import { DocumentiService } from 'src/app/_repositories/documenti_repo.service';
import { VisitaRepoService } from 'src/app/_repositories/visita_repo.service';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';
import { ModalPdfViewerComponent } from 'src/app/shared/modal/modal-pdf-viewer/modal-pdf-viewer.component';

@Component({
  selector: 'app-concludi-visita',
  templateUrl: './concludi-visita.component.html',
  styleUrls: ['./concludi-visita.component.scss'],
})
export class ConcludiVisitaComponent implements OnInit {
  @Input() isRiepilogoVisita = true
  @Optional() @Input() inRiepilogoComponent = false
  tipoAlimentazione = TipoAlimentazione
  idTipoAlimentazione
  idPianoNutrizionale
  prodottiSelezionati
  idPaziente
  dataResult
  isDietaXpaziente = false
  params
  TipoNutrizioneArtificiale = TipoNutrizioneArtificiale
  edit = false
  mostraSacche = false
  idVisita
  idValutazione
  editorConfig: AngularEditorConfig
  diagnosiModel = ''
  listaConclusioniPredefinite
  @Input() isRiepilogoStorico
  inError = false
  bEdit = true
  isRiepilogo = false
  noteDietistaAssenti = false
  msgErrore: string
  stepVisita = StepVisita

  //NOTE DIETISTA DA COMPILARE
  note = new FormControl('')

  //NOTE DIETISTA VISIBILI DA ALTRI UTENTI NON DIETISTI
  noteCompilate = new FormControl('')

  constructor(
    private activateRoute: ActivatedRoute,
    public appGen: AppGeneralService,
    private service: HttpSharedService,
    private router: Router,
    private report: ReportService,
    private dialog: MatDialog,
    public authGuard: AuthGuard,
    public visitaServ: VisitaRepoService,
    private documentHttp: DocumentiService,

  ) {
    this.editorConfig = this.appGen.editorDefaultConfig()
    if (!this.authGuard.canRole(this.appGen.ruolo.Dietista)) {
      this.noteCompilate.disable()
    }
  }

  ngOnInit() {
    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id')

    this.activateRoute.queryParams.subscribe((params) => {
      this.params = params
      if (!this.appGen.isNullOrUndefined(params.visit)) {
        this.idVisita = params.visit
        this.isDietaXpaziente = true
      }

      if (!this.appGen.isNullOrUndefined(params.fromStorico)) {
        this.isRiepilogoStorico = true
      }

      if (!this.appGen.isNullOrUndefined(params.vnutr)) {
        this.idValutazione = params.vnutr
      }
    })

    this.getListConclusioniPredefinite()
    this.getTipoAlimentazione().then(() => this.checkNoteDietistaCompilate())
    this.checkConclusioniCompilate()

    if (this.isRiepilogo || this.isRiepilogoStorico || this.inRiepilogoComponent) {
      this.note.disable()
      this.noteCompilate.disable()
    }
  }

  async bozzaReferto() {
    //già filtrato in base al tipo alimentazione, lato server
    const res = await firstValueFrom(this.documentHttp.getRefertoVisita(this.idVisita));

    const obj = {
      pdfFile: this.report.createReferto(res, true),

      nomeDocumento: res.nomeDocumento,
      idVisita: this.idVisita,
      title: 'Bozza referto',
    }

    this.dialog.open(ModalPdfViewerComponent, {
      data: obj,
      panelClass: 'modal-anteprima-pdf',
    })

  }

  ///Funzione che recupera il tipo di alimentazione
  async getTipoAlimentazione() {
    const result = await this.service.getCallRequest({
      action: 'getAlimentazioneFromVisita',
      param: this.idVisita,
    })
    this.idTipoAlimentazione = result
  }

  async checkConclusioniCompilate() {
    await this.service
      .getCallRequest({ action: 'checkConclusioniCompilate', param: this.idVisita })
      .then((data) => {
        if (data) {
          this.bEdit = false
          this.editorConfig.editable = false
          this.editorConfig.showToolbar = false
          this.isRiepilogo = true
          this.diagnosiModel = data
        }
      })
  }

  backToPrevious() {
    this.router.navigate(['/app/visite/step/valutazione-nutrizionale', this.idPaziente], {
      queryParams: { visit: this.idVisita },
    })
  }

  selectedConclusionePredefinita(conclusione) {
    if (!this.appGen.isNullOrUndefined(conclusione)) {
      this.diagnosiModel += ' ' + conclusione
    }
  }

  async getListConclusioniPredefinite() {
    await this.service
      .getCallRequest({ action: 'getListConclusioniPredefinite', param: 'conclusioni' })
      .then((data) => {
        this.listaConclusioniPredefinite = data
      })
  }

  async concludiVisita() {
    if (this.authGuard.canRole(this.appGen.ruolo.Dietista)) {
      this.chiudiVisitaDietista()
    } else {
      const message = `Vuoi concludere la visita? <br>Cliccando su conferma
    la visita non sarà più modificabile e verranno compilati i relativi documenti`
      const dialogData = new ConfirmDialogModel('Attenzione!', message)
      const dialogRef = this.dialog.open(ModalConfirmComponent, {
        data: dialogData,
        panelClass: 'modal-custom',
      })

      dialogRef.afterClosed().subscribe(
        await (async (dialogResult) => {
          if (dialogResult) {
            await this.service
              .putCallRequest({ action: 'concludiVisita', param: this.idVisita })
              .then(() => {

                this.router.navigate(['/app/visite/step/riepilogo', this.idPaziente], {
                  queryParams: this.params,
                })
              })
          }
        })
      )
    }
  }

  modificaNutrizione() {
    this.bEdit = !this.bEdit
    this.isRiepilogo = !this.isRiepilogo
    this.editorConfig.editable = true
    this.editorConfig.showToolbar = true
  }

  /**
   * Funzione che "Chiude la visita del dietista lasciandola da refertare", salva poi le note
   */
  async chiudiVisitaDietista() {
    const note = this.note.value

    const obj = {
      idVisita: this.idVisita,
      idTipoAlimentazione: this.idTipoAlimentazione,
    }

    const noteObj = {
      idVisita: this.idVisita,
      note: note,
    }

    await this.service
      .postCallRequest({ action: 'setTipoAlimentazioneVisita', param: obj })
      .then(async () => {
        await firstValueFrom(this.visitaServ.salvaNoteDietista(noteObj)).then(
          async () => {
            await this.service
              .putCallRequest({ action: 'concludiVisita', param: this.idVisita })
              .then(() => {
                this.router.navigate(['/app/visite/step/riepilogo', this.idPaziente], {
                  queryParams: this.params,
                })
              })
          }
        )
      })
  }

  /**
   * Funzione che recupera le note del dietista e se presenti le popola nel campo presente
   */
  async checkNoteDietistaCompilate() {
    const idVisita = this.idVisita

    ///Disabilita le note del dietista se l'utente non è dietista e se l'id alimentazione non corrisponde a artificiale/naturale
    if (
      !this.authGuard.canRole(this.appGen.ruolo.Dietista) ||
      this.idTipoAlimentazione === this.tipoAlimentazione.Artificiale ||
      this.idTipoAlimentazione === this.tipoAlimentazione.NaturaleMista
    ) {
      this.note.disable()
    }

    const noteDietista = await firstValueFrom(
      this.visitaServ.checkNoteDietistaCompilate(idVisita)
    )

    if (this.appGen.isNullOrUndefined(noteDietista) || noteDietista.trim() === '') {
      this.noteDietistaAssenti = true
    }

    if (this.authGuard.canRole(this.appGen.ruolo.Dietista)) {
      this.note.setValue(noteDietista)
    }

    if (!this.authGuard.canRole(this.appGen.ruolo.Dietista)) {
      this.noteCompilate.setValue(noteDietista)
    }
  }

  async onSubmit() {

    this.router.navigate([], {
      relativeTo: this.activateRoute,
      queryParams: { nutrexist: true },
      queryParamsHandling: 'merge',
    })

    /*   if (this.appGen.isNullOrUndefined(this.diagnosiModel)) {
         this.msgErrore =
           'É necessario compilare le <strong> conclusioni </strong> per proseguire'
         this.inError = true
         return
       }

       this.inError = false

       const obj = {
         idVisita: this.idVisita,
         diagnosi: this.diagnosiModel,
       }

       await this.service
         .postCallRequest({ action: 'salvaConclusioni', param: obj })
         .then(() => {
           this.bEdit = false

           this.editorConfig.editable = false
           this.editorConfig.showToolbar = false
           this.isRiepilogo = true
           this.router.navigate([], {
             relativeTo: this.activateRoute,
             queryParams: { nutrexist: true },
             queryParamsHandling: 'merge',
           })
         })*/
  }
}
