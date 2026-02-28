import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../../shared/services/user.service';
import { UserDTO, CreateUserDTO } from '../../../../core/auth/models/user.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'qp-clients-page',
  standalone: false,
  templateUrl: './clients-page.component.html',
  styleUrl: './clients-page.component.scss'
})
export class ClientsPageComponent implements OnInit {
  users: UserDTO[] = [];
  loading = true;
  showForm = false;
  editing = false;
  editId: number | null = null;
  submitting = false;
  form: FormGroup;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private notify: NotificationService
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      role: ['USER', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => { this.users = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openCreate(): void {
    this.editing = false;
    this.editId = null;
    this.form.reset({ role: 'USER' });
    this.form.get('password')?.setValidators(Validators.required);
    this.form.get('password')?.updateValueAndValidity();
    this.showForm = true;
  }

  openEdit(user: UserDTO): void {
    this.editing = true;
    this.editId = user.id;
    this.form.patchValue(user);
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.showForm = true;
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting = true;

    if (this.editing && this.editId) {
      this.userService.updateUser(this.editId, { ...this.form.value, id: this.editId } as UserDTO).subscribe({
        next: () => {
          this.notify.success('Cliente actualizado');
          this.closeForm();
          this.loadUsers();
        },
        error: (err) => {
          this.submitting = false;
          this.notify.error(err.error?.message || 'Error al actualizar');
        }
      });
    } else {
      this.userService.createUser(this.form.value as CreateUserDTO).subscribe({
        next: () => {
          this.notify.success('Cliente creado');
          this.closeForm();
          this.loadUsers();
        },
        error: (err) => {
          this.submitting = false;
          this.notify.error(err.error?.message || 'Error al crear');
        }
      });
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.submitting = false;
    this.form.reset({ role: 'USER' });
  }
}

