import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaDistrettiComponent } from './lista-distretti.component';

describe('ListaDistrettiComponent', () => {
  let component: ListaDistrettiComponent;
  let fixture: ComponentFixture<ListaDistrettiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListaDistrettiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaDistrettiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
