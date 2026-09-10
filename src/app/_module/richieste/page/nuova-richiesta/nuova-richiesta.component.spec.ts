import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NuovaRichiestaComponent } from './nuova-richiesta.component';

describe('NuovaRichiestaComponent', () => {
  let component: NuovaRichiestaComponent;
  let fixture: ComponentFixture<NuovaRichiestaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NuovaRichiestaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NuovaRichiestaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
