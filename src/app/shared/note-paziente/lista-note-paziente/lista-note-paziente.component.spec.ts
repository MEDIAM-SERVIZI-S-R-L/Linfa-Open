/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ListaNotePazienteComponent } from './lista-note-paziente.component';

describe('ListaNotePazienteComponent', () => {
  let component: ListaNotePazienteComponent;
  let fixture: ComponentFixture<ListaNotePazienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListaNotePazienteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaNotePazienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
