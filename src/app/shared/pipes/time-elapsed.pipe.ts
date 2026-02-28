import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'timeElapsed', standalone: false })
export class TimeElapsedPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '—';
    const start = new Date(value).getTime();
    const now = Date.now();
    const diffMs = now - start;
    if (diffMs < 0) return '0m';
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
}

