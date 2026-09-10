import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalProprietaComponent } from './modal-proprieta.component';

describe('ModalProprietaComponent', () => {
  let component: ModalProprietaComponent;
  let fixture: ComponentFixture<ModalProprietaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalProprietaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalProprietaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
