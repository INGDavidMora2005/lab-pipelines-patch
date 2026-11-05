import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';

describe('rutas de la aplicación', () => {
  let harness: RouterTestingHarness;

  const heading = () =>
    harness.routeNativeElement?.querySelector('h1')?.textContent?.trim();

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });

    harness = await RouterTestingHarness.create();
  });

  it('debe renderizar Inicio en la ruta raíz', async () => {
    await harness.navigateByUrl('/');

    expect(heading()).toContain('Bienvenido a DevHub');
  });

  it('debe renderizar Inicio en /inicio', async () => {
    await harness.navigateByUrl('/inicio');

    expect(heading()).toContain('Bienvenido a DevHub');
  });

  it('debe renderizar Proyectos en /proyectos', async () => {
    await harness.navigateByUrl('/proyectos');

    expect(heading()).toBe('Proyectos');
  });

  it('debe renderizar Contacto en /contacto', async () => {
    await harness.navigateByUrl('/contacto');

    expect(
      harness.routeNativeElement?.querySelector('h2')?.textContent?.trim(),
    ).toBe('Contacto');
  });

  it('debe redirigir una ruta desconocida a Inicio', async () => {
    await harness.navigateByUrl('/ruta-inexistente');

    expect(heading()).toContain('Bienvenido a DevHub');
  });
});
