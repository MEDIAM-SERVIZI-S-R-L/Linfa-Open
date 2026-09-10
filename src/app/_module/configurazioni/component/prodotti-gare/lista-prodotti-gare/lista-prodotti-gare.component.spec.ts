/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ListaProdottiGareComponent } from './lista-prodotti-gare.component';

describe('ListaProdottiGareComponent', () => {
  let component: ListaProdottiGareComponent;
  let fixture: ComponentFixture<ListaProdottiGareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListaProdottiGareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaProdottiGareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
