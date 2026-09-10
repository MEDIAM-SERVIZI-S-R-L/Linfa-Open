import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InserimentoAnalisiComponent } from './inserimento-analisi.component';

describe('InserimentoAnalisiComponent', () => {
  let component: InserimentoAnalisiComponent;
  let fixture: ComponentFixture<InserimentoAnalisiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InserimentoAnalisiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InserimentoAnalisiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
