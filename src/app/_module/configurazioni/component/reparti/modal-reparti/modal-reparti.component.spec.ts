import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRepartiComponent } from './modal-reparti.component';

describe('ModalRepartiComponent', () => {
  let component: ModalRepartiComponent;
  let fixture: ComponentFixture<ModalRepartiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalRepartiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalRepartiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
