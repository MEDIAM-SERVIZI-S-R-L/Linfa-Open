/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DatiPazienteComponent } from './dati-paziente.component';

describe('DatiPazienteComponent', () => {
  let component: DatiPazienteComponent;
  let fixture: ComponentFixture<DatiPazienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatiPazienteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatiPazienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
