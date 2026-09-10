/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ConcludiVisitaComponent } from './concludi-visita.component';

describe('ConcludiVisitaComponent', () => {
  let component: ConcludiVisitaComponent;
  let fixture: ComponentFixture<ConcludiVisitaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConcludiVisitaComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConcludiVisitaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
