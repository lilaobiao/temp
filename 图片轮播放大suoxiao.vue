<template>
    <div 
        class="media-preview-container"
        tabindex="-1"
        touch-action="none"
    >
        <div
            ref="displayContainer"
            class="media-preview-canvas"
            style="padding-bottom: 100px;background:rgba(0,0,0,.2)"
        >
            <div
                ref="mediaInner"
                class="inner"
                @wheel="handleWheel"
            >
                <span
                    class="media-preview-btn media-preview-btn-left"
                    @click="handlePrev"
                />
                <span
                    class="media-preview-btn media-preview-btn-right"
                    @click="handleNext"
                />
                <video
                    v-if="mediaType === 'video'"
                    id="chartVideoPoster"
                    ref="displayVideo"
                    :src="currentMedia.src"
                    :autoplay="configs.videoAutoPlay"
                    width="auto"
                    height="auto"
                    controls="controls"
                    controlslist="nodownload nofullscreen"
                    crossorigin="Anonymous"
                />
                <img
                    v-else
                    ref="displayImg"
                    :src="currentMedia.src"
                    @mousedown="handleMousedown"
                    @mousemove="handleMousemove"
                    @mouseup="handleMouseup"
                >
            </div>
        </div>
        <div class="media-preview-footer">
            <div class="media-preview-navbar">
                <ul
                    class="media-preview-list media-preview-transition"
                    role="navigation"
                    style=""
                >
                    <li
                        v-for="(item, index) in mediaList"
                        :key="index"
                        :tabindex="index"
                        :class="{'media-preview-active': currentMedia.index__ === item.index__}"
                        @click="displayItem(item)"
                    >
                        <video
                            v-if="mediaType === 'video'"
                            :src="item.src"
                            width="120px"
                            height="100px"
                            controlslist="nodownload nofullscreen"
                            crossorigin="Anonymous"
                        />
                        <img
                            v-else
                            :src="item.src"
                            :data-original-url="item.src"
                            @load="event => handleLoadImg(event, item)"
                        >
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
    const initDisplayInfo = {
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0
    }
    const simpleThrottle = function(fn, interval){
        const $self = fn;
        let timer = null;
        let firstTime = true;
        return function(...args){
            const that = this;
            if(firstTime){
                $self.apply(that, args);
                return firstTime = false;
            }
            if(timer){
                return false;
            }
            //先执行了一次，firstTime是false,然后500毫秒之后利用定时器再次执行。
            timer = setTimeout(function(){
                clearTimeout(timer);
                timer = null;
                $self.apply(that,args);
            }, interval || 300);
        };
    };
    export default {
        props: {
            mediaType: {
                type: String,
                default: 'img',
            },
            dataList: {
                type: Array,
                default: () => []
            },
            options: {
                type: Object,
                default: () => ({})
            },
        },
        data() {
            return {
                currentMedia: {
                    src: '',
                    viewData: {
                        ...initDisplayInfo
                    }
                },
                mediaList: [],
                mounted: false,
                el: null,
                elImg: null,
                elVideo: null,
                // 控制变量
                wheeling: false,
                wheelSplit: 50,
                mouseDownFlag: false,
                configs: {
                    videoAutoPlay: 'autoplay',
                    mouseWheelAction: 'changeItem',
                    // 以下属性针对图片查看
                    scale: true,
                    keepState: false, // 切换之后是否保存之前的状态
                }
            };
        },
        computed:{
            currentMediaName(){
                return this.currentMedia.name || this.currentMedia.src;
            },
            autoPlay(){
                if(this.configs.videoAutoPlay === 'autoplay' || this.configs.videoAutoPlay === true){
                    return 'autoplay';
                }else{
                    return false;
                }
            }
        },
        watch: {
            dataList:{
                handler(newValue){
                    if(newValue.length){
                        this.mediaList = newValue.map((item, index) => {
                            return {
                                ...item,
                                index__: index,
                                // 缩放和拖拽参数
                                viewData: {}
                            };
                        });
                        if(this.mounted){
                            // this.currentMedia = this.mediaList[0];
                            this.displayItem(this.mediaList[0]);
                        }
                    }
                },
                immediate: true
            },
            options: {
                handler(newValue){
                    this.configs = Object.assign(this.configs, newValue);
                },
                immediate: true
            }
        },
        created(){
            this.imageData = {
                ...initDisplayInfo,
                width: 0,
                height: 0,
                aspectRatio: 1,//aspectRatio,
                naturalWidth: 1,//naturalWidth,
                naturalHeight: 1,//naturalHeight
            };
            this.mouseData = {
                startX: 0,
                startY: 0,
            }
        },
        mounted(){
            const el = this.$refs.displayContainer;
            this.el = el;
            this.container = {
                width: el.clientWidth,
                height: el.clientHeight
            };
            if(this.$refs.displayImg){
                this.elImg = this.$refs.displayImg;
                // 过滤掉dragstart 和 dragmove，否则监听不了 mouseup 事件
                this.elImg.ondragstart = function(){return false};
                this.elImg.ondragmove = function(){return false};
                this.elImg.onmouseout = this.elImg.onmouseleave = this.handleMouseup.bind(this);
            }
            if(this.$refs.displayVideo){
                this.elVideo = this.$refs.displayVideo;
            }
            this.throttleResize = simpleThrottle(this.handleResize, 100);
            window.addEventListener('resize', this.throttleResize);
            this.handleResize();
            // 标记为可以展示媒体
            this.mounted = true;
            if(this.mediaList.length){
                this.displayItem(this.mediaList[0]);
            }
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.throttleResize);
            this.closeVideo();
        },
        methods: {
            displayItem(item){
                console.log(item);
                // 如果不需要保存状态，在切换前先重置状态
                if(this.mediaType === 'img' && !this.configs.keepState){
                    this.resetImgDisplay(this.currentMedia);
                }
                this.currentMedia = item;
                if(this.mediaType === 'video' && this.autoPlay){
                    this.$refs.video.play();
                }else if(this.mediaType === 'img'){
                    this.$nextTick(() => {
                        const el = this.$refs.displayImg;
                        item.viewData.width = el.clientWidth;
                        item.viewData.height = el.clientHeight;
                        console.log(el.clientWidth);
                        console.log(el.clientHeight);
                        this.setImgTransformStyle();
                    });
                }
            },
            closeVideo(){
                if(this.$refs.video){
                    this.$refs.video.pause();
                }
            },
            playVideo(){
                if(this.$refs.video){
                    this.$refs.video.play();
                }
            },
            handleResize(){
                const el = this.$refs.mediaInner;
                const child = el.childNodes[0];
                if(child && child.nodeName === 'VIDEO'){
                    child.style.height = el.clientHeight + 'px';
                }
                this.container = {
                    width: this.el.clientWidth,
                    height: this.el.clientHeight
                };
            },
            handleNext(){
                let index = this.currentMedia.index__ + 1;
                if(index >= this.mediaList.length){
                    index = 0;
                }
                this.displayItem(this.mediaList[index]);
            },
            handlePrev(){
                let index = this.currentMedia.index__ - 1;
                if(index < 0){
                    index = this.mediaList.length - 1;
                }
                this.displayItem(this.mediaList[index]);
            },
            handleLoadImg(event, item){
                const image = event.target;
                item.viewData = Object.assign({}, this.imageData, {
                    naturalWidth:  image.naturalWidth,
                    naturalHeight: image.naturalHeight,
                })
                item.naturalWidth = image.naturalWidth;
                item.naturalHeight = image.naturalHeight;
            },
            // 鼠标滚动监听
            handleWheel(event){
                event.preventDefault();
                // Limit wheel speed to prevent zoom too fast
                if (this.wheeling) {
                    return;
                }
                this.wheeling = true;
                setTimeout(() => {
                    this.wheeling = false;
                }, this.wheelSplit);
                let delta = 1;
                console.log(event);
                if (event.deltaY) {
                    delta = event.deltaY > 0 ? 1 : -1;
                    console.log('deltaY');
                } else if (event.wheelDelta) {
                    delta = -event.wheelDelta / 120;
                    console.log('wheelDelta');
                } else if (event.detail) {
                    delta = event.detail > 0 ? 1 : -1;
                    console.log('detail');
                }
                console.log(-delta);
                if(this.configs.scale){
                    this.zoom(delta, event);
                }else{
                    if(delta > 0){
                        this.handleNext();
                    }else if(delta < 0){
                        this.handlePrev();
                    }
                }
            },
            // 鼠标按下
            handleMousedown(e){
                this.mouseDownFlag = true;
                this.mouseData.startX = e.clientX;
                this.mouseData.startY = e.clientY;
                this.elImg.style.transition = '';
            },
            // 鼠标移动
            handleMousemove(e){
                if(!this.mouseDownFlag) return;
                let deltaX = e.clientX - this.mouseData.startX;
                let deltaY = e.clientY - this.mouseData.startY;
                this.mouseData.startX = e.clientX;
                this.mouseData.startY = e.clientY;
                this.currentMedia.viewData.x = this.currentMedia.viewData.x + deltaX;
                this.currentMedia.viewData.y = this.currentMedia.viewData.y + deltaY;
                this.setImgTransformStyle();
            },
            // 鼠标抬起
            handleMouseup(){
                this.mouseDownFlag = false;
                this.elImg.style.transition = 'all 0.3s linear';
            },
            // 控制缩放，移动，旋转
            zoom(scaleSize, originalEvent = null) {
                const cm = this.currentMedia;
                const {x, y, scale} = cm.viewData;
                let lastRatio = scale + (scaleSize * 0.1);
                if(lastRatio < 0.2) lastRatio = 0.2;
                if(lastRatio > 5) lastRatio = 5;
                cm.viewData.scale = lastRatio;
                this.setImgTransformStyle();
            },
            // 设置图片变换
            setImgTransformStyle(clear = false){
                if(clear){
                    this.elImg.style.transform = '';
                }else{
                    const {
                        scale = 1,
                        x = 0,
                        y = 0
                    } = this.currentMedia.viewData;
                    let style = `scale(${scale}) translateX(${x}px) translateY(${y}px)`;
                    this.elImg.style.transform = style;
                }
            },
            // 重置显示信息
            resetImgDisplay(item){
                item.viewData = Object.assign(item.viewData, initDisplayInfo);
            },
        }
    };
