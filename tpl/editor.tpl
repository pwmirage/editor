<div>
	<div id="pw-map-canvas">
		<div id="pw-map">
			<img class="bg"></img>
		</div>
		<canvas class="dyn-canvas shown"></canvas>
		<canvas class="dyn-canvas"></canvas>
		<div class="label"></div>
	</div>
	<div id="pw-windows">
		<div id="pw-map-pos-label"></div>
		<i id="open-legend" style="display: none;" title="Map legend"></i>
	</div>
</div>

<style>
:host {
	position: relative;
}

#pw-map-canvas, #pw-windows {
	position: absolute;
	width: 100vw;
	height: calc(100vh - 50px);
	text-align: left;
}

#pw-map-canvas > * {
	transition: opacity 0.2s ease-in-out;
	opacity: 0;
}

#pw-map-canvas.shown > * {
	opacity: 1;
}

#pw-map {
	position: absolute;
	transform-origin: 0 0;
}

#pw-map-canvas > .dyn-canvas {
	position: absolute;
	transform-origin: 50% 50%;
	left: -100%;
	top: -100%;
	width: 300%;
	height: 300%;
	opacity: 0;
	transition: opacity 0.2s ease-in-out;
	transition-delay: 0.10s;
}

#pw-map-canvas > .dyn-canvas.shown {
	opacity: 1.0;
	transition: opacity 0.30s ease-in-out;
	transition-delay: 0s;
}

.label {
	display: none;
	position: absolute;
	width: auto;
	font-size: 12px;
	background-color: black;
	border-radius: 5px;
	padding: 3px 6px;
}


#pw-windows {
	pointer-events: none;
}

#pw-windows > * {
	pointer-events: all;
}

#pw-map-canvas {
	display: block;
	background-image: radial-gradient(circle, rgb(35, 31, 20) 1px, #736e66 1px);
	background-size: 10px 10px;
}

#pw-map-pos-label {
	position: absolute;
	left: 5px;
	bottom: 5px;
	width: 156px;
	height: 32px;
	padding: 5px;
	box-sizing: border-box;
	background-color: #822525;
	color: #ffffff;
	font-family: Arial, Helvetica, sans-serif;
	font-weight: bold;
	text-align: center;
}

#open-legend {
	position: absolute;
	left: 6px;
	bottom: 42px;
	background-color: #dccfcf;
	border-radius: 2px;
	border-width: 0;
	color: rgba(33, 33, 33, 1);
	cursor: pointer;
	display: inline-block;
	font-weight: 400;
	margin: 0;
	padding: 5px 10px;
	text-decoration: none;
	line-height: 1.48;
	user-select: none;
}

#open-legend:after {
	font-family: FontAwesome;
	content: '\00f278';
}

#open-legend:hover {
	background-color: rgba(156, 120, 120, 1);
	color: rgba(255, 255, 255, 1);
	text-decoration: none;
}

.window {
	position: absolute;
}

@keyframes showCurtain {
	0% { transform: scaleY(0); }
	100% { transform: scaleY(1); }
}

@keyframes hideCurtain {
	0% { transform: scaleY(1); }
	100% { transform: scaleY(0) }
}

@keyframes stretchHeigh {
	0%, 40%, 100% { transform: scaleY(0.05); }
	20% { transform: scaleY(1); }
}

@keyframes fadeIn {
	0% { opacity: 0; }
	100% { opacity: 1; }
}

@keyframes fadeOut {
	0% { opacity: 1; }
	100% { opacity: 0; }
}

#curtain.showCurtain, #curtain.hideCurtain { display: block; }
#curtain.showCurtain > #loader { animation: fadeIn 0.2s linear both; }
#curtain.hideCurtain > #loader { animation: fadeOut 0.2s linear both; }
#curtain.showCurtain > #loader > div { animation: stretchHeigh 0.8s infinite ease-in-out; }
#curtain.showCurtain > .curtain { animation: showCurtain 250ms ease-in-out both; }
#curtain.hideCurtain > .curtain { animation: hideCurtain 250ms ease-in-out both; animation-delay: 0.2s; }

#curtain .top {
	top: 0;
	transform-origin: 0 0;
}

#curtain .bottom {
	bottom: 0;
	transform-origin: 0 100%;
}

#curtain > div {
	z-index: 100;
}
</style>
