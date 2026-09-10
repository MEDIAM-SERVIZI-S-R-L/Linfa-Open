import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalConfezionamentoGaraComponent } from './modal-confezionamento-gara.component';

describe('ModalConfezionamentoGaraComponent', () => {
  let component: ModalConfezionamentoGaraComponent;
  let fixture: ComponentFixture<ModalConfezionamentoGaraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalConfezionamentoGaraComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalConfezionamentoGaraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
