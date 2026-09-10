import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCategoriaConfigurazioneComponent } from './modal-categoria-configurazione.component';

describe('ModalCategoriaConfigurazioneComponent', () => {
  let component: ModalCategoriaConfigurazioneComponent;
  let fixture: ComponentFixture<ModalCategoriaConfigurazioneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalCategoriaConfigurazioneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCategoriaConfigurazioneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
