/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PageRouteComponent } from './page-route.component';

describe('PageRouteComponent', () => {
  let component: PageRouteComponent;
  let fixture: ComponentFixture<PageRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
