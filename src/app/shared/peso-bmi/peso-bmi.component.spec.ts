import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PesoBmiComponent } from './peso-bmi.component';

describe('PesoBmiComponent', () => {
  let component: PesoBmiComponent;
  let fixture: ComponentFixture<PesoBmiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PesoBmiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PesoBmiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
