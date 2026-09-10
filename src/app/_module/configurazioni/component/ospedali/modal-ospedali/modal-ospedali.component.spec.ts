import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOspedaliComponent } from './modal-ospedali.component';

describe('ModalOspedaliComponent', () => {
  let component: ModalOspedaliComponent;
  let fixture: ComponentFixture<ModalOspedaliComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalOspedaliComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalOspedaliComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
