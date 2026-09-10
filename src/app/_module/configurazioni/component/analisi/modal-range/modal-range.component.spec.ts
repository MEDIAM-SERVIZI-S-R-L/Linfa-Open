import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRangeComponent } from './modal-range.component';

describe('ModalRangeComponent', () => {
  let component: ModalRangeComponent;
  let fixture: ComponentFixture<ModalRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalRangeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
