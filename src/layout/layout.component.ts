import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { FooterComponent } from "./footer/footer.component";
import { AfterViewInit, Component } from "@angular/core";
import { initAdminLTEWidgets } from "../adminlte-init";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent, FooterComponent],
  templateUrl: './layout.component.html'
})
export class LayoutComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    initAdminLTEWidgets();
  }
}
