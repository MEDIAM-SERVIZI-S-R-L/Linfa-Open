import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { GradoParentela, Tutore } from 'src/app/_dtos/models_old';

@Component({
  selector: 'app-tutore-minorenne',
  templateUrl: './tutore-minorenne.component.html',
  styleUrls: ['./tutore-minorenne.component.scss']
})
export class TutoreMinorenneComponent implements OnInit {

  formTutore: FormGroup;
  idVisita: string;
  showCampoAltro = false;
  numeroTutori = 0;
  listaGradiParentela: GradoParentela[]
  @ViewChild(MatSelect) gradoParentelaSelect: MatSelect;
  @Input() isRiepilogoVisita: boolean;
  @Output() showPrivacyEmit = new EventEmitter<any>();

  constructor(private activateRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    public dialog: MatDialog,
    public authGuard: AuthGuard,
  ) {
  }

  ngOnInit(): void {
    this.formTutore = this.formBuilder.group({
      tutori: new FormArray([this.addTutore()]),
    });

    if (this.isRiepilogoVisita) {
      this.formTutore.disable()
    }

    this.tutori.setValidators([Validators.required])
    this.tutori.updateValueAndValidity()

    this.activateRoute.queryParams.subscribe(async (params): Promise<void> => {
      if (!(this.appGen.isNullOrUndefined(params.visit))) {
        this.idVisita = params.visit;
        this.checkTutoreExist();

      }
    });
    this.getGradiParentela()

  }

  aggiungi(): void {
    this.tutori.push(this.addTutore())
    this.appGen.scroll('tutore_1');
    this.numeroTutori++
  }

  deleteTutore(i: number): void {
    this.tutori.removeAt(i);
    this.numeroTutori--
  }

  get f() { return this.formTutore.controls; }
  get tutori() { return this.f.tutori as FormArray; }


  async getGradiParentela(): Promise<void> {
    await this.service.getCallRequest({ action: 'gradiparentela', param: false }).then((data): any => this.listaGradiParentela = data);
  }

  async checkTutoreExist(): Promise<void> {
    await this.service.getCallRequest({ action: 'checkTutoreExist', param: this.idVisita }).then(async (data): Promise<void> => {

      if (data.exist) {
        if (data.tutori.length > 1) {
          this.aggiungi()
        }
        let i = 0
        for await (const element of data.tutori) {

          this.tutori.controls[i]['controls'].nome.setValue(element.nome)
          this.tutori.controls[i]['controls'].cognome.setValue(element.cognome)
          this.tutori.controls[i]['controls'].sesso.setValue(element.sesso)
          this.tutori.controls[i]['controls'].cf.setValue(element.cf)
          this.tutori.controls[i]['controls'].dataNascita.setValue(new Date(element.dataNascita))
          this.tutori.controls[i]['controls'].gradoParentela.setValue(element.idGradoParentela)
          this.tutori.controls[i]['controls'].cartaIdentita.setValue(element.cartaIdentita)
          this.tutori.controls[i]['controls'].telefono.setValue(element.telefono)
          this.tutori.controls[i]['controls'].altroGradoParentela.setValue(element.altroGradoParentela)
          this.tutori.controls[i]['controls'].id.setValue(element.id)

          i++

        }
        this.showPrivacyEmit.next(null)

      }
    });
  }


  addTutore(): FormGroup {
    return this.formBuilder.group({
      id: new FormControl(''),
      nome: new FormControl(''),
      cognome: new FormControl(''),
      dataNascita: new FormControl(''),
      gradoParentela: new FormControl(''),
      cartaIdentita: new FormControl(''),
      sesso: new FormControl(''),
      telefono: new FormControl(''),
      altroGradoParentela: new FormControl(''),
      cf: new FormControl('', Validators.pattern('^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$')),
    });

  }

  async onSubmit(): Promise<void> {

    let continua = true;

    if (!this.formTutore.valid && this.formTutore.status !== 'DISABLED') {
      this.appGen.validateAllFormFields(this.formTutore);
      continua = false
      return;
    }

    if (continua) {


      const objTutori = [];
      this.tutori.value.forEach((element: Tutore): void => {

        objTutori.push({
          Nome: element.nome,
          Cognome: element.cognome,
          Sesso: element.sesso,
          Cf: element.cf,
          DataNascita: this.appGen.convertToLocaleDate(element.dataNascita),
          IdGradoParentela: element.gradoParentela,
          CartaIdentita: element.cartaIdentita,
          Telefono: element.telefono,
          AltroGradoParentela: element.altroGradoParentela,
          IdVisita: this.idVisita,
          Id: element.id
        })
      });

      const obj = {
        tutori: objTutori,
        IdVisita: this.idVisita,

      }

      await this.service.postCallRequest({ action: 'insertUpdateTutoreMinorenne', param: obj }).then((): void => {
        this.showPrivacyEmit.next(null);
      });

    }
  }


}
