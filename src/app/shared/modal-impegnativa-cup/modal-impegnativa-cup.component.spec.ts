import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalImpegnativaCupComponent } from './modal-impegnativa-cup.component';

describe('ModalImpegnativaCupComponent', () => {
  let component: ModalImpegnativaCupComponent;
  let fixture: ComponentFixture<ModalImpegnativaCupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalImpegnativaCupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalImpegnativaCupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
