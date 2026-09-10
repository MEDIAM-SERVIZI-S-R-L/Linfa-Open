import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportDatiComponent } from './import-dati.component';

describe('ImportDatiComponent', () => {
  let component: ImportDatiComponent;
  let fixture: ComponentFixture<ImportDatiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportDatiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportDatiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
