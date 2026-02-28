import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyFormat', standalone: false })
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number | null | undefined, symbol: string = '$', decimals: number = 0): string {
    if (value == null) return `${symbol}0`;
    return `${symbol}${value.toLocaleString('es-CO', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  }
}

