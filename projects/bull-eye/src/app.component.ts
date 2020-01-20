import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';

import { DrawableMapDataService, BullEyeType } from './services/drawable-map-data.service';
import { Picture } from '@antpass79/drawable-surface';
import { ScoreColorPairMapService, ScoreColorPair, ScoreColorSegment } from './services/score-color-pair-map.service';
import { DrawableSurfaceComponent } from 'projects/drawable-surface/src/drawable-surface/drawable-surface.component';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  selectSurfaceStream$ = new Subject<BullEyeType>();
  selectScoreColorPairStream$ = new Subject<ScoreColorPair>();
  clearStream$ = new Subject<any>();

  shapeMouseDoubleClickStream$ = new Subject<any>();
  shapeMouseWheelStream$ = new Subject<any>();

  bullEyeTypes = BullEyeType;
  events = [];
  selectedBullEye: Picture;

  @ViewChild(DrawableSurfaceComponent, { static: true })
  drawableSurface: DrawableSurfaceComponent;

  constructor(
    private drawableMapDataService: DrawableMapDataService,
    private scoreColorPairMapService: ScoreColorPairMapService) {
  }

  ngOnInit() {
    this.selectSurfaceStream$.subscribe((bullEyeType: BullEyeType) => {
      this.selectedBullEye = this.drawableMapDataService.bullEyes.get(bullEyeType.toString());
    });

    this.selectScoreColorPairStream$.subscribe((scoreColorPair: ScoreColorPair) => {
      let selectedShapes = this.selectedBullEye.shapes.filter((shape: ScoreColorSegment) => shape.status.selected);
      selectedShapes.forEach((shape: ScoreColorSegment) => shape.scoreColorPair = scoreColorPair);
      this.selectedBullEye.draw(this.drawableSurface);
    });
    this.shapeMouseDoubleClickStream$.subscribe(payload => {
      let currentIndex = this.scoreColorPairMapService.scoreColorPairs.findIndex(scoreColorPair => scoreColorPair === payload.shape.scoreColorPair);

      if (currentIndex < this.scoreColorPairMapService.scoreColorPairs.length - 1)
        currentIndex++;
      else
        currentIndex = 0;

      payload.shape.scoreColorPair = this.scoreColorPairMapService.scoreColorPairs[currentIndex];
      this.events.push(this.scoreColorPairMapService.scoreColorPairs[currentIndex].description);
    });

    this.shapeMouseWheelStream$.subscribe(payload => {
      let currentIndex = this.scoreColorPairMapService.scoreColorPairs.findIndex(scoreColorPair => scoreColorPair === payload.shape.scoreColorPair);

      if (payload.mouseEvent.deltaY < 0 && currentIndex < this.scoreColorPairMapService.scoreColorPairs.length - 1)
        currentIndex++;
      if (payload.mouseEvent.deltaY > 0 && currentIndex > 0)
        currentIndex--;

      payload.shape.scoreColorPair = this.scoreColorPairMapService.scoreColorPairs[currentIndex];
      this.events.push(this.scoreColorPairMapService.scoreColorPairs[currentIndex].description);
    });

    this.clearStream$.subscribe(() => this.events = []);
  }
}
