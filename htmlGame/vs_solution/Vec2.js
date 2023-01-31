
export class Vec2
{
    static perElementOp(op, v1, v2)
    {
        return new Vec2(op(v1.x, v2.x), op(v1.y, v2.y));
    }
    static vecMul(v1, v2)
    {
        return new Vec2(v1.x * v2.x, v1.y * v2.y);
    }
    static vecDiv(v1, v2)
    {
        return new Vec2(v1.x / v2.x, v1.y / v2.y);
    }
    static dot(v1, v2)
    {
        return v1.x * v2.x + v1.y * v2.y;
    }
    static mul(x, v)
    {
        return new Vec2(x * v.x, x * v.y);
    }
    static add(v1, v2)
    {
        return new Vec2(v1.x + v2.x, v1.y + v2.y);
    }
    static sub(v1, v2)
    {
        return new Vec2(v1.x - v2.x, v1.y - v2.y);
    }

    mag()
    {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    norm()
    {
        let magnitude = this.mag();
        return Vec2.vecDiv(this, new Vec2(magnitude, magnitude));
    }
    zero()
    {
        return (this.x == 0 && this.y == 0);
    }
    constructor(a, b)
    {
        this.x = a;
        this.y = b;
    }
    toString()
    {
        return "(" + this.x + "," + this.y + ")";
    }
}
