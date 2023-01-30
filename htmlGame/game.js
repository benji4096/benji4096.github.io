
class InputState
{
    keyDown(e)
    {
        console.log(e.key);
    }
    constructor()
    {
        window.addEventListener("keydown", this.keyDown);
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
fingerSwipeListener = new FingerSwipeListener();

class Vec2
{
    static dot(v1, v2)
    {
        return new Vec2(v1.x * v2.x, v1.y * v2.y);
    }
    static mul(x, v)
    {
        return new Vec2(x * v.x, x * v.y);
    }
    static add(v1, v2)
    {
        return new Vec2(v1.x + v2.x, v1.y + v2.y);
    }

    x;
    y;
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

PIXELS_PER_METER = 50;

class Player
{
    #movementDampening;
    #position;
    #vel;
    #image;
    #frames;

    constructor()
    {
        this.#movementDampening = new Vec2(1, 0.997);
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

        this.#vel = Vec2.dot(this.#vel, this.#movementDampening);

        if (this.#position.x <= -0.3)
            this.#vel.x = Math.abs(this.#vel.x);
        
        if (this.#position.x >= 2.6)
            this.#vel.x = -Math.abs(this.#vel.x);

        if (this.#position.y <= -0.25)
            this.#vel.y = Math.abs(this.#vel.x);

        
    }
    render(ctx, canvas)
    {
        ctx.fillStyle = 'white';

        let index = null;

        let nearGrownd = this.#position < 0.5;
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
                index = 7;
            else if (yVel >= -0.75 && yVel < -0.25)
                index = 6;
            else if (yVel >= -0.25 && yVel < 0.25)
                index = 5;
            else if (yVel >= 0.25 && yVel < 0.75)
                index = 4;
            else if (yVel >= 0.75 && yVel < 1.5)
                index = 3;
            else if (yVel >= 1.5)
                index = 3;
        }
        if (index == null) console.log(this.#vel.toString());

        if (this.#vel.x < 0)
        {
            ctx.scale(-1, 1);
            ctx.drawImage(this.#frames[index], -(this.#position.x + 1) * PIXELS_PER_METER, canvas.height - this.#position.y * PIXELS_PER_METER, PIXELS_PER_METER, -PIXELS_PER_METER);
            ctx.scale(-1, 1);
        }
        else
        {
            ctx.drawImage(this.#frames[0], this.#position.x * PIXELS_PER_METER, canvas.height - this.#position.y * PIXELS_PER_METER, PIXELS_PER_METER, -PIXELS_PER_METER);
        }
    }

    setVel(v)
    {
        this.#vel = v;
    }
}


// entry point
window.addEventListener('load', function()
{
    canvas = this.document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    canvas.width = 800;
    canvas.height = 720;

    inputs = new InputState();
    player = new Player();
    players = [];
    for (let i = 0; i < 15; i++)
    {
        players.push(new Player());
        players[i].setVel(new Vec2(Math.random() * 4.0 - 2.0, 0));
    }


    dt = 0;
    function loop()
    {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        PIXELS_PER_METER = canvas.height / 7;

        frameStartTime = Date.now();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        player.render(ctx, canvas);
        player.update(0.005);

        for (let p of players)
        {
            p.render(ctx, canvas);
            p.update(0.005);
        }
        //v = new Vec2(1, 2);
        //console.log(v.toString());


        window.requestAnimationFrame(loop);

        dt = (Date.now()-frameStartTime) / 1000;
    }
    window.requestAnimationFrame(loop);
    
    
})
