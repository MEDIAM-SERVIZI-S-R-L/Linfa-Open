import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociazioneEntiComponent } from './associazione-enti.component';

describe('AssociazioneEntiComponent', () => {
  let component: AssociazioneEntiComponent;
  let fixture: ComponentFixture<AssociazioneEntiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssociazioneEntiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociazioneEntiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
