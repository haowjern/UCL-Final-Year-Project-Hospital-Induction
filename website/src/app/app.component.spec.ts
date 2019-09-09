import { TestBed, async, ComponentFixture, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { Routes, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  template: ''
})
class MockDashboardComponent {}

@Component({
  template: ''
})
class MockAnchorsComponent {}

@Component({
  template: ''
})
class MockAssetsComponent {}

@Component({
  template: ''
})
class MockMapsComponent {}

@Component({
  template: ''
})
class MockScenariosComponent {}

@Component({
  template: ''
})
class MockUsersComponent {}

const ROUTES: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: MockDashboardComponent },
  { path: 'anchors', component: MockAnchorsComponent },
  { path: 'assets', component: MockAssetsComponent },
  { path: 'maps', component: MockMapsComponent },
  { path: 'scenarios', component: MockScenariosComponent },
  { path: 'users', component: MockUsersComponent }
];


describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;
  let routerSpy: jasmine.Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(ROUTES),
        MatSidenavModule,
        MatToolbarModule,
        MatListModule,
        MatDividerModule,
        BrowserAnimationsModule
      ],
      declarations: [
        AppComponent,
        MockDashboardComponent,
        MockAnchorsComponent,
        MockAssetsComponent,
        MockMapsComponent,
        MockScenariosComponent,
        MockUsersComponent
      ]
    }).compileComponents();
  }));


  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.debugElement.componentInstance;
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
  });


  it('should create the app component', () => {
    expect(app).toBeTruthy();
  });

  it(`app.component should contain title 'Editor'`, () => {
    expect(app.title).toContain('Editor');
  });

  it('should tell Anchors to navigate on click to /anchors',
    async(inject([Router, Location], (router: Router, location: Location) => {
    fixture.detectChanges();
    fixture.nativeElement.querySelector('#Anchors').click();
    fixture.whenStable().then(() => {
      expect(location.path()).toEqual('/anchors');
    });
  })));

  it('should tell Dashboard to navigate on click to /dashboard',
    async(inject([Router, Location], (router: Router, location: Location) => {
    fixture.detectChanges();
    fixture.nativeElement.querySelector('#Dashboard').click();
    fixture.whenStable().then(() => {
      expect(location.path()).toEqual('/dashboard');
    });
  })));

  it('should tell Assets to navigate on click to /assets',
    async(inject([Router, Location], (router: Router, location: Location) => {
    fixture.detectChanges();
    fixture.nativeElement.querySelector('#Assets').click();
    fixture.whenStable().then(() => {
      expect(location.path()).toEqual('/assets');
    });
  })));

  it('should tell Maps to navigate on click to /maps',
    async(inject([Router, Location], (router: Router, location: Location) => {
    fixture.detectChanges();
    fixture.nativeElement.querySelector('#Maps').click();
    fixture.whenStable().then(() => {
      expect(location.path()).toEqual('/maps');
    });
  })));

  it('should tell Scenarios to navigate on click to /scenarios',
    async(inject([Router, Location], (router: Router, location: Location) => {
    fixture.detectChanges();
    fixture.nativeElement.querySelector('#Scenarios').click();
    fixture.whenStable().then(() => {
      expect(location.path()).toEqual('/scenarios');
    });
  })));

  it('should tell Users to navigate on click to /users',
    async(inject([Router, Location], (router: Router, location: Location) => {
    fixture.detectChanges();
    fixture.nativeElement.querySelector('#Users').click();
    fixture.whenStable().then(() => {
      expect(location.path()).toEqual('/users');
    });
  })));

});
