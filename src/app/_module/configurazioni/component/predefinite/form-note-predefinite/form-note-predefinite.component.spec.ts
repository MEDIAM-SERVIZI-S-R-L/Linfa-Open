/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FormNotePredefiniteComponent } from './form-note-predefinite.component';

describe('FormNotePredefiniteComponent', () => {
  let component: FormNotePredefiniteComponent;
  let fixture: ComponentFixture<FormNotePredefiniteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormNotePredefiniteComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormNotePredefiniteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
