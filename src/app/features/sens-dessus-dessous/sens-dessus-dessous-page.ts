import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RiddlePage } from '../riddles/riddle-page';
import { SENS_DESSUS_DESSOUS_ID } from '../riddles/riddle-pages';

@Component({
  selector: 'app-sens-dessus-dessous-page',
  imports: [RiddlePage],
  templateUrl: './sens-dessus-dessous-page.html',
  styleUrl: './sens-dessus-dessous-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SensDessusDessousPage {
  protected readonly riddleId = SENS_DESSUS_DESSOUS_ID;
  protected readonly phrases = [
    'MY RICE JAR',
    'CAN I DRAG YA',
    'MERMAN OF ANGER',
    'A PERIODICAL DONOR',
    'BIG MELONS',
    'BESTIAL JUROR',
    'A SEVERE NUKE',
  ];

  protected readonly titleGroups = [
    [
      'Feeling My November',
      'Own the Private Lake House',
      'Um... Sweet Minnesota',
      'Replacements: The Idaho Generation',
    ],
    [
      'Fireflies Behind Brockovich',
      'I Love the Garden',
      "Valentine's Day in Trouble",
      'Erin: Leave the World',
    ],
    ['On the Line of Darkness', 'Nature Without a Face', 'Edge of the Patriot: The Force Man'],
    [
      'Street of Belle Isle',
      'Edison: Smart Betty',
      'Vanquish the Bucket List',
      'Even an Unfinished Life',
      'Nurse: The Magic Money',
    ],
    ['The Fun Man', 'With Irene and Jane', 'On the Majestic Moon: Me, Myself & Dick'],
    ['The Sandoval Story: Love or Country', 'When a Man Loves Arturo', 'Open Road for a Woman'],
    [
      'Total Blood Diamond',
      "Hollywood: What's in the Mask?",
      'Revolutionary Man of the Beach',
      'Eating the Iron Grape',
      'Eclipse: Once Upon a Time, Body Lies in Gilbert Road',
    ],
  ];
}
