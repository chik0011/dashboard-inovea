import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricsTickets } from './metrics-tickets';

describe('MetricsTickets', () => {
  let component: MetricsTickets;
  let fixture: ComponentFixture<MetricsTickets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricsTickets]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetricsTickets);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
