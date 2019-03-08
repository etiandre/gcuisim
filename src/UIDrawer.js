/**
 * Class that draws a Gamecube-like 2D UI.
 */
export default class UIDrawer {
  /**
   * UIDrawer constructor.
   */
  constructor() {
    this.textureSize = 512;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.textureSize;
    this.canvas.height = this.textureSize;
    this.ctx = this.canvas.getContext('2d');
    this.labelHeight = 85;
  }

  /**
   * Clears the UI and resets any canvas transform.
   */
  clear() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.textureSize, this.textureSize);
  }

  /**
   * Clears the UI and draws a radial menu.
   * @param {Array<String>} labels The 4 labels to draw, in clockwise order,
   * starting from the top one.
   */
  drawRadialMenu(labels) {
    this.clear();
    this.ctx.font = 'bold 70px "Source Sans Pro", sans-serif';
    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(labels[0], this.textureSize / 2, 0);
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText(labels[2], this.textureSize / 2, this.textureSize);
    this.ctx.rotate(Math.PI / 2);
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(labels[1], this.textureSize / 2, -this.textureSize);
    this.ctx.rotate(Math.PI);
    this.ctx.fillText(labels[3], -this.textureSize / 2, 0);
  }

  /**
   * Draw a top label (like a title).
   * @param {String} label The label to draw.
   */
  drawTopLabel(label) {
    this.ctx.save();
    this.ctx.font = 'bold 80px "Source Sans Pro", sans-serif';
    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(label, this.textureSize / 2, this.textureSize / 100);
    this.ctx.restore();
  }

  /**
   * Draw a centered label with semi-transparent background.
   * @param {String} label The label to draw.
   * @param {int} position Distance in pixels from the top.
   */
  drawCenteredLabel(label, position) {
    this.ctx.save();
    this.ctx.font = 'bold 65px "Source Sans Pro", sans-serif';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.fillRect(10, position, this.textureSize - 10, this.labelHeight);
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = 'white';
    this.ctx.shadowOffsetX = 3;
    this.ctx.shadowOffsetY = 3;
    this.ctx.shadowBlur = 0;
    this.ctx.shadowColor = 'black';
    this.ctx.fillText(label, this.textureSize / 2, position + this.labelHeight / 2);
    this.ctx.restore();
  }

  /**
   * Draw a label with an option and a semi-transparent background.
   * @param {String} label The label to draw.
   * @param {String} option The option text to draw.
   * @param {int} position Distance in pixels from the top.
   */
  drawOptionLabel(label, option, position) {
    this.ctx.save();
    this.ctx.font = 'bold 45px "Source Sans Pro", sans-serif';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.fillRect(10, position, this.textureSize - 10, this.labelHeight);
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = 'white';
    this.ctx.shadowOffsetX = 3;
    this.ctx.shadowOffsetY = 3;
    this.ctx.shadowBlur = 0;
    this.ctx.shadowColor = 'black';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(label, 30, position + this.labelHeight / 2);
    this.ctx.font = 'bold 65px "Source Sans Pro", sans-serif';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(option, this.textureSize - 30, position + this.labelHeight / 2);
    this.ctx.restore();
  }
}
