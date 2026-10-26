import { Pipe, PipeTransform } from '@angular/core';

const formatter = new Intl.DateTimeFormat('fr-CA', {
  timeZone: 'America/Toronto',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

@Pipe({ name: 'gameTime' })
export class GameTimePipe implements PipeTransform {
  transform(timestamp: number, iso = false): string {
    if (iso) return new Date(timestamp).toISOString();
    const parts = Object.fromEntries(
      formatter.formatToParts(timestamp).map((part) => [part.type, part.value]),
    );
    return `${parts['year']}-${parts['month']}-${parts['day']} ${parts['hour']}:${parts['minute']}:${parts['second']}`;
  }
}
