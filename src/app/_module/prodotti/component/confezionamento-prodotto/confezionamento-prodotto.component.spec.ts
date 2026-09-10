import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfezionamentoProdottoComponent } from './confezionamento-prodotto.component';

describe('ConfezionamentoProdottoComponent', () => {
  let component: ConfezionamentoProdottoComponent;
  let fixture: ComponentFixture<ConfezionamentoProdottoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfezionamentoProdottoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfezionamentoProdottoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
