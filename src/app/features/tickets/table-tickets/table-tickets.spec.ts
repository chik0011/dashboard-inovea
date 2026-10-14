import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableTickets } from './table-tickets';

describe('TableTickets', () => {
  let component: TableTickets;
  let fixture: ComponentFixture<TableTickets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableTickets]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableTickets);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
