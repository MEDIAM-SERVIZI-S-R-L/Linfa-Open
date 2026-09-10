import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  @Input() data: any;
  @Output() closeMenu = new EventEmitter<any>();

  Environment = environment
  constructor(
    public appGen: AppGeneralService,
    public authGuard: AuthGuard
  ) { }


  closeMenuOnClick() {
    this.closeMenu.emit();
  }

  openStatistiche(): void {
    // window.open(dataURL);
    // window.open('app/statistiche', '_blank');
    // window.open('https://metabase-test-linfa.herokuapp.com/public/dashboard/1a17f643-527d-406d-9c57-3dc81d0b62c8', '_blank');
    window.open('http://metabase-test-linfa.herokuapp.com/public/dashboard/0bd0ffd4-6a7c-48a9-a8c2-423ee98c3e25', '_blank');


  }
}
