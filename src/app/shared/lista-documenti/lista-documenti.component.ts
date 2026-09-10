import { SelectionModel } from '@angular/cdk/collections'
import { Component, OnInit, Inject, ViewChild } from '@angular/core'
import { FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatPaginator } from '@angular/material/paginator'
import { MatTableDataSource } from '@angular/material/table'
import { HttpSharedService } from 'src/app/_core/services/http-shared.service'
import { SnackBarService } from 'src/app/_core/services/loader.service'
import { AppGeneralService } from 'src/app/_core/services/app-general.service'
import { TipoDocumento, TipoPrestazione } from 'src/app/_core/helpers/enums'
import {
  ConfirmDialogModel,
  ModalConfirmComponent,
} from 'src/app/shared/modal/modal-confirm/modal-confirm.component'
import { UploadFileComponent } from 'src/app/shared/upload-file/upload-file.component'
import { ReportService } from 'src/app/_core/services/report.service'
import { firstValueFrom } from 'rxjs'
import { DocumentiService } from 'src/app/_repositories/documenti_repo.service'

@Component({
  selector: 'app-lista-documenti',
  templateUrl: './lista-documenti.component.html',
  styleUrls: ['./lista-documenti.component.scss'],
})
export class ListaDocumentiComponent implements OnInit {
  content: string
  documentiDataSource = new MatTableDataSource<any>()
  documentiViewsColumns = [
    'select',
    'nome',
    'tipoDocumento',
    'dataPrestazione',
    'dataDocumento',
    'pulsanti',
  ]
  objRequest
  listaTipiDocumento
  isUploadFile = false
  isFromPaziente = false
  formFiltri: FormGroup
  idVisita
  title

  selection = new SelectionModel<any>(true, [])
  tipoPrestazione = TipoPrestazione
  tipoDocumento = TipoDocumento

  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(UploadFileComponent) uploadComponent: UploadFileComponent

  constructor(
    public service: HttpSharedService,
    public appGen: AppGeneralService,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ListaDocumentiComponent>,
    public report: ReportService,
    private notificate: SnackBarService,
    private documentHttp: DocumentiService,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.title = data.title
    this.objRequest = data.content

    if (this.objRequest.idPaziente) {
      this.isFromPaziente = true
      this.documentiViewsColumns = [
        'nome',
        'tipoDocumento',
        'dataPrestazione',
        'dataDocumento',
        'pulsanti',
      ]
    } else {
      this.idVisita = this.objRequest.idVisita
    }

    this.formFiltri = this.formBuilder.group({
      dataVisita: new FormControl(''),
      nomeFile: new FormControl(''),
      idTipoDocumento: new FormControl(''),
    })

    this.getListDocument()
  }

  async getListDocument() {
    const dataVisitaTmp = this.formFiltri.get('dataVisita').value
    const obj = {
      nomeFile: this.formFiltri.get('nomeFile').value,
      dataVisita: !this.appGen.isNullOrUndefined(dataVisitaTmp)
        ? this.appGen.convertToLocaleDate(dataVisitaTmp)
        : '',
      idPaziente: this.objRequest.idPaziente,
      idVisita: this.objRequest.idVisita,
      idTipoDocumento: this.formFiltri.get('idTipoDocumento').value,
    }

    const res = await this.service.postCallRequest({
      action: 'getlistdocumenti',
      param: obj,
    })
    this.documentiDataSource = new MatTableDataSource<any>()
    this.documentiDataSource.data = res
    this.documentiDataSource.paginator = this.paginator
  }

  ngOnInit() {
    this.getListaTipiDocumenti()
  }

  onNoClick(): void {
    sessionStorage.removeItem('idVisitaParam')
    this.dialogRef.close()
  }

  async getListaTipiDocumenti() {
    const obj = {
      ListaTipiDocumento: null,
    }
    await this.service
      .postCallRequest({ action: 'tipidocumenti', param: obj })
      .then((data) => {
        this.listaTipiDocumento = data
      })
  }

  async downloadFile(documento) {
    let exist = false
    if (!this.appGen.isNullOrUndefined(documento.idDocumento)) {
      exist = await firstValueFrom(
        this.documentHttp.checkFileExist(documento.idDocumento)
      )
      if (exist) {
        const obj = {
          idVisita: documento.idVisita,
          idDocumento: documento.idDocumento,
          idTipoDocumento: documento.typeDoc,
        }

        await this.service.GetFileName(obj).then((data) => {
          this.service.downloadFile(data, documento.name)
        })
      } else {
        this.appGen.notificate.error('File non trovato')
      }
    } else {
      this.appGen.notificate.error(
        "ID Documento non trovato, contatta l'assistenza Linfa"
      )
    }
  }

  async downloadFileSelected() {
    const files = []
    for await (const item of this.selection.selected) {
      const obj = {
        idDocumento: item.idDocumento,
        idVisita: item.idVisita,
        idPaziente: this.appGen.isNullOrUndefined(item.idPaziente) ? '' : item.idPaziente,
        idTipoDocumento: item.typeDoc,
      }
      files.push(obj)
    }
    if (files.length <= 0) {
      this.notificate.error('Nessun documento selezionato, riprovare')
      return
    }

    const params = {
      files,
      idVisita: this.idVisita,
    }
    await this.service.downloadFileSelected(params);
  }

  async deletedocument(documento) {
    const dialogData = new ConfirmDialogModel(
      'Attenzione!',
      'Sei sicuro di voler procedere?'
    )
    const dialogRef = this.appGen.dialog.open(ModalConfirmComponent, {
      data: dialogData,
      panelClass: 'modal-custom',
    })
    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        this.service
          .putCallRequest({ action: 'deletedocument', param: documento.idDocumento })
          .then(() => {
            this.getListDocument()
          })
      }
    })
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length
    const numRows = this.documentiDataSource.data.length
    return numSelected === numRows
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.documentiDataSource.data.forEach((row) => this.selection.select(row))
  }

  search() {
    this.getListDocument()
  }

  clearSearch() {
    this.formFiltri.get('dataVisita').setValue('')
    this.formFiltri.get('nomeFile').setValue('')
    this.formFiltri.get('idTipoDocumento').setValue('')
    this.getListDocument()
  }

  uploadDone() {
    this.isUploadFile = !this.isUploadFile
    this.getListDocument()
  }

  uploadFile() {
    this.isUploadFile = !this.isUploadFile
    if (this.isUploadFile) {
      const obj = {
        idVisita: this.objRequest.idVisita,
      }
      sessionStorage.setItem('idVisitaParam', JSON.stringify(obj))
    }

    this.idVisita = this.objRequest.idVisita
  }

  onSubmit() {
    this.uploadComponent.onSubmit()
  }
}

export class ListaDocumentiDialogModel {
  constructor(public title: string, public content) {}
}

export class fileDownload {
  idVisita: string
  idPaziente: string
  idDocumento: number
  idTipoDocumento: number
}
