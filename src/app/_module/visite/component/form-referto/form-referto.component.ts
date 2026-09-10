import { Component, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AngularEditorConfig, AngularEditorToolbarComponent } from '@kolkov/angular-editor';
import { Subject, debounceTime, firstValueFrom } from 'rxjs';
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { SnackBarService } from 'src/app/_core/services/loader.service';
import { RequestUpdateService } from 'src/app/_core/services/request-update/request-update.service';
import { SaveDiagnosiToDTO } from 'src/app/_dtos/out';
import { VisitaRepoService } from 'src/app/_repositories/visita_repo.service';

import { ListaConclusioniPredefiniteComponent } from '../../modals/lista-conclusioni-predefinite/lista-conclusioni-predefinite.component';

@Component({
  selector: 'app-form-referto',
  templateUrl: './form-referto.component.html',
  styleUrls: ['./form-referto.component.scss']
})
export class FormRefertoComponent implements OnInit {


  @Optional() @Input() modificabileForm = true;  //** nel storico , riepilogo referto none modificabile
  autoSaveEnabled = true;  //** abilitato autosave ma viene letto solo se modificabileForm == true  */
  @ViewChild('editor') editor: any;
  editorConfig: AngularEditorConfig   //** Configurazione Toolbox */
  diagnosiModel: string | null = null   //** Referto vuoto */
  listaConclusioniPredefinite;
  refertoChanged = new Subject<string>();
  idVisita: string | null = null;

  constructor(
    public appGen: AppGeneralService,
    public authGuard: AuthGuard,
    private service: HttpSharedService,
    private notificate: SnackBarService,
    private visitaServ: VisitaRepoService,
    private activateRoute: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router,
    private requestUpdate: RequestUpdateService,
  ) {

    this.refertoChanged
      .pipe(
        debounceTime(300))
      .subscribe(() => {
        this.saveDiagnosi()
      })
  }

  async ngOnInit() {

    //** Sottoscizione che abilità o disabilita la possibilita della scrittura   */
    this.requestUpdate.updatedElementName.subscribe(
      async (item) => {
        if ((item.objName == "VisitaModificabile")) {
          this.modificabileForm = item.objValue;
          this.checkIsEditableDiagnosi()
        }
      }
    );

    this.activateRoute.url.subscribe(() => {
      console.log("cambiato url1")
      this.checkIsEditableDiagnosi()
    })

    this.activateRoute.queryParams.subscribe((params) => {


      if (!this.appGen.isNullOrUndefined(params.visit)) {
        this.idVisita = params.visit

      }
      if (this.idVisita) {
        this.checkIsEditableDiagnosi();
        this.checkConclusioniCompilate();
      }



    })




  }

  ngOnDestroy() {
    this.refertoChanged.unsubscribe();
  }


  /**
   * Inserisce la conclusione selezionata alla fine del referto
   * !TODO : vedere come fare che inserisce la diagnosi selezionata dove ho lasciato il cursore nel testo
   * @param conclusione
   */
  selectedConclusionePredefinita(conclusione) {
    try {
      if (!this.appGen.isNullOrUndefined(conclusione)) {
        this.diagnosiModel += ' ' + conclusione
      }
    } catch (error) {
      console.error(error)
      this.notificate.error("È stato riscontrato qualche problema con inserimento della conclusione predefinita riprovare")
    }

  }



  /**
   *
   * @param $event Richiamo autosave se diagnosi è modificabile. Visita non è chiusa
   */
  autoSave($event) {
    this.refertoChanged.next("");

  }

  //** Salvataggio della diagnosi  */
  async saveDiagnosi() {
    try {
      if (this.diagnosiModel && this.idVisita) {
        const sendJson = new SaveDiagnosiToDTO(this.idVisita, this.diagnosiModel)
        await firstValueFrom(this.visitaServ.postSaveUpdateDiagnosi(sendJson))
      }
    } catch (error) {
      console.error(error)
      this.notificate.error("Problema nell salvataggio della conclusione")
    }


  }


  /**
   *  Quando clicco "Seleziono concluzione" nel toolbox richiamo la modale con la lista
   */
  selectConclusioniPredefinite() {


    try {
      if (this.diagnosiModel && this.idVisita) {


        let _cursorPosition = 0
        //** Controllo se cursore è posizionato nel box */
        if (this.editor.editorService.savedSelection) {
          _cursorPosition = this.editor.editorService.savedSelection.startOffset
        }

        //** Apro modale con la lista */

        const dialogRef = this.dialog.open(ListaConclusioniPredefiniteComponent, {
          panelClass: 'modal-lista-documenti',
          height: 'auto',
          maxHeight: '96vh',
          width: '96vw',
        });


        //** alla chiusura del modale passo il testo selezionato */
        dialogRef.afterClosed().subscribe(async dialogResult => {

          //** se non è stata selezionata la conclusione non faccio niente */
          if (dialogResult) {
            if (this.diagnosiModel && this.diagnosiModel.length > 1) {
              this.diagnosiModel = this.diagnosiModel?.slice(0, _cursorPosition ? _cursorPosition : 0) + " " + dialogResult + " " + this.diagnosiModel?.slice(_cursorPosition ? _cursorPosition : 0, (this.diagnosiModel.length - 1));
            } else {
              this.diagnosiModel = dialogResult
            }

          }
        });
      }
    } catch (error) {
      console.error(error)
      this.notificate.error("Problema nell inserimento conclusioni predefinite")
    }

  }

  /**
   * Posso attivare nel toolbox autosave
   */
  enableDisableAutoSave() {
    this.autoSaveEnabled = !this.autoSaveEnabled
  }


  /**
   * Prendo diagnosi se è compilata
   */
  async checkConclusioniCompilate() {

    try {
      await this.service
        .getCallRequest({ action: 'checkConclusioniCompilate', param: this.idVisita })
        .then((data) => {
          if (data) {

            this.diagnosiModel = data
          }
        })
    } catch (error) {
      console.error(error)
      this.notificate.error("Problema nel recupero conclusione salvata")
    }



  }



  /**
   * Funzione che attivi e disattiva editor
   */
  checkIsEditableDiagnosi() {

    try {

      this.editorConfig = this.appGen.editorDefaultConfig();


      if (!this.modificabileForm) {
        this.editorConfig.editable = false
        this.editorConfig.showToolbar = false
      }
    } catch (error) {
      console.error(error)
      this.notificate.error("Problema problema con recupero id paziente 101")
    }



  }

}
