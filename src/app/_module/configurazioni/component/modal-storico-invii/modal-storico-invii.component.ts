import { Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';
import { NotificheReferti } from 'src/app/_models/documenti';
import { DocumentiService } from 'src/app/_repositories/documenti_repo.service';

@Component({
  selector: 'app-modal-storico-invii',
  templateUrl: './modal-storico-invii.component.html',
  styleUrls: ['./modal-storico-invii.component.scss']
})
export class ModalStoricoInviiComponent implements OnInit {

  listaStoricoInvii : NotificheReferti[] = [];
  dataSource = new MatTableDataSource();
  @ViewChild(MatPaginator, {static: false})
  set paginator(value: MatPaginator) {
    this.dataSource.paginator = value;
  }
  
  displayedColumns : string[] = [
    'utente',
    'completato',
    'data',
    'errori'
  ]

  constructor(
    public dialogRef: MatDialogRef<ModalStoricoInviiComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private documentiHttp : DocumentiService
  ) { }

  ngOnInit(): void {
    //console.log(this.data);
    
    this.getStoricoInvioReferti();
  }

  /**
   * Funzione che prende la lista dei referti con tentativo di avvio
   */
  async getStoricoInvioReferti(){
    this.listaStoricoInvii = await firstValueFrom(this.documentiHttp.storicoinvioreferti(this.data.idVisita));
    // for (let i = 0; i < 40; i++) {
    //   const element : NotificheReferti = {
    //     DataInvio: new Date(),
    //     UtenteInvio: 'Paperozzo',
    //     InvioCompletato: true,
    //     ErroriInvio: [
    //       {
    //         Errore : 'pluto',
    //         Ente: ''
    //       },
    //       {
    //         Errore : 'spiderman',
    //         Ente: ''
    //       }
    //     ]
    //   }
    //   this.listaStoricoInvii.push(element);
    // }
    this.dataSource.data = this.listaStoricoInvii;    
  }
}
