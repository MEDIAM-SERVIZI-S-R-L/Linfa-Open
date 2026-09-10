import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TipoRichiesta } from 'src/app/_core/helpers/enums';

@Component({
  selector: 'app-richiesta-esterna',
  templateUrl: './richiesta-esterna.component.html',
  styleUrls: ['./richiesta-esterna.component.scss']
})
export class RichiestaEsternaComponent implements OnInit {
@Input() data
tipoRichiestaRoute: TipoRichiesta | null = null
  constructor(
    private backPreviousPage: Location,
    private route: ActivatedRoute
  ) {


   }

   backToPrevious() {
    this.backPreviousPage.back();
  }


  ngOnInit(): void {
    if(this.route?.snapshot?.data){
      this.tipoRichiestaRoute= this.route?.snapshot?.data.tipoRichiestaRoute

     }
  }

}
