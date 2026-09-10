import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewFormDietaComponent } from './new-form-dieta.component';

describe('NewFormDietaComponent', () => {
  let component: NewFormDietaComponent;
  let fixture: ComponentFixture<NewFormDietaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewFormDietaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewFormDietaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
