import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DettaglioAnalisiComponent } from './dettaglio-analisi.component';

describe('DettaglioAnalisiComponent', () => {
  let component: DettaglioAnalisiComponent;
  let fixture: ComponentFixture<DettaglioAnalisiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DettaglioAnalisiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DettaglioAnalisiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
