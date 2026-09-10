import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaConclusioniPredefiniteComponent } from './lista-conclusioni-predefinite.component';

describe('ListaConclusioniPredefiniteComponent', () => {
  let component: ListaConclusioniPredefiniteComponent;
  let fixture: ComponentFixture<ListaConclusioniPredefiniteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListaConclusioniPredefiniteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaConclusioniPredefiniteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
