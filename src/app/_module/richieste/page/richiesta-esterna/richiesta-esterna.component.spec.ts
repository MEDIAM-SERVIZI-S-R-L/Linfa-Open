import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RichiestaEsternaComponent } from './richiesta-esterna.component';

describe('RichiestaEsternaComponent', () => {
  let component: RichiestaEsternaComponent;
  let fixture: ComponentFixture<RichiestaEsternaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RichiestaEsternaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RichiestaEsternaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
