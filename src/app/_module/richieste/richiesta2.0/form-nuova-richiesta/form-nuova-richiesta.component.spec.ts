import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormNuovaRichiestaComponent } from './form-nuova-richiesta.component';

describe('FormNuovaRichiestaComponent', () => {
  let component: FormNuovaRichiestaComponent;
  let fixture: ComponentFixture<FormNuovaRichiestaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormNuovaRichiestaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormNuovaRichiestaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
