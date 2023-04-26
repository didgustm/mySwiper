(function(window){

    'use strict';

    // Extend Object
    function extend(a, b){
        let key;
        for(key in b){
            if(b.hasOwnProperty(key)){
                a[key] = b[key]
            }
        }
        return a
    }

    // Object Each
    function each(collection, callback){
        let item;
        collection.forEach(x => {
            item = x;
            callback(item)
        })
    }

    // siblings
    function siblings(el){
        const targets = el.parentElement.children;
        let arr = [];

        Array.from(targets).forEach(x => {
            arr.push(x)
        });

        return arr.filter(node => node != el);
    }


    // Swipe Constructor
    function Swipe(options){
        this.options = extend({}, this.options);
        extend(this.options, options);
        this._init()
    }

    // Swipe Options
    Swipe.prototype.options = {
        wrap: '.swiper',
        loop: false,
        speed: 800,
        delay: 3000,
        gap: 0,
        touchGap: 100,
        pagination: null,
        autoplay: false
    }

    // init
    Swipe.prototype._init = function(){
        // layout variables
        this.swiper = document.querySelector(this.options.wrap);
        this.wrapper = this.swiper.querySelector('.swiper-wrap');
        this.items = this.wrapper.querySelectorAll('.swiper-item');
        this.posx = this.swiper.getBoundingClientRect().x;
        this.w = this.swiper.offsetWidth;

        // data variables
        this.length = this.items.length;
        this.step = this.wrapper.firstElementChild.offsetWidth + this.options.gap;
        this.realNum = 0;
        this.num = 0;
        this.dragStart = false;
        this.dragStartPoint = null;
        this.movePoint = null;
        this.animating = false;
        this.pagers = document.querySelectorAll(`${this.options.pagination} > *`);
        
        // items setting
        this.items.forEach(x => {
            x.style.marginRight = `${this.options.gap}px`
        });

        // loop
        if(this.options.loop){
            let first, last;
            first = this.wrapper.firstElementChild.cloneNode(true);
            last = this.wrapper.lastElementChild.cloneNode(true);
            this.wrapper.appendChild(first);
            this.wrapper.insertBefore(last, this.wrapper.firstChild);
            
            this.num = 1;
            this.length = this.wrapper.childElementCount;
            this.translateTo(-this.step * this.num, 0);
            
        }
        
        // paging
        if(this.options.pagination != null){
            this.pagers.forEach((x, i) => {
                x.addEventListener('click', () => {
                    this.slideTo(i);
                });
            })
        }

        // autoplay
        if(this.options.autoplay){
            this.autoplay();
        }
        
        this._dragEvents();
    }

    // drag event
    Swipe.prototype._dragEvents = function(){
        this.swiper.addEventListener('pointerdown', e => this.swipeStart(e));
        this.swiper.addEventListener('pointermove', e => this.swipeMove(e));
        this.swiper.addEventListener('pointerup', () => this.swipeEnd());
    }

    // functions
    Swipe.prototype.swipeStart = function(e){
        this.swiper.setPointerCapture(e.pointerId)
        if(!this.animating){
            e.preventDefault();
            this.dragStartPoint = e.x - (this.posx + this.w/2);
            this.movePoint = 0;
            this.dragStart = true;
        }
    }

    Swipe.prototype.swipeMove = function(e){
        if(this.dragStart && !this.animating){
            this.movePoint = this.dragStartPoint - (e.x - (this.posx + this.w/2));
            const count = -this.step * this.num - this.movePoint;
            this.translateTo(count, 0);
        }
    }

    Swipe.prototype.swipeEnd = function(){
        this.dragStart = false;
        this.animating = true;

        if(this.movePoint > this.options.touchGap){
            if(this.num >= this.length - 2){
                this.num++;
                this.realNum = 0;
                setTimeout(() => {
                    this.num = 1;
                    this.translateTo(-this.step * this.num, 0);
                }, this.options.speed)
            } else{
                this.realNum++;
                this.num++;
            }
        } else if(this.movePoint < -this.options.touchGap){
            if(this.num <= 1){
                this.num--;
                this.realNum = this.length - 3;
                setTimeout(() => {
                    this.num = this.length - 2;
                    this.translateTo(-this.step * this.num, 0);
                }, this.options.speed)
            } else{
                this.realNum--;
                this.num--;
            }
        }

        // animation
        const count = -this.step * this.num;
        this.translateTo(count, this.options.speed);

        // forbid event
        setTimeout(() => {
            this.forbidMove()
        }, this.options.speed)
            
    }

    Swipe.prototype.forbidMove = function(){
        this.animating = false;
    }

    Swipe.prototype.translateTo = function(count, duration){
        this.wrapper.style.transitionDuration = `${duration}ms`;
        this.wrapper.style.transform = `translate(${count}px, 0)`;
        this.items.forEach((x, i) => {
            if(i == this.realNum){
                x.classList.add('active');
                siblings(x).forEach(el => el.classList.remove('active'));
            }
        })
        this.pagers.forEach((x, i) => {
            if(i == this.realNum){
                x.classList.add('active');
                siblings(x).forEach(el => el.classList.remove('active'));
            }
        });
    }

    Swipe.prototype.slideNext = function(){
        if(!this.animating){
            this.animating = true;
            if(this.options.loop && this.num >= this.length - 2){
                this.num++;
                this.realNum = 0;
                setTimeout(() => {
                    this.num = 1;
                    this.translateTo(-this.step * this.num, 0);
                }, this.options.speed)
            } else {
                if(this.num < this.length - 1){
                    this.num++;
                    this.realNum++
                } else {
                    this.num;
                    this.realNum;
                }
            }

            const count = -this.step * this.num;
            this.translateTo(count, this.options.speed);

            // forbid event
            setTimeout(() => {
                this.forbidMove()
            }, this.options.speed)
        }
    }

    Swipe.prototype.slidePrev = function(){
        if(!this.animating){
            this.animating = true;
            if(this.options.loop && this.num <= 1){
                this.num--;
                this.realNum = this.length - 3;
                setTimeout(() => {
                    this.num = this.length - 2;
                    this.translateTo(-this.step * this.num, 0);
                }, this.options.speed)
            } else{
                if(this.num > 0){
                    this.num--;
                    this.realNum--;
                } else{
                    this.num;
                    this.realNum;
                }
            }

            const count = -this.step * this.num;
            this.translateTo(count, this.options.speed);

            // forbid event
            setTimeout(() => {
                this.forbidMove()
            }, this.options.speed)
        }
    }

    Swipe.prototype.slideTo = function(index){
        if(!this.animating){
            this.animating = true;
            this.options.loop? this.num = index+1: this.num = index;
            this.realNum = index;
            const count = -this.num * this.step;
            this.translateTo(count, this.options.speed);

            // forbid event
            setTimeout(() => {
                this.forbidMove()
            }, this.options.speed)
        }
    }

    Swipe.prototype.autoplay = function(){

        var timer = setInterval(() => {
            this.slideNext();
        }, this.options.delay);

    }

    window.Swipe = Swipe;

})(window);


