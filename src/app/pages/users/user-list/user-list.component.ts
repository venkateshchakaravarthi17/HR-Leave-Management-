import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { User } from '../user.model';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  users: User[] = [];

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit(): void {
    this.users = this.userService.getUsers();

    // Optional: use this if you want live updates
    this.userService.users$.subscribe(users => {
      this.users = users;
    });
  }

  addUser() {
    this.router.navigate(['/users/add']);
  }

  viewUser(id: number) {
    this.router.navigate(['/users/view', id]);
  }

  editUser(id: number) {
    this.router.navigate(['/users/edit', id]);
  }

  deleteUser(id: number) {
    this.users = this.users.filter(u => u.id !== id);
  }
}
