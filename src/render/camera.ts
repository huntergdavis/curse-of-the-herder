export class Camera {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  /** Ease toward (tx, ty) with a soft lead in the direction of travel. */
  follow(tx: number, ty: number, dt: number): void {
    const k = 1 - Math.exp(-dt * 2.2);
    this.x += (tx - this.x) * k;
    this.y += (ty - this.y) * k;
  }
  snap(tx: number, ty: number): void {
    this.x = tx;
    this.y = ty;
  }
}
