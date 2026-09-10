import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestioneConfigurazioniComponent } from './gestione-configurazioni.component';

describe('GestioneConfigurazioniComponent', () => {
  let component: GestioneConfigurazioniComponent;
  let fixture: ComponentFixture<GestioneConfigurazioniComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestioneConfigurazioniComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GestioneConfigurazioniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
