import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JOSMLinkComponent } from './josmlink.component';

describe('JSOMLinkComponent', () => {
  let component: JOSMLinkComponent;
  let fixture: ComponentFixture<JOSMLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JOSMLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JOSMLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
