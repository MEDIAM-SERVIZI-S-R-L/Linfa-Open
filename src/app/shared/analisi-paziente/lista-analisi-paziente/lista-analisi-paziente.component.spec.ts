import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaAnalisiPazienteComponent } from './lista-analisi-paziente.component';

describe('ListaAnalisiPazienteComponent', () => {
  let component: ListaAnalisiPazienteComponent;
  let fixture: ComponentFixture<ListaAnalisiPazienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListaAnalisiPazienteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaAnalisiPazienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
