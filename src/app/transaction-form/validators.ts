import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static ageValidator(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const birthDate = new Date(control.value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= minAge ? null : { ageInvalid: true };
    };
  }

  static phoneValidator(): ValidatorFn {
    const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    return (control: AbstractControl): ValidationErrors | null =>
      phoneRegex.test(control.value) ? null : { phoneInvalid: true };
  }

  static passportValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null =>
      /^[A-Z0-9]{4} [A-Z0-9]{6}$/.test(control.value)
        ? null
        : { passportInvalid: true };
  }
}
