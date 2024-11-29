import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FtpConnectionComponent } from './ftp-connection.component';

describe('FtpConnectionComponent', () => {
  let component: FtpConnectionComponent;
  let fixture: ComponentFixture<FtpConnectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FtpConnectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FtpConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
