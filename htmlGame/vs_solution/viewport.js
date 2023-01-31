
import { Vec2 } from "./Vec2.js";

export class Viewport
{
    constructor(canvas, ctx, pixelsPerMeter)
    {
        this.canvas = canvas;
        this.ctx = ctx;
        this.pixelsPerMeter = pixelsPerMeter;
    }
    drawImage(img, rect, flipped = false, smoothInterpolation = false)
    {
        try
        {
            this.ctx.imageSmoothingEnabled = smoothInterpolation;
        }
        catch { console.log("Error: could not set image interpolation mode to nearest"); };

        if (flipped)
        {
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(img, -(rect.pos.x + 1) * this.pixelsPerMeter, this.canvas.height - rect.pos.y * this.pixelsPerMeter, rect.extent.x * this.pixelsPerMeter, -rect.extent.y * this.pixelsPerMeter);
            this.ctx.scale(-1, 1);
        }
        else
        {
            this.ctx.drawImage(img, rect.pos.x * this.pixelsPerMeter, this.canvas.height - rect.pos.y * this.pixelsPerMeter, rect.extent.x * this.pixelsPerMeter, -rect.extent.y * this.pixelsPerMeter);
        }
    }
    drawRect(color, rect)
    {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(rect.pos.x * this.pixelsPerMeter, this.canvas.height - rect.pos.y * this.pixelsPerMeter, rect.extent.x * this.pixelsPerMeter, -rect.extent.y * this.pixelsPerMeter);
    }
}
