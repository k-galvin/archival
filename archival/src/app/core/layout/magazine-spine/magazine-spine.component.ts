import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-magazine-spine',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './magazine-spine.component.html',
  styleUrl: './magazine-spine.component.scss',
})
export class MagazineSpineComponent {
  currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  currentYear = new Date().getFullYear();
}
