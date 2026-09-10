/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MustComponent } from './must.component';

describe('MustComponent', () => {
  let component: MustComponent;
  let fixture: ComponentFixture<MustComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MustComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MustComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
