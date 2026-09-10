import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaRepartiComponent } from './lista-reparti.component';

describe('ListaRepartiComponent', () => {
  let component: ListaRepartiComponent;
  let fixture: ComponentFixture<ListaRepartiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListaRepartiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaRepartiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
