import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDistrettiComponent } from './modal-distretti.component';

describe('ModalDistrettiComponent', () => {
  let component: ModalDistrettiComponent;
  let fixture: ComponentFixture<ModalDistrettiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalDistrettiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDistrettiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
