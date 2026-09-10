import { Component, OnInit } from '@angular/core';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/_core/app-auth/service/auth.service';
import { SnackBarService } from 'src/app/_core/services/loader.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {
  SecretKey;
  params;
  idRichiesta;
  constructor(private appGen: AppGeneralService,
    private router: Router,
    private service: HttpSharedService,
    private authService: AuthService,
    private activateRoute: ActivatedRoute,
    private notificate: SnackBarService,

  ) { }

  ngOnInit() {
    this.appGen.loadingPanel.show();


    this.activateRoute.queryParams.subscribe(params => {
      this.params = params
    });
    if (!this.appGen.isNullOrUndefined(this.params)) {
      this.AccessExternal();
    } else {
      this.notificate.error("Sono stati riscontrati alcuni problemi, riprovare");
    }
  }

  async AccessExternal() {

    let urlEncoded = encodeURIComponent(this.params.token);
    urlEncoded = urlEncoded.replace(/%20/g, '%2B');



    let obj = new Object();
    obj = {
      Token: urlEncoded
    }

    //effettuo la login, passo la stringa criptata e la converto a be, verifico se posso accedere e restituisco il token
    const token = await this.service.AccessExternal(obj)
    //setto il token, se non ho errori mi torna null
    const err = this.authService.externalAccess(token);
    if (err === null) {
      /*
      Sono riuscito ad accedere tramite sapio, passo la stringa criptata e mi recupero l'oggetto
      decriptato in modo da avere i parametri
      */

      await this.service.postCallRequest({ action: 'decryptString', param: obj }).then((data) => {

        this.params = data;


        //Se c'è la data prestazione vuol dire che stiamo inserendo una richiesta tramite sapio
        //una volta inserita vado direttamente al dettaglio
        if (!this.appGen.isNullOrUndefined(this.params.dataprestazione)) {
          this.CheckRichiestaPaziente(this.params).then(() => {
            this.router.navigate(['/app/richieste/dettaglio/richiesta', this.idRichiesta])
          })
        }

        //Se non abbiamo data prestazione, vogliamo vedere il followup di un paziente di cui la visita è già stata fatta
        if ((this.appGen.isNullOrUndefined(this.params.dataprestazione)) && (!this.appGen.isNullOrUndefined(this.params.cf))) {
          this.CheckFollowUpPaziente(this.params)
        }

      })


    }
  }


  login() {
    this.router.navigate(['login']);
  }

  async CheckRichiestaPaziente(obj) {
    await this.service.postCallRequest({ action: 'checkrichiestapaziente', param: obj }).then(data => {
      this.idRichiesta = data;
    });

  }

  async CheckFollowUpPaziente(obj) {
    await this.service.postCallRequest({ action: 'checkFollowUpPaziente', param: obj }).then(data => {
      if (!data.exist) {
        this.router.navigate(['/app/pazienti/dettaglio/paziente'], { queryParams: this.params })
      } else {
        this.router.navigate(['/app/visite/followup', data.idPaziente], { queryParams: { richiesta: data.idRichiesta } })

      }
    });
  }
}



