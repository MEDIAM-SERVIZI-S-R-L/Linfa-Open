/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AnamnesiPatologicaProssimaComponent } from './anamnesi-patologica-prossima.component';

describe('AnamnesiPatologicaProssimaComponent', () => {
  let component: AnamnesiPatologicaProssimaComponent;
  let fixture: ComponentFixture<AnamnesiPatologicaProssimaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AnamnesiPatologicaProssimaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnamnesiPatologicaProssimaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
