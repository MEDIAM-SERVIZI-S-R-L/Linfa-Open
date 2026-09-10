import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalStoricoInviiComponent } from './modal-storico-invii.component';

describe('ModalStoricoInviiComponent', () => {
  let component: ModalStoricoInviiComponent;
  let fixture: ComponentFixture<ModalStoricoInviiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalStoricoInviiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalStoricoInviiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
