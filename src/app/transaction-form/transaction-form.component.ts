import {
  Component,
  HostListener,
  ViewChild,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
  AbstractControl,
  FormGroup,
  FormGroupDirective,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  @Input() formGroup?: FormGroup;
  @Output() formSubmit = new EventEmitter<any>();
  @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;
  @ViewChild('commentArea') commentArea!: ElementRef<HTMLTextAreaElement>;

  // внутренняя форма
  private internalForm = this.fb.group({
    client: this.fb.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          CustomValidators.lettersValidator(),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          CustomValidators.lettersValidator(),
        ],
      ],
      middleName: [
        '',
        [
          Validators.minLength(2),
          Validators.maxLength(50),
          CustomValidators.lettersValidator(),
        ],
      ],
      gender: ['', Validators.required],
      birthDate: ['', [Validators.required, CustomValidators.ageValidator(18)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['+7 ', [Validators.required, CustomValidators.phoneValidator()]],
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
      apartment: ['', CustomValidators.numericValidator()],
      postalCode: [
        '',
        [
          Validators.required,
          CustomValidators.numericValidator(),
          CustomValidators.digitsLength(6),
        ],
      ],
    }),
    bankDetails: this.fb.group({
      accountNumber: [
        '',
        [Validators.required, CustomValidators.digitsLength(20)],
      ],
      bic: ['', [Validators.required, CustomValidators.digitsLength(9)]],
      bankName: ['', [Validators.required, Validators.minLength(3)]],
      correspondentAccount: [
        '',
        [Validators.required, CustomValidators.digitsLength(20)],
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

  // выбираем реальную форму: внешнюю или внутреннюю
  get form(): FormGroup {
    return this.formGroup ?? this.internalForm;
  }

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

  transactionTypes = ['Transfer', 'Payment', 'Deposit'];
  currenciesList = ['RUB', 'USD', 'EUR'];

  constructor(private fb: FormBuilder) {}

  get documents(): FormArray {
    return this.form.get('documents') as FormArray;
  }

  addDocument(): void {
    const doc = this.fb.group({
      type: ['', Validators.required],
      number: ['', [Validators.required, CustomValidators.numericValidator()]],
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
      const v = this.form.value!;
      const client = v.client!;
      const addr = v.address!;
      const bank = v.bankDetails!;
      const tr = v.transaction!;
      const out = {
        clientInfo: {
          firstName: client.firstName!,
          lastName: client.lastName!,
          middleName: client.middleName || undefined,
          gender: client.gender!.toLowerCase() as 'male' | 'female',
          birthDate: new Date(client.birthDate!),
          email: client.email!,
          phone: client.phone!,
          passport: client.passport!,
        },
        address: {
          country: addr.country!,
          region: addr.region!,
          city: addr.city!,
          street: addr.street!,
          house: addr.house!,
          apartment: addr.apartment || undefined,
          postalCode: addr.postalCode!,
        },
        bankDetails: {
          accountNumber: bank.accountNumber!,
          bic: bank.bic!,
          bankName: bank.bankName!,
          correspondentAccount: bank.correspondentAccount!,
        },
        transactionInfo: {
          transactionType: (tr.type! === 'Deposit'
            ? 'replenishment'
            : tr.type!.toLowerCase()) as
            | 'transfer'
            | 'payment'
            | 'replenishment',
          amount: tr.amount!,
          currency: tr.currency! as 'RUB' | 'USD' | 'EUR',
          comment: tr.comment || undefined,
        },
        documents: this.documents.controls.map((ctrl) => {
          const d = ctrl.value;
          return {
            documentType: (d.type as string).toLowerCase() as
              | 'passport'
              | 'snils'
              | 'inn',
            documentNumber: d.number,
            issueDate: new Date(d.issueDate),
            file: d.file as File | null,
          };
        }),
      };
      console.log(out);
      this.formSubmit.emit(out);
      this.reset();
    } else {
      this.form.markAllAsTouched();
    }
  }

  reset(): void {
    this.formDirective.resetForm();
    this.documents.clear();
    this.form.get('client.phone')!.setValue('+7 ');
    this.form.get('client.phone')!.markAsPristine();
    this.form.get('client.phone')!.markAsUntouched();
    if (this.commentArea) {
      this.commentArea.nativeElement.style.height = '40px';
    }
  }

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

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let raw = input.value.replace(/\D/g, '');
    if (raw.startsWith('7')) {
      raw = raw.slice(1);
    }
    const digits = raw.slice(0, 10);
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
}
