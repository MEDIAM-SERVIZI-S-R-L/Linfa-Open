import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dispositivo-medico',
  templateUrl: './dispositivo-medico.component.html',
  styleUrls: ['./dispositivo-medico.component.scss']
})
export class DispositivoMedicoComponent {
  versionApp:any = {
    name: 'Linfa',
    description: 'test',

    first: '1',
    second: '0',
    third: '0',
    fourth: '1',
    company: 'MEDIAM SERVIZI S.R.L UNIPERSONALE',
    companyAddress: '<br/>Via de Marini, 16 <br/>Genova (GE) - 16149'
  }

  constructor(
    public dialogRef: MatDialogRef<DispositivoMedicoComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private http: HttpClient
  ) { }

  ngOnInit(){
    this.setInfoApp();
  }


  async setInfoApp(){
 const info = await firstValueFrom(this.getInfoApp());
 this.versionApp.serialnumber=info.sn || '';
 this.versionApp.version= info.version ||'';

  }


  getInfoApp():Observable<any>{

    const  apiUrl: string = environment.apiUrl + 'Linfa/'
    return this.http.get<any>(`${apiUrl}Get_Version_SN`)

  }

}
