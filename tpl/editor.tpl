<div>
	<div id="pw-map-canvas">
		<div id="pw-map" class="gpu">
			<img class="bg"></img>
		</div>
		<canvas class="dyn-canvas shown gpu"></canvas>
		<canvas class="dyn-canvas gpu"></canvas>
		<canvas id="quick-canvas"></canvas>
		<div class="label"></div>
	</div>
	<div id="pw-windows">
		<div id="pw-map-pos-label">X: 0, Y: 0</div>
		<div id="pw-map-info"></div>
		<div id="pw-project-info"></div>
		<i id="open-legend" title="Map legend"></i>
		<div id="select-menu" style="display: none;">
			<span class="count"></span> spawners
		</div>
		<div id="pw-version"></div>
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
	display: none;
}

#pw-map-canvas.shown > * {
	display: block;
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
	transition-delay: 0.05s;
}

#pw-map-canvas > .dyn-canvas.shown {
	opacity: 1.0;
	transition: opacity 0.25s ease-in-out;
	transition-delay: 0s;
}

#pw-map-canvas > #quick-canvas {
	display: block;
	position: absolute;
	left: 0;
	top: 0;
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

#pw-map-pos-label:empty {
	display: none;
}

#pw-version {
	position: absolute;
	right: 5px;
	bottom: 3px;
	box-sizing: border-box;
	color: #ffffff;
	text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
	font-family: Arial, Helvetica, sans-serif;
	font-weight: bold;
	text-align: center;
}

#pw-map-info {
	position: absolute;
	left: 168px;
	bottom: 12px;
	box-sizing: border-box;
	color: #ffffff;
	text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
	font-family: Arial, Helvetica, sans-serif;
	font-weight: bold;
	text-align: center;
}

#pw-project-info {
	position: absolute;
	left: 48px;
	bottom: 42px;
	line-height: 15px;
	box-sizing: border-box;
	color: #ffffff;
	text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
	font-family: Arial, Helvetica, sans-serif;
	font-weight: bold;
	text-align: left;
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

#select-menu {
	display: block;
	position: absolute;
	right: 6px;
	bottom: 24px;
	background-color: rgba(207, 69, 69, 1);
	color: rgba(255, 255, 255, 1);
	text-transform: uppercase;
	cursor: pointer;
	padding: 8px 18px;
	user-select: none;
	border-radius: 2px;
}

#select-menu:hover {
	background-color: rgba(172, 56, 56, 1);
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

.gpu {
	will-change: transform;
}
</style>
