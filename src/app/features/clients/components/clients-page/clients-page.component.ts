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
  filteredUsers: UserDTO[] = [];
  loading = true;
  showForm = false;
  editing = false;
  editId: number | null = null;
  submitting = false;
  form: FormGroup;

  // Deletion
  showDeleteModal = false;
  deleteIdInput = '';
  confirmDeleteIdInput = '';
  deleteWordInput = '';
  deleting = false;

  // Search
  searchId = '';

  // Sorting
  sortColumn: keyof UserDTO = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';

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
      role: ['USER', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.applyFilterAndSort();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  // ──── Search & Sort ────

  onSearchId(): void {
    this.applyFilterAndSort();
  }

  toggleSort(column: keyof UserDTO): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilterAndSort();
  }

  getSortIcon(column: keyof UserDTO): string {
    if (this.sortColumn !== column) return '↕';
    return this.sortDirection === 'asc' ? '▲' : '▼';
  }

  private applyFilterAndSort(): void {
    let result = [...this.users];

    // Filter by ID
    if (this.searchId.trim()) {
      const term = this.searchId.trim();
      result = result.filter(u => u.id.toString().includes(term));
    }

    // Sort
    result.sort((a, b) => {
      const valA = a[this.sortColumn];
      const valB = b[this.sortColumn];
      let cmp: number;
      if (typeof valA === 'number' && typeof valB === 'number') {
        cmp = valA - valB;
      } else if (typeof valA === 'boolean' && typeof valB === 'boolean') {
        cmp = (valA === valB) ? 0 : valA ? -1 : 1;
      } else {
        cmp = String(valA ?? '').localeCompare(String(valB ?? ''));
      }
      return this.sortDirection === 'asc' ? cmp : -cmp;
    });

    this.filteredUsers = result;
  }

  // ──── Form ────

  openCreate(): void {
    this.editing = false;
    this.editId = null;
    this.form.reset({ role: 'USER', isActive: true });
    this.form.get('email')?.setValidators([Validators.required, Validators.email]);
    this.form.get('email')?.updateValueAndValidity();
    this.form.get('password')?.setValidators(Validators.required);
    this.form.get('password')?.updateValueAndValidity();
    this.form.get('phoneNumber')?.setValidators(Validators.required);
    this.form.get('phoneNumber')?.updateValueAndValidity();
    this.showForm = true;
  }

  openEdit(user: UserDTO): void {
    this.editing = true;
    this.editId = user.id;
    this.form.patchValue(user);
    this.form.get('email')?.clearValidators();
    this.form.get('email')?.updateValueAndValidity();
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    // Phone is optional when editing
    this.form.get('phoneNumber')?.clearValidators();
    this.form.get('phoneNumber')?.updateValueAndValidity();
    this.showForm = true;
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting = true;

    if (this.editing && this.editId) {
      const { email, ...rest } = this.form.value;
      const payload: UserDTO = {
        ...rest,
        id: this.editId,
        email: '',
        phoneNumber: this.form.value.phoneNumber || ''
      };
      this.userService.updateUser(this.editId, payload).subscribe({
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
    this.form.reset({ role: 'USER', isActive: true });
  }

  // ──── Cascade Delete ────

  openDeleteModal(): void {
    this.showDeleteModal = true;
    this.deleteIdInput = '';
    this.confirmDeleteIdInput = '';
    this.deleteWordInput = '';
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteIdInput = '';
    this.confirmDeleteIdInput = '';
    this.deleteWordInput = '';
    this.deleting = false;
  }

  get isDeleteValid(): boolean {
    return !!this.deleteIdInput &&
           this.deleteIdInput === this.confirmDeleteIdInput &&
           this.deleteWordInput.toLowerCase() === 'eliminar';
  }

  onCascadeDelete(): void {
    if (!this.isDeleteValid) return;

    this.deleting = true;
    const idToDelete = Number(this.deleteIdInput);

    this.userService.cascadeDeleteUser(idToDelete).subscribe({
      next: () => {
        this.notify.success('Usuario eliminado exitosamente y sus datos asociados depurados.');
        this.closeDeleteModal();
        this.loadUsers();
      },
      error: (err) => {
        this.deleting = false;
        this.notify.error(err.error?.message || 'Error al eliminar el usuario.');
      }
    });
  }
}
