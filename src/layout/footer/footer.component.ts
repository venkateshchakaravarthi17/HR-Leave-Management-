import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="main-footer text-center">
      <strong>Copyright © 2025</strong> All rights reserved.
    </footer>
  `
})
export class FooterComponent {}
