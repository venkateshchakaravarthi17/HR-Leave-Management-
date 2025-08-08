
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-ckeditor',
  standalone: true,
  imports: [CommonModule, FormsModule, CKEditorModule],
  template: `
    <ckeditor
      [editor]="Editor"
      [(ngModel)]="data"
      (change)="onChange()">
    </ckeditor>
  `
})
export class CkeditorComponent {
  public Editor: any = ClassicEditor;

  @Input() data = '';
  @Output() dataChange = new EventEmitter<string>();

  onChange() {
    this.dataChange.emit(this.data);
  }
}
