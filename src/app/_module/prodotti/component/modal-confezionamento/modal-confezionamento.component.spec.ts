import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalConfezionamentoComponent } from './modal-confezionamento.component';

describe('ModalConfezionamentoComponent', () => {
  let component: ModalConfezionamentoComponent;
  let fixture: ComponentFixture<ModalConfezionamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalConfezionamentoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalConfezionamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
