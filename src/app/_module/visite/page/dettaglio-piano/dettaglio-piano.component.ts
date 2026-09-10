import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TipoAlimentazione, TipoNutrizioneArtificiale } from 'src/app/_core/helpers/enums';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { TabellaProdottiComponent } from 'src/app/_module/visite/component/nutrizione/tabella-prodotti/tabella-prodotti.component';
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard';

@Component({
  selector: 'app-dettaglio-piano',
  templateUrl: './dettaglio-piano.component.html',
  styleUrls: ['./dettaglio-piano.component.scss']
})
export class DettaglioPianoComponent implements OnInit {

  tipoAlimentazione = TipoAlimentazione;
  isRiepilogoVisita = true;
  idTipoAlimentazione;
  idPianoNutrizionale;
  prodottiSelezionati;
  @ViewChild(TabellaProdottiComponent, { static: false }) private tabellaProdottiComponent: TabellaProdottiComponent;
  idPaziente
  dataResult;

  TipoNutrizioneArtificiale = TipoNutrizioneArtificiale
  edit = false;
  mostraSacche = false;

  constructor(
    private activateRoute: ActivatedRoute,
    public appGen: AppGeneralService,
    private service: HttpSharedService,
    public authGuard: AuthGuard,

  ) { }

  ngOnInit() {
    this.idPianoNutrizionale = this.activateRoute.snapshot.paramMap.get('id');
    this.activateRoute.queryParams.subscribe(params => {
      if (!(this.appGen.isNullOrUndefined(params.patient))) {
        this.idPaziente = params.patient;
      }
      if (!(this.appGen.isNullOrUndefined(params.type))) {
        this.idTipoAlimentazione = params.type;
        this.getDettaglioPianoNutrizionale();
      }
      if (!(this.appGen.isNullOrUndefined(params.edit))) {
        this.edit = params.edit;
      }
    });
  }

  async getDettaglioPianoNutrizionale() {
    await this.service.getCallRequest({ action: 'getDettaglioPianoNutrizionale', param: this.idPianoNutrizionale }).then(data => {

      if (data) {
        this.dataResult = data;
      }


    });
  }

}
