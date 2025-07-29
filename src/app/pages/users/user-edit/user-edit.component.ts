import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../user.service';
import { User } from '../user.model';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
})
export class UserEditComponent implements OnInit {
  userId: number | null = null;
  user: User = {
    id: 0,
    firstName: '',
    lastName: '',
    department: '',
    email: '',
    country: '',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    const foundUser = this.userService.getUsers().find(u => u.id === this.userId);
    if (foundUser) {
      this.user = { ...foundUser }; // create a copy to edit
    } else {
      alert('User not found');
      this.router.navigate(['/users/list']);
    }
  }

  saveUser() {
    this.userService.updateUser(this.user);
    alert('User details updated!');
    this.router.navigate(['/users/list']);
  }

  cancelEdit() {
    this.router.navigate(['/users/list']);
  }
}
