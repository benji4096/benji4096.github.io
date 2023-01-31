
import * as Physics2D from "./physics.js";
import { Vec2 } from "./Vec2.js";
import { Viewport } from "./viewport.js";

class InputState
{
    keyDown(e)
    {
        this.keys[e.keyCode] = true;
    }
    keyUp(e)
    {
        this.keys[e.keyCode] = false;
    }
    constructor()
    {
        this.keys = [];

        window.addEventListener("keydown", e => { this.keyDown(e) } );
        window.addEventListener("keyup", e => { this.keyUp(e) });
    }
}

class FingerSwipeListener
{
    xDown = null;
    yDown = null;

    callbacks = [];

    constructor()
    {
        document.addEventListener('touchstart', e => { this.handleTouchStart(e) }, false);        
        document.addEventListener('touchmove', e => { this.handleTouchMove(e) }, false);
    }
    addTouchCallback(f)
    {
        this.callbacks.push(f);
    }

    // https://stackoverflow.com/questions/2264072/detect-a-finger-swipe-through-javascript-on-the-iphone-and-android
    handleTouchStart(evt)
    {
        const firstTouch = (evt.touches || evt.originalEvent.touches)[0];
        this.xDown = firstTouch.clientX;
        this.yDown = firstTouch.clientY;
    }
    handleTouchMove(evt)
    {
        if ( ! this.xDown || ! this.yDown )
        {
            return;
        }
    
        var xUp = evt.touches[0].clientX;
        var yUp = evt.touches[0].clientY;
    
        var xDiff = this.xDown - xUp;
        var yDiff = this.yDown - yUp;
        
        for (const f of this.callbacks)
        {
            f(new Vec2(-xDiff, yDiff));
        }

        this.xDown = null;
        this.yDown = null;
    }
}
let fingerSwipeListener = new FingerSwipeListener();

let PIXELS_PER_METER = 50;

class Player
{
    #movementDampening;
    #position;
    #vel;
    #image;
    #frames;

    constructor()
    {
        this.#movementDampening = new Vec2(0.999, 0.999);
        this.#position = new Vec2(1, 5);
        this.#vel = new Vec2(2, 1);

        this.#image = document.getElementById("playerImage");

        this.#frames = [];
        for (let i = 0; i <= 8; i++)
        {
            this.#frames.push(document.getElementById("cat_"+i+"0"));
        }

        fingerSwipeListener.addTouchCallback(v => { this.swipeCallback(v) });
    }

