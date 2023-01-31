
import { Vec2 } from "./Vec2.js";
import { Viewport } from "./viewport.js";

export class Rect2D
{
    constructor(position, extent)
    {
        this.pos = position;
        this.extent = extent;
    }
    debugDraw(vp, color = "rgba(255, 0, 255, 0.5)")
    {
        vp.drawRect(color, this);
    }
    toString()
    {
        return `Rect2D(${this.pos.toString()}, ${this.extent.toString()})`;
    }
}

export class Collider2D extends Rect2D
{
    static colliding(a, b)
    {
        return  a.pos.x < b.pos.x + b.extent.x &&
                a.pos.x + a.extent.x > b.pos.x &&
                a.pos.y < b.pos.y + b.extent.y &&
                a.pos.y + a.extent.y > b.pos.y;
    }
    static #getPartialCollisionNormal(tx1, tx2, ox1, ox2)
    {
        const delta = 0.05;

        let tCenter = tx1 + 0.5 * (tx2 - tx1);
        let oCenter = ox1 + 0.5 * (ox2 - ox1);

        let thisInsideOther = false;
        let otherInsideThis = false;
        if (tx1 >= ox1 && tx2 <= ox2)
            thisInsideOther = true;
        if (ox1 >= tx1 && ox2 <= tx2)
            otherInsideThis = true;
        
        if (otherInsideThis || thisInsideOther)
            return 0;

        if (tCenter >= oCenter)
        {
            if (Math.abs(ox2 - tx1) < delta)
                return ox2 - tx1;
        }
        else
        {
            if (Math.abs(ox1 - tx2) < delta)
                return ox1 - tx2;
        }
        return 0;
    }
    static #getNormalFromPartial(pos1, extent1, pos2, extent2)
    {
        let partialX = Collider2D.#getPartialCollisionNormal(pos1.x, pos1.x + extent1.x, pos2.x, pos2.x + extent2.x);
        let partialY = Collider2D.#getPartialCollisionNormal(pos1.y, pos1.y + extent1.y, pos2.y, pos2.y + extent2.y);
        return new Vec2(partialX, partialY);
    }
    collisionNormal(other)
    {
        /*let center = Vec2.add(this.extent, Vec2.mul(0.5, this.pos));
        let otherCenter = Vec2.add(other.extent, Vec2.mul(0.5, other.pos));

        let xOverlap = null;
        let yOverlap = null;

        if (otherCenter.x > otherCenter.x)
            xOverlap = this.pos.x + this.extent.x - other.pos.x;
        else
            xOverlap = other.pos.x + other.extent.x - this.pos.x;

        if (otherCenter.y > otherCenter.y)
            yOverlap = this.pos.y + this.extent.y - other.pos.y;
        else
            yOverlap = other.pos.y + other.extent.y - this.pos.y;

        if (xOverlap > yOverlap)
        {
            if (center.x < otherCenter.x)
            {
                return new Vec2(-1, 0);
            }
            else
            {
                return new Vec2(1, 0);
            }
        }
        else
        {
            if (center.y < otherCenter.y)
            {
                return new Vec2(0, -1);
            }
            else
            {
                return new Vec2(0, 1);
            }
        }*/
        
        let norm = Collider2D.#getNormalFromPartial(this.pos, this.extent, other.pos, other.extent);

        if (norm.zero())
        {
            const delta = 0.05;
            let upX = Vec2.add(new Vec2(delta, 0), this.pos);
            let downX = Vec2.add(new Vec2(-delta, 0), this.pos);
            let upY = Vec2.add(new Vec2(0, delta), this.pos);
            let downY = Vec2.add(new Vec2(0, -delta), this.pos);

            upX = Collider2D.#getNormalFromPartial(upX, this.extent, other.pos, other.extent);
            downX = Collider2D.#getNormalFromPartial(downX, this.extent, other.pos, other.extent);
            upY = Collider2D.#getNormalFromPartial(upY, this.extent, other.pos, other.extent);
            downY = Collider2D.#getNormalFromPartial(downY, this.extent, other.pos, other.extent);

            let x;
            let y;

            if (upX.mag() > downX.mag())
                x = upX;
            else
                x = downX;
            if (upY.mag() > downY.mag())
                y = upY;
            else
                y = downY;

            if (x.mag() > y.mag())
                norm = x;
            else
                norm = y;
        }
        if (norm.zero())
            norm = new Vec2(0, 1);

        return norm;
    }

}

export class Object2D
{
    static = false;
    elastic = true;

    gravity = new Vec2(0, -9.81);

    airReisitance = 0.99;
    collisionLoss = 0.99;

    constructor(collider, inertia)
    {
        this.collider = collider;
        this.inertia = inertia;
        this.vel = new Vec2(-2, 0);
    }

    updateStage1(dt, system)
    {
        let forceOfG = Vec2.mul(this.inertia, this.gravity);
        let momentum = Vec2.mul(this.inertia, this.vel);

        for (let other of system.objects)
        {
            if (other !== this)
            {
                if (Collider2D.colliding(this.collider, other.collider))
                {
                    if (other.static && other.elastic && this.elastic)
                    {
                        let norm = this.collider.collisionNormal(other.collider).norm();

                        let reflected = Vec2.sub(this.vel, Vec2.mul(2 * Vec2.dot(this.vel, norm), norm));
                        console.log(norm.toString());
                        //console.log(reflected.toString());
                        if (Vec2.dot(this.vel, norm) < 0)
                            this.vel = Vec2.mul(this.collisionLoss, reflected);
                        //this.vel.y = norm.y * Math.abs(this.vel.y);
                    }
                }
            }
        }
        this.vel = Vec2.add(this.vel, Vec2.mul(dt, Vec2.vecDiv(forceOfG, new Vec2(this.inertia, this.inertia))));
        this.vel = Vec2.mul(this.airReisitance, this.vel);
    }
    updateStage2(dt, system)
    {
        this.collider.pos = Vec2.add(this.collider.pos, Vec2.mul(dt, this.vel));
    }
}

export class StaticObject2D extends Object2D
{
    static = true;
    updateStage1()
    {

    }
    updateStage2()
    {

    }
}

export class System
{
    constructor()
    {
        this.objects = [];
    }
    update(dt)
    {
        for (let object of this.objects)
        {
            object.updateStage1(dt, this);
        }
        for (let object of this.objects)
        {
            object.updateStage2(dt, this);
        }
    }
    addObject(o)
    {
        this.objects.push(o);
    }
}
