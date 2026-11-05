import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Contacto } from './contacto';

describe('Contacto', () => {
  let component: Contacto;
  let fixture: ComponentFixture<Contacto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contacto],
    }).compileComponents();

    fixture = TestBed.createComponent(Contacto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the "Contacto" heading', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h2')?.textContent?.trim()).toBe('Contacto');
  });

  it('should not show the confirmation before submitting', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('Mensaje enviado');
  });

  it('should show "Mensaje enviado" after submitting the form', () => {
    const el = fixture.nativeElement as HTMLElement;
    const form = el.querySelector('form') as HTMLFormElement;

    form.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();

    const ok = el.querySelector('.tag');
    expect(ok?.textContent?.trim()).toBe('Mensaje enviado');
  });
});
