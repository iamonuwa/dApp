import React from 'react';

function line(ctx, position, color, text) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(20, position);
  ctx.lineTo(180, position);
  ctx.stroke();
  ctx.font = "14px 'Work Sans', sans-serif ";
  ctx.fillText(text, 200, position + 5, 100);
}
export class PriceGraph extends React.Component {
  componentDidMount() {
    this.updateCanvas();
    this.setDPI(this.refs.canvas, 300);
  }
  componentDidUpdate() {
    this.updateCanvas();
  }

  componentWillReceiveProps() {
    this.updateCanvas();
  }
  updateCanvas() {
    const ctx = this.refs.canvas.getContext('2d');
    ctx.clearRect(0, 0, 300, 160);
    line(ctx, 20, '#ffffff', 'Price Cap');
    line(ctx, 150, '#ffffff', 'Price Floor');

    let pY =
      150 -
      130 /
        100 *
        ((this.props.price - this.props.priceFloor) *
          100 /
          (this.props.priceCap - this.props.priceFloor));
    pY = pY >= 135 ? 135 : pY <= 35 ? 35 : pY;
    line(ctx, pY, '#00FFE2', this.props.price);
  }
  setDPI(canvas, dpi) {
    canvas.style.width = canvas.style.width || canvas.width + 'px';
    canvas.style.height = canvas.style.height || canvas.height + 'px';
    var scaleFactor = dpi / 96;
    var width = parseFloat(canvas.style.width);
    var height = parseFloat(canvas.style.height);
    var oldScale = canvas.width / width;
    var backupScale = scaleFactor / oldScale;
    var backup = canvas.cloneNode(false);
    backup.getContext('2d').drawImage(canvas, 0, 0);
    var ctx = canvas.getContext('2d');
    canvas.width = Math.ceil(width * scaleFactor);
    canvas.height = Math.ceil(height * scaleFactor);
    ctx.setTransform(backupScale, 0, 0, backupScale, 0, 0);
    ctx.drawImage(backup, 0, 0);
    ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);
  }
  render() {
    return (
      <canvas
        ref="canvas"
        width={300}
        height={160}
        style={{ marginLeft: '-20px' }}
      />
    );
  }
}
