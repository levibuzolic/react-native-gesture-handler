import { State } from '../../State';
import { DEFAULT_TOUCH_SLOP } from '../constants';
import { AdaptedEvent, Config } from '../interfaces';

import GestureHandler from './GestureHandler';
export default class NativeViewGestureHandler extends GestureHandler {
  private buttonRole!: boolean;

  //TODO: Implement logic for activation on start
  //@ts-ignore Logic yet to be implemented
  private shouldActivateOnStart = false;
  private disallowInterruption = false;

  private startX = 0;
  private startY = 0;
  private minDistSq = DEFAULT_TOUCH_SLOP * DEFAULT_TOUCH_SLOP;

  public init(ref: number, propsRef: React.RefObject<unknown>): void {
    super.init(ref, propsRef);

    this.setShouldCancelWhenOutside(true);

    this.view.style['touchAction'] = 'auto';

    //@ts-ignore Turns on defualt touch behavior on Safari
    this.view.style['WebkitTouchCallout'] = 'auto';

    if (this.view.hasAttribute('role')) {
      this.buttonRole = true;
    } else {
      this.buttonRole = false;
    }

    if (this.view.tagName.toLowerCase() === 'input') {
      //Enables text input on Safari
      this.view.style['webkitUserSelect'] = 'auto';
    }
  }

  public updateGestureConfig({ enabled = true, ...props }: Config): void {
    super.updateGestureConfig({ enabled: enabled, ...props });

    if (this.config.shouldActivateOnStart !== undefined) {
      this.shouldActivateOnStart = this.config.shouldActivateOnStart;
    }
    if (this.config.disallowInterruption !== undefined) {
      this.disallowInterruption = this.config.disallowInterruption;
    }
  }

  protected resetConfig(): void {
    super.resetConfig();
  }

  protected onPointerDown(event: AdaptedEvent): void {
    super.onPointerDown(event);
    this.newPointerAction(event);
  }

  protected onPointerAdd(event: AdaptedEvent): void {
    this.newPointerAction(event);
  }

  private newPointerAction(event: AdaptedEvent): void {
    this.tracker.addToTracker(event);

    this.startX = this.tracker.getLastAvgX();
    this.startY = this.tracker.getLastAvgY();

    if (this.currentState !== State.UNDETERMINED) {
      return;
    }

    this.begin(event);
    if (this.buttonRole) {
      this.activate(event);
    }
  }

  protected onPointerMove(event: AdaptedEvent): void {
    this.tracker.track(event);

    const dx = this.startX - this.tracker.getLastAvgX();
    const dy = this.startY - this.tracker.getLastAvgY();
    const distSq = dx * dx + dy * dy;

    if (
      !this.buttonRole &&
      distSq >= this.minDistSq &&
      this.currentState === State.BEGAN
    ) {
      this.activate(event);
    }
  }

  protected onPointerOut(event: AdaptedEvent): void {
    this.cancel(event);
  }

  protected onPointerUp(event: AdaptedEvent): void {
    this.tracker.removeFromTracker(event.pointerId);

    if (this.tracker.getTrackedPointersCount() === 0) {
      if (this.currentState === State.ACTIVE) {
        this.end(event);
      } else {
        this.fail(event);
      }
    }
  }

  protected onPointerRemove(event: AdaptedEvent): void {
    this.onPointerUp(event);
  }

  protected onPointerCancel(event: AdaptedEvent): void {
    this.cancel(event);
    this.reset();
  }

  public shouldRecognizeSimultaneously(handler: GestureHandler): boolean {
    if (super.shouldRecognizeSimultaneously(handler)) {
      return true;
    }

    if (
      handler instanceof NativeViewGestureHandler &&
      handler.getState() === State.ACTIVE &&
      handler.disallowsInterruption()
    ) {
      return false;
    }

    const canBeInterrupted = !this.disallowInterruption;

    if (
      this.currentState === State.ACTIVE &&
      handler.getState() === State.ACTIVE &&
      canBeInterrupted
    ) {
      return false;
    }

    return (
      this.currentState === State.ACTIVE &&
      canBeInterrupted &&
      handler.getTag() > 0
    );
  }

  public shouldBeCancelledByOther(_handler: GestureHandler): boolean {
    return !this.disallowInterruption;
  }

  public disallowsInterruption(): boolean {
    return this.disallowInterruption;
  }
}
