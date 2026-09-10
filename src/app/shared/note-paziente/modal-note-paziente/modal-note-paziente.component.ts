import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { MatSelect } from '@angular/material/select';
import { NotePazienteService } from '../note-paziente.service';

@Component({
  selector: 'app-modal-note-paziente',
  templateUrl: './modal-note-paziente.component.html',
  styleUrls: ['./modal-note-paziente.component.scss']
})
export class ModalNotePazienteComponent implements OnInit {

  form: FormGroup;
  formFiltriPaziente: FormGroup;
  isRiepilogo = false;
  listaPazienti = [];
  pazienteSelezionato;
  idNote;
  dataCreazione;

  @ViewChild('pazienteSelect') pazienteSelect: MatSelect;

  constructor(
    private service: HttpSharedService,
    private formBuilder: FormBuilder,
    public appGen: AppGeneralService,
    private noteService: NotePazienteService,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data) {
    if (!this.appGen.isNullOrUndefined(data)) {
      this.idNote = data.idNote;
      this.getDettaglio();
    }

  }

  ngOnInit() {
    this.formFiltriPaziente = this.formBuilder.group({
      nome: new FormControl(''),
      cognome: new FormControl(''),
      cf: new FormControl(''),
    });

    this.form = this.formBuilder.group({
      note: new FormControl('', Validators.required),
      contatto: new FormControl('', Validators.required),
    });

  }

  get f() { return this.form.controls; }


  async searchPaziente() {
    let obj = new Object();
    obj = {
      Nome: this.formFiltriPaziente.get("nome").value,
      Cognome: this.formFiltriPaziente.get("cognome").value,
      Cf: this.formFiltriPaziente.get("cf").value,
      page: 0,
      elementForPage: 20,
    }

    await this.service.postCallRequest({ action: 'listapazienti', param: obj, loadingPanel: false }).then((data) => {
      this.listaPazienti = data['listaPazienti'];
      setTimeout(() => {

        this.pazienteSelect.open();
      }, 0);

    });
  }


  async getDettaglio() {


    await this.service.getCallRequest({ action: 'dettaglionote', param: this.idNote }).then((data) => {

      this.pazienteSelezionato = data.paziente;
      this.dataCreazione = data.dataCreazione;
      this.form.get('contatto').setValue(data.contatto)
      this.form.get('note').setValue(data.note)
      this.form.disable();
      this.isRiepilogo = true;
    })
  }

  selectedPaziente(evt) {
    this.pazienteSelezionato = evt;
  }

  svuotaPaziente() {
    this.pazienteSelezionato = "";
    this.pazienteSelect.value = null;
  }

  async onSubmit() {

    if (this.form.invalid) {
      this.appGen.validateAllFormFields(this.form);
      return;
    }
    const obj = {
      IdPaziente: this.pazienteSelezionato.idPaziente,
      Contatto: 1,
      Note: this.form.get('note').value,
      IdNote: this.idNote == undefined ? null : this.idNote

    }

    await this.service.postCallRequest({ action: 'InsertUpdateNoteXPaziente', param: obj }).then(() => {
      this.noteService.update();
      this.dialogRef.close(true);
    });
  }

  onDismiss(): void {
    this.dialogRef.close();
  }
}

