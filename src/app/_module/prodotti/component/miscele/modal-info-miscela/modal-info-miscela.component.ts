import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TipiAmminoacidi } from 'src/app/_core/helpers/enums';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';

@Component({
  selector: 'app-modal-info-miscela',
  templateUrl: './modal-info-miscela.component.html',
  styleUrls: ['./modal-info-miscela.component.scss']
})
export class ModalInfoMiscelaComponent {

  miscela: any;
  imageBase64: string;
  tipiAmminoacidi = TipiAmminoacidi

  constructor(
    public appGen: AppGeneralService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data) {
    this.miscela = data;
  }

  returnVal(tipo: number): string {
    return TipiAmminoacidi[tipo];
  }
}
