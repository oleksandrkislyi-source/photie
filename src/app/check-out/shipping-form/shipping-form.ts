import { Component, Input } from '@angular/core';

import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-shipping-form',
  imports: [ReactiveFormsModule],
  templateUrl: './shipping-form.html',
  styleUrl: './shipping-form.css'
})
export class ShippingForm {
  @Input() form!: FormGroup;
}