    swipeCallback(v)
    {
        //console.log(v);
        //console.log(Vec2.mul(0.1, v).toString());
        //console.log(Vec2.add(this.#vel, Vec2.mul(0.1, v)).toString());
        this.#vel = Vec2.add(this.#vel, Vec2.mul(0.5, v));
    }
    #getAcceleration()
    {
        return new Vec2(0, -9.81);
    }
    update(dt)
    {
        this.#vel = Vec2.add(this.#vel, Vec2.mul(dt, this.#getAcceleration()));
        this.#position = Vec2.add(this.#position, Vec2.mul(dt, this.#vel));

        this.#vel = Vec2.vecMul(this.#vel, this.#movementDampening);

        if (this.#position.x <= -0.3)
            this.#vel.x = Math.abs(this.#vel.x);
        
        if (this.#position.x >= 2.6)
            this.#vel.x = -Math.abs(this.#vel.x);

        if (this.#position.y <= -0.25)
            this.#vel.y = Math.abs(this.#vel.y);

        
    }
    draw(vp)
    {
        let index = null;

        let nearGrownd = this.#position.y < 0.75;
        let yVel = this.#vel.y;
        
        if (nearGrownd)
        {
            if (yVel < -0.75)
                index = 7;
            else if (yVel >= -0.75 && yVel < -0.25)
                index = 8;
            else if (yVel >= -0.25 && yVel < 0.25)
                index = 0;
            else if (yVel >= 0.25 && yVel < 0.75)
                index = 1;
            else if (yVel >= 0.75 && yVel < 1.5)
                index = 2;
            else if (yVel >= 1.5)
                index = 3;

        }
        else
        {
            if (yVel < -0.75)
                index = 8;
            else if (yVel >= -0.75 && yVel < -0.25)
                index = 7;
            else if (yVel >= -0.25 && yVel < 0.25)
                index = 6;
            else if (yVel >= 0.25 && yVel < 0.75)
                index = 5;
            else if (yVel >= 0.75 && yVel < 1.5)
                index = 4;
            else if (yVel >= 1.5)
                index = 3;
        }
        if (index == null) console.log(this.#vel.toString());


        vp.drawImage(this.#frames[index], new Physics2D.Rect2D(this.#position, new Vec2(1, 1)), this.#vel.x < 0);
    }

    setVel(v)
    {
        this.#vel = v;
    }
}

class Ball
{
    constructor(physicsSystem)
    {
        this.physicsObject = new Physics2D.Object2D(new Physics2D.Collider2D(new Vec2(2, 5), new Vec2(1, 1)), 1);

        this.image = document.getElementById("playerImage");
    }
    draw(vp)
    {
        vp.drawImage(this.image, this.physicsObject.collider, this.physicsObject.vel.x < 0);
    }
}

// entry point
window.addEventListener('load', function()
{
    let canvas = this.document.getElementById("gameCanvas");
    let ctx = canvas.getContext("2d");
    canvas.width = 800;
    canvas.height = 720;

    let viewport = new Viewport(canvas, ctx, PIXELS_PER_METER);

    let inputs = new InputState();
    let player = new Player();

    let system = new Physics2D.System();
    let ball = new Ball();
    let floor = new Physics2D.StaticObject2D(new Physics2D.Collider2D(new Vec2(0, -0.9), new Vec2(5, 1)), 1);
    let leftWall = new Physics2D.StaticObject2D(new Physics2D.Collider2D(new Vec2(-0.9, 0), new Vec2(1, 5)), 1);
    let rightWall = new Physics2D.StaticObject2D(new Physics2D.Collider2D(new Vec2(3, 0), new Vec2(1, 5)), 1);
    system.addObject(ball.physicsObject);
    system.addObject(floor);
    system.addObject(leftWall);
    system.addObject(rightWall);


    let colliderTest = new Physics2D.Collider2D(new Vec2(1, 2), new Vec2(0.5,1));
    let colliderTest2 = new Physics2D.Collider2D(new Vec2(1, 3), new Vec2(1, 0.5));

    let dt = 0;
    function loop()
    {
        let frameStartTime = Date.now();

        if (inputs.keys[87])
            colliderTest2.pos.y += 0.05;
        if (inputs.keys[83])
            colliderTest2.pos.y -= 0.05;
        if (inputs.keys[68])
            colliderTest2.pos.x += 0.05;
        if (inputs.keys[65])
            colliderTest2.pos.x -= 0.05;

        //console.log(colliderTest.collisionNormal(colliderTest2).toString());

        if (Physics2D.Collider2D.colliding(colliderTest, colliderTest2))
        {
            let norm = colliderTest2.collisionNormal(colliderTest);
            console.log(norm.norm().toString());
            colliderTest2.pos = Vec2.add(colliderTest2.pos, Vec2.mul(1, norm));
        }

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        PIXELS_PER_METER = canvas.height / 7;
        viewport.pixelsPerMeter = canvas.height / 7;



        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (Physics2D.Collider2D.colliding(colliderTest, colliderTest2))
            colliderTest.debugDraw(viewport, "rgba(255, 0, 255, 0.5)");
        else
            colliderTest.debugDraw(viewport, "white");

        colliderTest2.debugDraw(viewport);

        player.draw(viewport);
        player.update(0.005);

        system.update(0.005);
        ball.draw(viewport);

        floor.collider.debugDraw(viewport);
        leftWall.collider.debugDraw(viewport);
        rightWall.collider.debugDraw(viewport);


        window.requestAnimationFrame(loop);

        dt = (Date.now()-frameStartTime) / 1000;
    }
    window.requestAnimationFrame(loop);
    
    
})
