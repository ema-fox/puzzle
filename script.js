
function rand(a) {
    return Math.floor(Math.random() * a);
}

function rand_choice(xs) {
    return xs[rand(xs.length)];
}

function minus({x: xa, y: ya}, {x: xb, y: yb}) {
    return {x: xa - xb, y: ya - yb};
}

function plus({x: xa, y: ya}, {x: xb, y: yb}) {
    return {x: xa + xb, y: ya + yb};
}

function mult({x, y}, a) {
    return {x: x * a, y: y * a};
}

function clamp({x, y}) {
    return {x: x | 0, y: y | 0};
}

function pyth({x, y}) {
    return Math.sqrt(x * x + y * y);

}

function dist(pa, pb) {
    return pyth(minus(pa, pb));
}

function dir(pa, pb) {
    return mult(minus(pb, pa), 1 / dist(pb, pa));
}

function in_rect({x: xa, y: ya}, {x: xb, y: yb}, {x: xc, y: yc}) {
    return (xa <= xc && xc < xa + xb &&
            ya <= yc && yc < ya + yb);
}

class Bag extends Map {
    static from(obj) {
        return new Bag(Object.entries(obj));
    }
    set(key, value) {
        if (value === 0) {
            this.delete(key);
        } else {
            super.set(key, value);
        }
        return value;
    }
    get(key) {
        if (this.has(key)) {
            return super.get(key);
        } else {
            return 0;
        }
    }
    add(key, value) {
        this.set(key, this.get(key) + value);
    }
    incr(key) {
        this.add(key, 1);
    }
    decr(key) {
        this.add(key, -1);
    }
    remove(other) {
        for (let [key, value] of other) {
            this.add(key, -value);
        }
        return new Bag(other);
    }
    contains(other) {
        for (let [key, value] of other) {
            if (value > this.get(key)) {
                return false;
            }
        }
        return true;
    }
    size() {
        let size = 0;
        for (let [_, value] of this) {
            size += value;
        }
        return size;
    }
    pop_rand() {
        let x = rand(this.size());
        for (let [key, value] of this) {
            if (x < value) {
                this.decr(key);
                return key;
            } else {
                x -= value;
            }
        }
    }
}


let sentence = rand_choice(sentences);

var at_mouse, at_mouse_offset;

function start(target, mp) {
    if (target.classList.contains('text')) {
        target = target.parentNode;
    }
    if (target.classList.contains('piece')) {
        at_mouse = target;
        at_mouse_offset = minus({x: at_mouse.offsetLeft, y: at_mouse.offsetTop}, mp);
    }
}

function move(mp) {
    if (at_mouse) {
        let p = plus(mp, at_mouse_offset);
        at_mouse.style.left = p.x;
        at_mouse.style.top = p.y;
    }
}

function end() {
    if (at_mouse) {
        for (let el of field.childNodes) {
            if (el !== at_mouse && Math.abs(at_mouse.offsetTop - el.offsetTop) < 30) {
                if (tryout(at_mouse, el) || tryout(el, at_mouse)) {
                    break;
                }
            }
        }
    }
    at_mouse = undefined;
}

addEventListener('mousedown', event => {
    let mp = {x: event.clientX, y: event.clientY};
    start(event.target, mp);
});

addEventListener('touchstart', event => {
    let touch = event.touches.item(0);
    let mp = {x: touch.clientX, y: touch.clientY};
    start(touch.target, mp);
});

addEventListener('mousemove', event => {
    let mp = {x: event.clientX, y: event.clientY};
    move(mp);
});

addEventListener('touchmove', event => {
    if (event.touches.length === 1) {
        event.preventDefault();
    }
    let touch = event.touches.item(0);
    let mp = {x: touch.clientX, y: touch.clientY};
    move(mp);
});
    
addEventListener('mouseup', event => {
    end();
});

addEventListener('touchend', event => {
    end();
});

function fits(rest, pieces) {
    if (rest.length === 0) {
        return true;
    }
    for (let piece of pieces.keys()) {
        //console.log(piece)
        if (rest.indexOf(piece) === 0) {
            let bla = new Bag(pieces);
            bla.decr(piece);
            //console.log(pieces, bla);
            if (fits(rest.substr(piece.length), bla)) {
                return true;
            }
        }
    }
    return false;
}

function tryout(ela, elb) {
    if (Math.abs(ela.offsetLeft + ela.offsetWidth - elb.offsetLeft) < 30) {
        let foo = new Bag();
        foo.incr(ela.innerText + elb.innerText);
        for (let el of field.childNodes) {
            if (el.classList && el.classList.contains('piece') && el !== ela && el !== elb) {
                foo.incr(el.innerText);
            }
        }
        if (fits(sentence, foo)) {
            ela.firstChild.innerText += elb.innerText;
            elb.remove();
            return true;
        } else {
            elb.classList.add('ping');
            ela.classList.add('ping');
            setTimeout(() => {
                ela.classList.remove('ping');
                elb.classList.remove('ping');
            }, 1000);
        }
    }
}

let field = document.getElementById('field');

for (let c of sentence) {
    let foo = document.createElement('span');
    foo.classList.add('piece');
    foo.style.left = Math.random() * Math.max(window.innerWidth - 150, 200) | 0;
    foo.style.top = Math.random() * Math.max(window.innerHeight - 150, 200) | 0;
    let bla = document.createElement('span');
    bla.innerText = c;
    bla.classList.add('text');
    foo.insertBefore(bla, null);
    field.insertBefore(foo, null);
}
