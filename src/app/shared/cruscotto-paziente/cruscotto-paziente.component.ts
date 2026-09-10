import { Component, EventEmitter, Inject, Input, OnInit, Optional, Output, PLATFORM_ID } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { HttpSharedService } from 'src/app/_core/services/http-shared.service'
import { AppGeneralService } from 'src/app/_core/services/app-general.service'
import { isPlatformServer } from '@angular/common'
import { MatIconRegistry } from '@angular/material/icon'
import { DomSanitizer } from '@angular/platform-browser'
import { environment } from 'src/environments/environment'
import { NotePazienteService } from 'src/app/shared/note-paziente/note-paziente.service'
import {
  ConfirmDialogModel,
  ModalConfirmComponent,
} from 'src/app/shared/modal/modal-confirm/modal-confirm.component'
import { MatDialog } from '@angular/material/dialog'
import { firstValueFrom } from 'rxjs'
import { PazienteService } from 'src/app/_repositories/paziente_repo.service'
import { IBoxInfoParamsToDTO } from 'src/app/_dtos/out'
import { BoxPaziente, IModelImpegnativaCupModel } from 'src/app/_models/paziente'
import { ModalImpegnativaCupComponent } from '../modal-impegnativa-cup/modal-impegnativa-cup.component'
import { StatoVisita, TipoRichiesta } from 'src/app/_core/helpers/enums'

@Component({
  selector: 'app-cruscotto-paziente',
  templateUrl: './cruscotto-paziente.component.html',
  styleUrls: ['./cruscotto-paziente.component.scss'],
})
export class CruscottoPazienteComponent implements OnInit {
  panelOpenState = false
  datiPaziente: BoxPaziente
  count

  @Input() fromFollowUp
  isFollowup = false
  isLoaded = false
  isStoricoCruscotto = true
  eta: string
  dataPresaInCarico
  dataSelezionata
  idPaziente
  idVisita = null
  idTipoRichiesta: TipoRichiesta = 0;
  TipoRichiesta = TipoRichiesta;

  editNumeroImpegnativa: boolean = true;

  @Optional() @Input() mapToPazientId = null  // parametro opzionale che viene passato da recall componente nel html , serve per mappare idPaziente che si chiama diversamente nel componente padre - usato nel piani nutrizionali
  @Optional() @Input() mapToPazientVisitId = null  // parametro opzionale che viene passato da recall componente nel html , serve per mappare idVisita che si chiama diversamente nel componente padre

  constructor(
    private service: HttpSharedService,
    private noteService: NotePazienteService,
    public appGen: AppGeneralService,
    public activateRoute: ActivatedRoute,
    private pazienteHttp: PazienteService,
    private matIconRegistry: MatIconRegistry,
    private dialog: MatDialog,
    private domSanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) platformId: string
  ) {
    // domain and port for SSR in this example is static. Use i.e. environment files to use appropriate dev/prod domain:port
    const domain = isPlatformServer(platformId) ? environment.Url : ''

    this.matIconRegistry.addSvgIcon(
      'male',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        domain + 'assets/icons/gender-male.svg'
      )
    )
    this.matIconRegistry.addSvgIcon(
      'female',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        domain + 'assets/icons/gender-female.svg'
      )
    )
    this.matIconRegistry.addSvgIcon(
      'other',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        domain + 'assets/icons/gender-other.svg'
      )
    )
  }

  async ngOnInit() {
    let idPaziente: string = null
    let idVisita: string = null
    if (this.mapToPazientId) {
      idPaziente = this.mapToPazientId
      idVisita = this.mapToPazientVisitId
    } else {
      idPaziente = this.activateRoute.snapshot.params.id
      idVisita = this.activateRoute.snapshot.queryParams.visit
    }
    //** Serve per passare IdPaziente nella preso in carrico e in un altro punto */
    this.idPaziente = idPaziente

    this.getDatiPazienteVisita(idPaziente, idVisita);
  }

  async editDataPresaInCarico() {
    const message =
      'Vuoi salvare: <strong>' +
      new Date(this.dataSelezionata).toLocaleDateString() +
      '</strong> come nuova data di presa in carico? '
    const dialogData = new ConfirmDialogModel('Attenzione!', message)
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data: dialogData,
      panelClass: 'modal-custom',
    })

    dialogRef.afterClosed().subscribe(async (dialogResult) => {
      if (dialogResult) {
        this.dataPresaInCarico = this.dataSelezionata

        const obj = {
          idPaziente: this.idPaziente ? this.idPaziente : null,
         // idPaziente: this.idPaziente && this.idPaziente.id ? this.idPaziente.id : null,
          dataPresaInCarico: this.dataPresaInCarico,
        }
        await this.service
          .postCallRequest({ action: 'setDataPresaInCarico', param: obj })
          .then((data) => {
            this.count = data
          })
        this.datiPaziente.dataPresaInCarico = this.dataSelezionata
      } else {
        this.dataSelezionata = ''
      }
    })
  }

  async getDatiPazienteVisita(
    _idPaziente: string | null = null,
    _idVisita: string | null = null
  ) {
    // server per mostratre label "Ulmia visita" (insto in paziente) o "visita" ( visto nella visita)
    this.idVisita = _idVisita ? _idVisita : null

    const _obj: IBoxInfoParamsToDTO = {
      idPaziente: _idPaziente,
      idVisita: _idVisita,
    }

    // per vedere box verde devo passare almeno uno dei due parametri
    if(_idPaziente || _idVisita){
      this.datiPaziente = await firstValueFrom(this.pazienteHttp.getBoxInfoPaziente(_obj));   
      this.idTipoRichiesta = this.datiPaziente.idTipoRichiesta;      
      this.isLoaded = true;      
      if (this.datiPaziente.idStatoVisita === StatoVisita.Terminata) {
        this.editNumeroImpegnativa = false;
      }
    }

    

  }
  async getCountStorico(_idPaziente: string) {
    await this.service
      .getCallRequest({ action: 'getCountStorico', param: this.idPaziente })
      .then((data) => {
        this.count = data
      })
  }

  ngOnChanges(changes) {
    this.datiPaziente = changes.currentValue
  }

  openModalNumeroImpegnativa(event: any){
    event.preventDefault();
    event.stopPropagation();
    const dialogData : IModelImpegnativaCupModel = {
      idVisita: this.idVisita,
      NumeroImpegnativa: this.datiPaziente.numeroImpegnativa
    }
    const dialogRef = this.dialog.open(
      ModalImpegnativaCupComponent,{
        data: dialogData,
        panelClass: 'modal-custom'
      })
      dialogRef.afterClosed().subscribe(async (dialogResult) => {
        this.appGen.loadingPanel.show();
        this.getDatiPazienteVisita(this.idPaziente, this.idVisita)
        this.appGen.loadingPanel.hide();
      })
  }
}
