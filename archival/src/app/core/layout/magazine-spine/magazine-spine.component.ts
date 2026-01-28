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
  // This component focuses on branding and remains static across all routes.
}
