import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormRefertoComponent } from './form-referto.component';

describe('FormRefertoComponent', () => {
  let component: FormRefertoComponent;
  let fixture: ComponentFixture<FormRefertoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormRefertoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormRefertoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
