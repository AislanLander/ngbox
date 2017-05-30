import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener, DoCheck } from '@angular/core';
import { NgBoxService } from './ngbox.service';


@Component({
    selector: 'my-ngbox, ngbox',
    template: `
        <div id="ngBoxLoading" *ngIf="ngBox.loading">x</div>
        <div id="ngBoxWrapper" (click)="closeOutside($event)" *ngIf="ngBox.open" [ngStyle]="{'padding-top': offsetHeight+'px'}">
            <div id="ngBoxContent">
                <img *ngIf="getHasGroup()" class="left" (click)="previousNgBox()" >
                <img *ngIf="ngBox.current.type == 1"
                     (load)="isLoaded()" 
                     #ngBoxContent 
                     [src]="ngBox.current.url"
                     [hidden]="ngBox.loading" 
                     (click)="nextNgBox()"
                     alt="">
                     
                     <div #ngBoxButtons id="buttons" [hidden]="ngBox.loading">
                <p>
                    <span class="title" *ngIf="ngBox.current.title">{{ngBox.current.title}}<br/></span>
                    <span class="pages" *ngIf="getHasGroup()">{{getCurrentIndex()}} of {{getCount()}}</span>
                </p>
                <a (click)="closeNgBox()" id="closeButton">x</a>
            </div>
            
                <iframe *ngIf="ngBox.current.type == 2" 
                        #ngBoxContent
                        [src]="ngBox.current.url"
                        width="{{ngBox.current.width}}"
                        height="{{ngBox.current.height}}"
                        frameborder="0"
                        allowfullscreen>
                </iframe>
                <iframe *ngIf="ngBox.current.type == 3" 
                        [src]="ngBox.current.url"
                        #ngBoxContent
                        width="{{ngBox.current.width}}"
                        height="{{ngBox.current.height}}"
                        frameborder="0" 
                        webkitallowfullscreen 
                        mozallowfullscreen 
                        allowfullscreen>
                </iframe>
                <iframe *ngIf="ngBox.current.type == 4" 
                        #ngBoxContent
                        [src]="ngBox.current.url"
                        frameborder="0"
                        width="{{ngBox.current.width}}"
                        height="{{ngBox.current.height}}"
                        allowfullscreen>
                </iframe>
            </div>
                 
        </div>
    `,
    styles: [`
        #ngBoxLoading{
            text-align: center;
            z-index: 10001;
            width: 100%;
            height: 100%;
            color: white;
            position: fixed;
            top: 46%;
            font-size: 20px;
        }
        #ngBoxWrapper {
            background-color: rgba(0, 0, 0, 0.4);
            position: fixed;
            top: 0px;
            left: 0px;
            text-align: center;
            z-index: 10000;
            width: 100%;
            height: 100%;
        }

        #ngBoxWrapper #ngBoxContent img {
            -webkit-border-radius: 4px;
            -moz-border-radius: 4px;
            border-radius: 4px;
        }

        #ngBoxContent {
            display: block;
        }

        button {
            font-size: 12px;
        }

        iframe {
            max-width: 100%;
            max-height: 100%;
            height: 32vw;
            width: 75vw;            
        }                      
        @media (max-width: 1024px) {
                iframe {
                    height: 40vw;
                    width: 93vw;
                }
        }        
        #buttons{
            position: relative;
            margin: 5px auto;
            text-align: right;
        }
        #buttons p{
            float: left;
            color: white;
            text-align: left;
            margin: 0 50px 0 0;
            font-size: 12px;
            font-family: sans-serif;
        }
        #buttons span.title{
            display: block;
            height: 18px;
            overflow: hidden;
        }
        #closeButton, #closeButton:focus {
            position: absolute;
            right: -15px;
            cursor: pointer;
            color: #11cd55;
            background-color: #FFF;
            padding: 0px 12px 5px;
            font-size: 23px;
            border-radius: 50%;
            transition: all .1s ease-out;
        }
        #closeButton:hover{
            text-decoration: none;
            transform: scale(1.3);
        }
        .left{
            position: fixed;
            left: -5px;
            margin-top: -42px;
            cursor: pointer;
            top: 50%;
        }
        .right{
            position: fixed;
            right: -10px;
            margin-top: -42px;
            cursor: pointer;
            top: 50%;
        }
         @media (max-width: 768px) {
            #closeButton{
                /*bottom: 520px;*/
                right: -5px;
            }
        }
         @media (max-width: 430px) {
            #closeButton{
                bottom: 260px !important;
            }
        }
        @media (max-width: 375px) {
            #closeButton{
                bottom: 220px !important;
            }
        }
    `]
})
export class NgBoxComponent implements DoCheck {

