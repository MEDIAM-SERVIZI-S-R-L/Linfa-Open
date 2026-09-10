import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurazioneAnalisiComponent } from './configurazione-analisi.component';

describe('ConfigurazioneAnalisiComponent', () => {
  let component: ConfigurazioneAnalisiComponent;
  let fixture: ComponentFixture<ConfigurazioneAnalisiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigurazioneAnalisiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurazioneAnalisiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
