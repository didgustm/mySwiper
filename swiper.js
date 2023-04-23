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
        delay: 300,
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

        // mobile check
        const mobileKeyWords = ['iPhone', 'iPod', 'BlackBerry', 'Android', 'Windows CE', 'LG', 'MOT', 'SAMSUNG', 'SonyEricsson'];
        const mobileCheck = mobileKeyWords.filter(el => navigator.userAgent.match(el));
        mobileCheck.length < 1? this._dragEvents(): this._touchEvents();
    }

    // drag event
    Swipe.prototype._dragEvents = function(){
        this.swiper.addEventListener('pointerdown', e => this.swipeStart(e));
        document.addEventListener('pointermove', e => this.swipeMove(e));
        document.addEventListener('pointerup', () => this.swipeEnd());
    }

    // touch event
    Swipe.prototype._touchEvents = function(){
        this.swiper.addEventListener('touchstart', e => this.swipeStart(e));
        document.addEventListener('touchmove', e => this.swipeMove(e));
        document.addEventListener('touchend', () => this.swipeEnd());
    }

    // functions
    Swipe.prototype.swipeStart = function(e){
        if(!this.animating){
            e.preventDefault();
            e.stopPropagation();
            this.dragStartPoint = (e.screenX || e.touches[0].screenX) - (this.posx + this.w/2);
            this.dragStart = true;
        }
    }

    Swipe.prototype.swipeMove = function(e){
        if(this.dragStart && !this.animating){
            this.movePoint = this.dragStartPoint - ((e.screenX || e.touches[0].screenX) - (this.posx + this.w/2));
            const count = -this.step * this.num - this.movePoint;
            this.translateTo(count, 0)
        }
    }

    Swipe.prototype.swipeEnd = function(){
        if(this.dragStart){
            this.dragStart = false;
            this.animating = true;

            // loop next end
            if(this.options.loop && this.movePoint > this.options.touchGap && this.num >= this.length - 2){
                this.num++;
                this.realNum = 0;
                setTimeout(() => {
                    this.num = 1;
                    this.translateTo(-this.step * this.num, 0);
                }, this.options.speed)
            }
            // loop prev end
            else if(this.options.loop && this.movePoint < -this.options.touchGap && this.num <= 1){
                this.num--;
                this.realNum = this.length - 3;
                setTimeout(() => {
                    this.num = this.length - 2;
                    this.translateTo(-this.step * this.num, 0);
                }, this.options.speed)
            }

            else {
                // next
                if(this.movePoint > this.options.touchGap && this.num < this.length - 1) {
                    this.realNum++;
                    this.num++;
                }
                // prev
                else if(this.movePoint < -this.options.touchGap && this.num > 0) {
                    this.realNum--;
                    this.num--;
                }
                // hold
                else {
                    this.realNum;
                    this.num;
                };
            }

            // animation
            const count = -this.step * this.num;
            this.translateTo(count, this.options.speed);

            // forbid event
            setTimeout(() => {
                this.forbidMove()
            }, this.options.speed)
            
        }
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
        }, 3000);

    }

    window.Swipe = Swipe;

})(window);