</script>

<style lang="scss" scoped>
.media-preview-container {
	position:relative;
	width:100%;
	height:100%;
	direction:ltr;
	font-size:0;
	line-height:0;
	overflow:hidden;
	-webkit-tap-highlight-color:transparent;
	-ms-touch-action:none;
	touch-action:none;
	-webkit-touch-callout:none;
	-webkit-user-select:none;
	-moz-user-select:none;
	-ms-user-select:none;
	user-select:none;
}
.media-preview-container::-moz-selection,
.media-preview-container *::-moz-selection {
	background-color:transparent;
}
.media-preview-container::selection,
.media-preview-container *::selection {
	background-color:transparent;
}
.media-preview-container:focus {
	outline:0;
}
.media-preview-canvas {
	bottom:0;
	left:0;
	overflow:hidden;
	position:absolute;
	right:0;
	top:0;
	box-sizing:border-box;
	text-align:center;
}
.media-preview-canvas > .inner {
	position:relative;
	height:100%;
	display:flex;
	align-items:center;
}
.media-preview-canvas > .inner img {
	display:inline-block;
	height:auto;
	margin:15px auto;
	width:auto;
	max-width:100%;
	max-height:100%;
    transform:translateZ(0);
    transition:all .3s linear;
}
.media-preview-canvas > .inner video {
	margin:0 auto;
}
.media-preview-btn {
	position:absolute;
	top:50%;
    z-index:2;
	margin-top:-30px;
	display:inline-block;
	width:60px;
	height:60px;
	background-color:rgba(0,0,0,.5);
	background-repeat:no-repeat;
	border-radius:30px;
	opacity:0.4;
	transition:opacity 0.3s;
	cursor:pointer;
}
.media-preview-btn-left {
	left:5px;
	background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAACYUlEQVRoQ+2Yu2sWQRTFf6dTEGwESzvt1EIQxU4RbXwFEdIloCgKFqYQFKKilSiC4AN8dQGLICiIWIiCluIDC7HQyhf+CcKRgQ18hGTn8u1k3Q922j2z9/zm3jszu2LEh0bcPz3A/85gn4E+Aw1XoC+hhgvYeHrrGbC9EdgHfAJeSPrThKJVANs3gaMDhj8DU5KeDAvRGoDtZDwBzB/fgV2SPg4D0QqA7a3A6xqDNyQd7ySA7TXAt4y5GUnjnQOwvRz4DazImDsv6VwXAVLZpPKpG6kHNkn60SmABXacxfxNSHowjPk0Z0ma2PYZ4GLA1FlJlwK6RSXFAWwfAW4HTN2SdCygq5UUBbC9H5gNmHoMHJD0N6BtB8D2NuBpYMd5C4xJym2tIbYiGbC9GngJrMtE/VWZrzvUQsbnRKUApoDLgciHJD0M6MKSUgDvgfWZqKckXQ07CwpLAbwBtmRiplvnlaCvsKwUwCRwNxB1XNJMQBeWlAJYVd0212Yip3vRQUmvwg4zwiIAKYbt7UD6MFmWifmuOgO+loAoBlBBTAD3AsbSebGnUwfZnGnb6Vo8HYC4I+lwQNfOSTwYxXZq6NTYuTEt6UJOVPe8aAnNg3gO7AiYm5R0P6BbULJkAFVPpL8OuZ2pmx80FcBK4GdgZ+rmJ2UFsQFIW2fdmJU0NkwZLWkJDexMe4FHNQa7m4EBiJPAtQUg0hV7p6QPnc3AAMQJ4PqA0dTkpyXVZaf9c6Auou3NwG7gC/BspH7uDlMiuTmtNHHORJPnPUCT1Ssxt89AiVVs8o4+A01Wr8Tckc/APxIzpDGQ1qgcAAAAAElFTkSuQmCC);
    background-position:2px center;
}
.media-preview-btn-right {
	right:5px;
	background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAACZ0lEQVRoQ+2YPWtVQRCGnxcRUlgIKoiNCKkCoiIKon9AiR/42YkosbCR2IggarCx8QPBQjHYil/R+AeChU0EG7WRVKIQC7WxsBpZWEEw9+6cc+bEGzhbvzvzPjN7Z/dcscSXlrh/OoD/3cGuA10HGlagO0INC9h4e2gHzGwrMAIsA6YlfWvssBAgDMDM7gKn/8r3CTguaaZNiBAAMzsBPOhhdFjSXFsQUQBvgHR8eq0hSb/agIgC+Ays62NwTtLwIANMA3sLBqckHYyGiOrAKPDSYW5C0hWHzi0JAUjZzOw6cM6ReUzSfYfOJQkDyBAPgWOOzAckvXDoipJogFXAc2BXMTPslPTaoesrCQXIXdgETAEbCubS3bBb0scmEOEAGWJP7sTygrlXwH5JP+pCtAKQIcaAew5jTyUddugWlLQGkCEmgEsOc9skpdu88moVIEOkkXmq4Oy2pLOV3UP7/0qY2SRwsmDumqQLAwdgZleBiw5jGyW9c+j+kbR2hMzsDHDHYWrwfsRmtg94ApTG6CwwKumrA3RxppCZbckX2fqCqflsvtb0+RM79AiZ2er0LQzscFT0kKRnDt3iPSXM7DHguZTGJd1qaj7tD+uAmd0Axh2mbkryPLsdoYIAzOwI8MiRsdHEWSh+SAfMLD2LS+d+VtJ2B2QlSRTAd2Bln8zzktZWcuYURwG8BTb3yblC0k+np0qyKID0oX65R+bazwQPSQhAfnUmiPPAUE78Hjgq6YPHSF1NGECGWAOkifQFmGnypeUFCgXwJo3UdQCR1awTq+tAnapF7uk6EFnNOrG6DtSpWuSe37+qnTEsi4ysAAAAAElFTkSuQmCC);
	background-position:6px center;
}
.media-preview-canvas > .inner:hover .media-preview-btn {
	opacity:0.8;
}
.media-preview-footer {
	bottom:0;
	left:0;
	overflow:hidden;
	position:absolute;
	right:0;
	text-align:center;
}
.media-preview-navbar {
	background-color:rgba(0,0,0,0.5);
	overflow:hidden;
	overflow-x:auto;
}
.media-preview-list {
	-webkit-box-sizing:content-box;
	box-sizing:content-box;
	height:100px;
	margin:0;
	padding:1px 0;
	text-align:center;
	font-size:0;
	white-space:nowrap;
}
.media-preview-list > li {
	color:transparent;
	display:inline-block;
	line-height:0;
	opacity:0.5;
	overflow:hidden;
	-webkit-transition:opacity 0.15s;
	transition:opacity 0.15s;
	align-items:center;
	background:#000;
	cursor:pointer;
}
.media-preview-list > li img {
	width:100px;
	height:100px;
	margin-left:0;
	margin-right:0;
}
.media-preview-list > li video {
	width:120px;
	height:100px;
	transform:scale(2);
}
.media-preview-list > li:focus,
.media-preview-list > li:hover {
	opacity:0.75;
}
.media-preview-list > li:focus {
	outline:0;
}
.media-preview-list > li + li {
	margin-left:1px;
}
.media-preview-list > .media-preview-loading {
	position:relative;
}
.media-preview-list > .media-preview-loading::after {
	border-width:2px;
	height:20px;
	margin-left:-10px;
	margin-top:-10px;
	width:20px;
}
.media-preview-list > .media-preview-active,
.media-preview-list > .media-preview-active:focus,
.media-preview-list > .media-preview-active:hover {
	opacity:1;
}
</style>
