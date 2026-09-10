import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaOspedaliComponent } from './lista-ospedali.component';

describe('ListaOspedaliComponent', () => {
  let component: ListaOspedaliComponent;
  let fixture: ComponentFixture<ListaOspedaliComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListaOspedaliComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaOspedaliComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
