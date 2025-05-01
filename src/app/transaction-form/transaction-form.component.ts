import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';
import { CustomValidators } from './validators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
  ],
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.css'],
})
export class TransactionFormComponent {
  // список стран (20 популярных + СНГ)
  countries = [
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'France',
    'Italy',
    'Spain',
    'Japan',
    'China',
    'India',
    'Brazil',
    'Mexico',
    'South Korea',
    'Indonesia',
    'Russia',
    'Ukraine',
    'Belarus',
    'Kazakhstan',
    'Uzbekistan',
  ];

  transactionTypes = ['Перевод', 'Оплата', 'Пополнение'];
  currenciesList = ['RUB', 'USD', 'EUR'];

  form = this.fb.group({
    client: this.fb.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[^\d]+$/),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[^\d]+$/),
        ],
      ],
      middleName: [
        '',
        [
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[^\d]+$/),
        ],
      ],
      gender: ['', Validators.required],
      birthDate: ['', [Validators.required, CustomValidators.ageValidator(18)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [
        '+7 ',
        [
          Validators.required,
          Validators.pattern(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/),
        ],
      ],
      passport: [
        '',
        [Validators.required, CustomValidators.passportValidator()],
      ],
    }),
    address: this.fb.group({
      country: ['', Validators.required],
      region: ['', [Validators.required, Validators.minLength(3)]],
      city: ['', [Validators.required, Validators.minLength(3)]],
      street: ['', [Validators.required, Validators.minLength(3)]],
      house: ['', Validators.required],
      apartment: ['', Validators.pattern(/^\d*$/)],
      postalCode: [
        '',
        [
          Validators.required,
          CustomValidators.numericValidator(),
          Validators.pattern(/^\d{6}$/),
        ],
      ],
    }),
    bankDetails: this.fb.group({
      accountNumber: [
        '',
        [Validators.required, Validators.pattern(/^\d{20}$/)],
      ],
      bic: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      bankName: ['', [Validators.required, Validators.minLength(3)]],
      correspondentAccount: [
        '',
        [Validators.required, Validators.pattern(/^\d{20}$/)],
      ],
    }),
    transaction: this.fb.group({
      type: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      currency: ['', Validators.required],
      comment: ['', Validators.maxLength(200)],
    }),
    documents: this.fb.array([]),
  });

  constructor(private fb: FormBuilder) {}

  get documents(): FormArray {
    return this.form.get('documents') as FormArray;
  }

  addDocument(): void {
    const doc = this.fb.group({
      type: ['', Validators.required],
      number: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      issueDate: ['', Validators.required],
      file: new FormControl<File | null>(null),
    });
    this.documents.push(doc);
  }

  removeDocument(index: number): void {
    this.documents.removeAt(index);
  }

  onFileChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;
    this.documents.at(index).get('file')!.setValue(file);
  }

  submit(): void {
    if (this.form.valid) {
      const value = this.form.value;
      const client = value.client!;
      const fullPhone = client.phone!;
      console.log({ ...value, client: { ...client, phone: fullPhone } });
    } else {
      this.form.markAllAsTouched();
    }
  }

  reset(): void {
    this.form.reset();
    this.form.markAsUntouched();
    this.form.markAsPristine();
    this.documents.clear();
  }

  // для кастомных dropdown
  showGender = false;
  showType = false;
  showCurrency = false;

  toggleGender() {
    this.showType = false;
    this.showCurrency = false;
    this.showGender = !this.showGender;
  }
  selectGender(value: string) {
    this.form.get('client.gender')!.setValue(value);
    this.showGender = false;
  }

  toggleType() {
    this.showGender = false;
    this.showCurrency = false;
    this.showType = !this.showType;
  }
  selectType(value: string) {
    this.form.get('transaction.type')!.setValue(value);
    this.showType = false;
  }

  toggleCurrency() {
    this.showGender = false;
    this.showType = false;
    this.showCurrency = !this.showCurrency;
  }
  selectCurrency(value: string) {
    this.form.get('transaction.currency')!.setValue(value);
    this.showCurrency = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.showGender = false;
      this.showType = false;
      this.showCurrency = false;
    }
  }

  autoResize(event: Event): void {
    const ta = event.target as HTMLTextAreaElement;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }

  // форматирование ввода паспорта: XXXX XXXXXX (цифры или A–Z)
  onPassportInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let chars = input.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 10);
    let formatted =
      chars.length > 4 ? chars.slice(0, 4) + ' ' + chars.slice(4) : chars;
    input.value = formatted;
    this.form.get('client.passport')!.setValue(formatted, { emitEvent: false });
  }

  // форматируем ввод телефона: +7 (XXX) XXX-XX-XX, без лишних семёрок
  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let raw = input.value.replace(/\D/g, '');
    // если пользователь случайно вводит ведущую 7 – убираем её
    if (raw.startsWith('7')) {
      raw = raw.slice(1);
    }
    const digits = raw.slice(0, 10);
    // всегда начинаем с "+7 "
    let formatted = '+7 ';
    if (digits.length > 0) {
      formatted += '(' + digits.substring(0, 3);
    }
    if (digits.length >= 3) {
      formatted += ') ' + digits.substring(3, 6);
    }
    if (digits.length >= 6) {
      formatted += '-' + digits.substring(6, 8);
    }
    if (digits.length >= 8) {
      formatted += '-' + digits.substring(8, 10);
    }
    input.value = formatted;
    this.form.get('client.phone')!.setValue(formatted, { emitEvent: false });
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const char = event.key;
    if (!/^\d$/.test(char)) {
      event.preventDefault();
    }
  }

  noMinus(event: KeyboardEvent): void {
    if (event.key === '-') {
      event.preventDefault();
    }
  }

  clientFields = [
    { name: 'firstName', label: 'First Name', type: 'input' },
    { name: 'lastName', label: 'Last Name', type: 'input' },
    { name: 'middleName', label: 'Middle Name', type: 'input' },
    {
      name: 'gender',
      label: 'Gender',
      type: 'select',
      options: ['Male', 'Female'],
    },
    { name: 'birthDate', label: 'Birth Date', type: 'input' },
    { name: 'email', label: 'Email', type: 'input' },
    { name: 'phone', label: 'Phone', type: 'input' },
    { name: 'passport', label: 'Passport', type: 'input' },
  ];

  // аналогично addressFields, bankFields и т.д.
}
