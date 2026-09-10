/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FormAnamnesiFisiologicaComponent } from './form-anamnesi-fisiologica.component';

describe('FormAnamnesiFisiologicaComponent', () => {
  let component: FormAnamnesiFisiologicaComponent;
  let fixture: ComponentFixture<FormAnamnesiFisiologicaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FormAnamnesiFisiologicaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormAnamnesiFisiologicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
