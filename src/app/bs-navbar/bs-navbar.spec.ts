import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BsNavbar } from './bs-navbar';

describe('BsNavbar', () => {
  let component: BsNavbar;
  let fixture: ComponentFixture<BsNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BsNavbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BsNavbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