    offsetHeight: number;
    interval: any;
    @Input() data: any;
    @Output() showMore = new EventEmitter();
    @ViewChild('ngBoxContent') elementView: ElementRef;
    @ViewChild('ngBoxButtons') elementButtons: ElementRef;

    constructor(
        public ngBox: NgBoxService
    ) {
    }

    ngDoCheck() {
        if (this.ngBox.open === true && this.elementView === undefined) {
            this.checkInterval();
        }
    }

    closeOutside($event) {
        if ($event.target.getAttribute('id') === 'ngBoxContent' || $event.target.getAttribute('id') === 'ngBoxWrapper') {
            this.closeNgBox();
        }
    }

    checkInterval() {
        let t = setInterval(() => {
            if (this.elementView && this.elementButtons) {
                this.resize();
                // Stop Loading on frames
                if (this.ngBox.current.type === 2 || this.ngBox.current.type === 3 || this.ngBox.current.type === 4) {
                    this.ngBox.loading = false;
                }

                clearInterval(t);
            }
        }, 10);
    }

    closeNgBox() {
        this.ngBox.open = false;
    }

    elementExist() {
        if (this.elementView !== undefined) {
            return true;
        }
        return false;
    }

    @HostListener('window:resize', ['$event'])
    resize() {
        // Resize big images

        if (this.elementView && this.elementButtons) {
            let currentWidth = this.calcPercent(this.ngBox.current.width, window.innerWidth);
            let currentHeight = this.calcPercent(this.ngBox.current.height, window.innerHeight);

            let realWidth = this.elementView.nativeElement.naturalWidth ?
                this.elementView.nativeElement.naturalWidth : currentWidth;
            let realHeight = this.elementView.nativeElement.naturalHeight ?
                this.elementView.nativeElement.naturalHeight : currentHeight;


            let maxWidth = Math.min((window.innerWidth - 70), currentWidth ? currentWidth : realWidth);
            let maxHeight = Math.min((window.innerHeight - 60), currentHeight ? currentHeight : realHeight);

            let ratio = Math.min(maxWidth / realWidth, maxHeight / realHeight);

            this.elementView.nativeElement.width = realWidth * ratio;
            this.elementView.nativeElement.height = realHeight * ratio;


            this.elementButtons.nativeElement.style.width = this.elementView.nativeElement.offsetWidth + 'px';

            // Calculate top padding
            this.offsetHeight = (window.innerHeight - 40 - this.elementView.nativeElement.offsetHeight) / 2;
            if (this.offsetHeight < 0) {
                this.offsetHeight = 0;
            }
        }
    }




    @HostListener('window:keydown', ['$event'])
    checkKeyPress(event: KeyboardEvent) {
        if (!this.ngBox.current || typeof this.ngBox.current == 'undefined') {
        return
      }
        if (event.keyCode === 39) {
            this.nextNgBox();
        } else if (event.keyCode === 37) {
            this.previousNgBox();
        } else if (event.keyCode === 27) {
            this.closeNgBox();
        }
    }

    calcPercent(value, of) {
        if (value !== undefined && value.toString().search('%') >= 0) {
            return of * parseInt(value.toString(), 0) / 100;
        }
        return value;
    }

    getHasGroup() {
        return this.ngBox.current.group !== undefined;
    }

    getCount() {
        return this.ngBox.images.filter(image => image.group === this.ngBox.current.group).length;
    }

    getCurrentIndex() {
        let currentGroup = this.ngBox.images.filter(image => image.group === this.ngBox.current.group);
        return currentGroup.map(function (e) {
            return e.id;
        }).indexOf(this.ngBox.current.id) + 1;
    }

    nextNgBox() {
        if (this.ngBox.current.group === undefined) {
            return false;
        }
        this.ngBox.loading = true;
        let currentGroup = this.ngBox.images.filter(image => image.group === this.ngBox.current.group);
        let pos = currentGroup.map(function (e) {
            return e.id;
        }).indexOf(this.ngBox.current.id);
        if (pos >= currentGroup.length - 1) {
            this.ngBox.current = currentGroup[0];
        } else {
            this.ngBox.current = currentGroup[pos + 1];
        }
        this.checkInterval();
    }

    previousNgBox() {
        if (this.ngBox.current.group === undefined) {
            return false;
        }
        this.ngBox.loading = true;
        let currentGroup = this.ngBox.images.filter(image => image.group === this.ngBox.current.group);
        let pos = currentGroup.map(function (e) {
            return e.id;
        }).indexOf(this.ngBox.current.id);
        if (pos === 0) {
            pos = currentGroup.length;
        }
        this.ngBox.current = currentGroup[pos - 1];
        this.checkInterval();
    }

    isLoaded() {
        if (this.ngBox.current.type === 1) {
            this.ngBox.loading = false;
        }

        this.checkInterval();
    }

}
