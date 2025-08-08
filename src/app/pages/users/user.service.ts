import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from './user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private users: User[] = [
    { id: 1, firstName: 'Venkatesh', lastName: 'Chakaravarthi', department: 'ECE', email: 'venkatesh@gmail.com', country: 'India' },
    { id: 2, firstName: 'Vishnu', lastName: 'Kumar', department: 'IT', email: 'vishnu@gmail.com', country: 'Japan' },
    { id: 3, firstName: 'Dhivya', lastName: 'Bharathi', department: 'CSE', email: 'Dhivya@gmail.com', country: 'USA' },
    { id: 4, firstName: 'Swapna', lastName: 'Pushparaj', department: 'EEE', email: 'swapna@gmail.com', country: 'UK' },
    { id: 5, firstName: 'Udhaya', lastName: 'Kumar', department: 'MECH', email: 'udhaya@gmail.com', country: 'Australia' },
    { id: 6, firstName: 'Virat', lastName: 'Kohli', department: 'AE', email: 'virat@gmail.com', country: 'Canada' },
  ];

  private usersSubject = new BehaviorSubject<User[]>([...this.users]);
  users$ = this.usersSubject.asObservable();

  getUsers(): User[] {
    return [...this.users];
  }

  addUser(user: User) {
    user.id = this.generateId();
    this.users.push(user);
    this.usersSubject.next([...this.users]);
  }

  private generateId(): number {
    return this.users.length ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
  }
  updateUser(updatedUser: User) {
  const index = this.users.findIndex(u => u.id === updatedUser.id);
  if (index > -1) {
    this.users[index] = updatedUser;
    this.usersSubject.next([...this.users]);
  }
}


}
