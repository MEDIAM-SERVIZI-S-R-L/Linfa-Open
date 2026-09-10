/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FormConclusioniPredefiniteComponent } from './form-conclusioni-predefinite.component';

describe('FormConclusioniPredefiniteComponent', () => {
  let component: FormConclusioniPredefiniteComponent;
  let fixture: ComponentFixture<FormConclusioniPredefiniteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormConclusioniPredefiniteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormConclusioniPredefiniteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
