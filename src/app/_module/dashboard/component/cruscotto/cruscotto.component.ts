import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard';
import { Ruoli } from 'src/app/_core/helpers/enums';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { SnackBarService } from 'src/app/_core/services/loader.service';

@Component({
  selector: 'app-cruscotto',
  templateUrl: './cruscotto.component.html',
  styleUrls: ['./cruscotto.component.scss']
})
export class CruscottoComponent implements OnInit {

  arrayIdCruscotti: Array<number> = [1, 2, 3];
  arrayCruscottiNew: Array<any> = [];

  pageSelected = 0;
  queryParams: any = {};

  ruolo = Ruoli;
  user;

  dashboardAssenti = false;

  constructor(
    private service: HttpSharedService,
    private router: Router,
    public appGen: AppGeneralService,
    public dialog: MatDialog,
    public authGuard: AuthGuard,
    private notificate : SnackBarService,
  ) {
    this.user = this.authGuard.getUser();
  }

  ngOnInit() {

    this.getValoriCruscottiNew()

  }

  refresh(): void {
    this.getValoriCruscottiNew()
  }

  goToElencoRilevazioni(idPaziente) {

    this.createParams(idPaziente)
    sessionStorage.setItem('ricercaParamPaziente', JSON.stringify(this.queryParams));
    this.router.navigate(['app/rilevazioni']);
  }
  createParams(idPaziente: any) {
    this.queryParams.page = this.pageSelected;
    if (!(idPaziente === null || idPaziente === undefined)) {
      this.queryParams.idPaziente = idPaziente;
    }
  }


  async getValoriCruscottiNew() {
    try {
      await this.service.getCallRequest({ action: 'getAllQuerylists' }).then(data => {
        if (data && data.length > 0) {
          this.arrayCruscottiNew = data;
        } else {
          this.dashboardAssenti = true;
        }
      })
    } catch (error) {
      this.notificate.error('È stato riscontrato un errore, riprovare')
    }

  }

  detailCruscottoNew(query) {
    if (query.count <= 0) {
      return;
    }

    // if (!this.user.Role.includes('Administrator')) {
    //   return;
    // }
    const denied = "Accesso Negato";

    //** Per Reparto e Distretto visibile solo le query di tipo richiesteesterne */
    switch (query.tipo) {
      case 'richiesteesterne': // Order entry
      if (!this.authGuard.canRole(this.appGen.ruolo.Reparto) && !this.authGuard.canRole(this.appGen.ruolo.Distretto) && !this.authGuard.canRole(this.appGen.ruolo.Medico) ) {
        this.appGen.notificate.error(denied);
        return;
      }

      this.router.navigate(['app/richieste'], { queryParams: { query: query.queryId } })
      break;

      case 'distretto': // distretto
      if (!this.authGuard.canRole(this.appGen.ruolo.Distretto)) {
        this.appGen.notificate.error(denied);
      }

      this.router.navigate(['app/richieste'], { queryParams: { query: query.queryId } })
      break;

      case "richieste": // Richieste normale

        if (!this.authGuard.canAccess(this.appGen.permesso.ModuloRichieste)) {
          this.appGen.notificate.error(denied);
        }
        this.router.navigate(['app/richieste'], { queryParams: { query: query.queryId } })
        break;
      case "pazienti":
        if (!this.authGuard.canAccess(this.appGen.permesso.ModuloPazienti)) {
          this.appGen.notificate.error(denied);
        }
        this.router.navigate(['app/pazienti'], { queryParams: { query: query.queryId } })
        break;
      case "visite":
        if (!this.authGuard.canAccess(this.appGen.permesso.ModuloVisite)) {
          this.appGen.notificate.error(denied);
        }
        this.router.navigate(['app/visite'], { queryParams: { query: query.queryId } })
        break;
      case "referti":
        if (!this.authGuard.canAccess(this.appGen.permesso.ModuloVisite)) {
          this.appGen.notificate.error(denied);
        }
        // eslint-disable-next-line no-case-declarations
        let _refertiFirmati= false;

        // sotto tipo impostato per referti firmati
       // if(query.sottoTipo=="firmati")
       if(query.queryId==11)
        {
          _refertiFirmati= true;
          this.router.navigate(['app/visite/lista/referti'], { queryParams: { query: query.queryId, refertiFirmati: _refertiFirmati} })
        }else if(query.queryId==18){
          //_refertiFirmati= true;
          this.router.navigate(['app/visite/lista/referti'], { queryParams: { query: query.queryId, refertiFirmati: true, conErrore:true} })

        }else  if(query.queryId==22){
          this.router.navigate(['app/visite/lista/referti'], { queryParams: { query: query.queryId, refertiFirmati:null} })
        }else {
          this.router.navigate(['app/visite/lista/referti'], { queryParams: { query: query.queryId, refertiFirmati: _refertiFirmati} })
        }


        break;




      default:
        break;
    }
  }

}
