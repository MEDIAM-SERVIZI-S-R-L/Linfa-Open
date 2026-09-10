import { Component, Input, ViewChild } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { map } from 'rxjs/operators'
import { AppGeneralService } from 'src/app/_core/services/app-general.service'

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
})
export class PdfViewerComponent {
  @Input() pdfFile
  @Input() isBase64 = false
  @Input() nomeDocumento = 'documento'
  @ViewChild('pdfViewer') public pdfViewer
  constructor(private appGen: AppGeneralService, private http: HttpClient) {}


  ngOnInit() {
    if (!this.isBase64) {
      this.creaPdf();
    }
  }


  creaPdf(){
    if (!this.appGen.isNullOrUndefined(this.pdfFile)) {
      const pdf = this.pdfFile

      if (!this.appGen.isNullOrUndefined(pdf)) {
        if (pdf instanceof Blob) {
          this.pdfFile = pdf
        } else {
          pdf.getBase64(async (file) => {

            this.pdfFile = await this.getFileFromBlob(file)
          })
        }
      }
    }
  }


  async getFileFromBlob(data) {
    const buffer = await this.appGen._base64ToArrayBuffer(data)
    const byteArray = new Uint8Array(buffer)
    const blob = new Blob([byteArray], { type: 'application/pdf' })
    return URL.createObjectURL(blob)
  }
}
