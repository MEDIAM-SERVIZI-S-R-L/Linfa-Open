import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { SnackBarService } from 'src/app/_core/services/loader.service';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { TipoDocumento } from 'src/app/_core/helpers/enums';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent implements OnInit {

  files: any[] = [];
  listaTipiDocumento;
  fileBase64;
  fileNotUploaded = false;
  isFromStorico = false;
  selectedValue;
  formUpload: FormGroup;
  @Input() idVisita;
  @Input() isStepVisita;
  @Output() uploadDone = new EventEmitter();
  @ViewChild('fileDropRef') fileDropRef: any;

  constructor(
    private service: HttpSharedService,
    private activateRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private appGen: AppGeneralService,
    private dialog: MatDialog,
    private notificate: SnackBarService,

  ) { }

  ngOnInit() {
    this.activateRoute.queryParams.subscribe(params => {
      if (!(this.appGen.isNullOrUndefined(params))) {
        this.idVisita = params.visit;
      }
    });

    this.formUpload = this.formBuilder.group({
      files: new FormArray([])
    });

    this.getListaTipiDocumenti();
    if (this.isStepVisita) {

      this.getDocumentExist();
    }
  }

  get f() { return this.formUpload.controls; }
  get t() { return this.f.files as FormArray; }

  async getListaTipiDocumenti() {
    const obj = {
      // ListaTipiDocumento: [2, 3, 99]
    }
    await this.service.postCallRequest({ action: 'tipidocumenti', param: obj }).then(data => {

      data = data.filter(item => item.id !== TipoDocumento.RefertoNutrizione);
      data = data.filter(item => item.id !== TipoDocumento.PianoTerapeutico);

      this.listaTipiDocumento = data;
    });
  }

  async getDocumentExist() {
    const obj = {
      // ListaTipiDocumento: [2, 3, 99],
      idVisita: this.idVisita
    }

    await this.service.postCallRequest({ action: 'getlistdocumenti', param: obj }).then(data => {
      this.t.clear()
      data.forEach(element => {
        this.t.push(this.formBuilder.group({
          name: [element.name],
          typeDoc: [element.typeDoc],
          id: [element.idDocumento]
        }));
      });

    });

  }

  onFileDropped($event) {
    this.onLoadFileDropped($event);
  }

  // /**
  //  * handle file from browsing
  //  */
  fileBrowseHandler(files) {
    this.onLoadFileDropped(files);
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  async removeFile(index: number, file) {

    if (!this.appGen.isNullOrUndefined(file.id)) {
      await this.deletedocument(index, file.id)
    } else {
      this.t.removeAt(index);
      this.files.splice(index)
    }
  }

  async deletedocument(index, id) {

    const dialogData = new ConfirmDialogModel("Attenzione!", "Il documento è già stato caricato, vuoi eliminarlo definitivamente?");
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data: dialogData,
      panelClass: "modal-custom"

    });
    dialogRef.afterClosed().subscribe((async dialogResult => {
      if (dialogResult) {
        await this.service.putCallRequest({ action: 'deletedocument', param: id }).then(() => {
          this.t.removeAt(index);
          this.files.splice(index)
        });
      }
    }));
  }

  setTypeDocument(value, i) {
    this.t.controls[i].get('typeDoc').setValue(value);
  }

  onLoadFileDropped(files) {
    for (const item of files) {
      this.onLoadFile(item);
    }
  }

  async onLoadFile(event) {
    const file = event;
    await this.getBase64(file).then(
      data => this.fileBase64 = data
    );

    this.t.push(this.formBuilder.group({
      name: [file.name],
      typeDoc: [file.typeDoc, Validators.required],
      size: file.size,
      fileBase64: this.fileBase64.split(',')[1],
    }));



    this.fileNotUploaded = false;
  }

  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  formatBytes(bytes, decimals?) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }


  async onSubmit() {
    if (this.t.value.length <= 0) {
      return;
    }

    const retrievedObject = sessionStorage.getItem('idVisitaParam');
    if (!(this.appGen.isNullOrUndefined(retrievedObject))) {
      const param = JSON.parse(retrievedObject);
      this.idVisita = param.idVisita;
      this.isFromStorico = true
    }

    this.files = [];

    for await (const file of this.t.value) {
      this.files.push(file);
    }

    for await (const file of this.files) {
      if (file.typeDoc === undefined || file.typeDoc === '' || file.typeDoc === null || file.typeDoc <= 0) {
        this.notificate.error('É necessario indicare il tipo documento')
        return;
      }
    }


    const obj = {
      idVisita: this.idVisita,
      files: this.files
    }

    await this.service.postCallRequest({ action: 'uploaddocument', param: obj }).then(() => {

      if (this.isFromStorico) {
        this.uploadDone.emit();
      }

      this.getDocumentExist();
      this.fileDropRef.nativeElement.value = '';
    });
  }

}
