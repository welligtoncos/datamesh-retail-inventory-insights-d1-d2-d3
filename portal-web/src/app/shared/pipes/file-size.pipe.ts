import { Pipe, PipeTransform } from '@angular/core';

const UNITS = ['B', 'KB', 'MB', 'GB'] as const;

@Pipe({
  name: 'fileSize',
  standalone: true,
})
export class FileSizePipe implements PipeTransform {
  transform(bytes: number | null | undefined): string {
    if (bytes == null || bytes < 0) {
      return '—';
    }
    if (bytes === 0) {
      return '0 B';
    }

    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < UNITS.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    const formatted = size.toLocaleString('pt-BR', {
      minimumFractionDigits: unitIndex === 0 ? 0 : 1,
      maximumFractionDigits: unitIndex === 0 ? 0 : 1,
    });

    return `${formatted} ${UNITS[unitIndex]}`;
  }
}
