import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Navbar } from './navbar';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the DevHub brand', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.navbar__brand')?.textContent?.trim()).toBe('DevHub');
  });

  it('should render 3 nav links with their texts and hrefs', () => {
    const el = fixture.nativeElement as HTMLElement;
    const links = Array.from(el.querySelectorAll<HTMLAnchorElement>('.navbar__links a'));

    expect(links.length).toBe(3);
    expect(links.map((a) => a.textContent?.trim())).toEqual(['Inicio', 'Proyectos', 'Contacto']);
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/inicio',
      '/proyectos',
      '/contacto',
    ]);
  });
});
