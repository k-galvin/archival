import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-loader.component.html',
  styleUrl: './page-loader.component.scss',
})
export class PageLoaderComponent {
  @Input() isLoading = false;
  @Input() loadingText = 'Loading';
}
