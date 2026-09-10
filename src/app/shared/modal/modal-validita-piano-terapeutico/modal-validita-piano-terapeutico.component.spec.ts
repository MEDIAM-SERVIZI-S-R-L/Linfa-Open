/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ModalValiditaPianoTerapeuticoComponent } from './modal-validita-piano-terapeutico.component';

describe('ModalValiditaPianoTerapeuticoComponent', () => {
  let component: ModalValiditaPianoTerapeuticoComponent;
  let fixture: ComponentFixture<ModalValiditaPianoTerapeuticoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalValiditaPianoTerapeuticoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalValiditaPianoTerapeuticoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
