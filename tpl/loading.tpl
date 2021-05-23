<div id="content">
	<div id="labels"></div>
	<div id="curtain" class="">
		<div id="loader">
			<div class="bar1"></div>
			<div class="bar2"></div>
			<div class="bar3"></div>
			<div class="bar4"></div>
			<div class="bar5"></div>
			<div class="bar6"></div>
		</div>

		<div id="messages"></div>

		<div class="curtain top"></div>
		<div class="curtain bottom"></div>
	</div>
</div>

<style>
#content{
	position: relative;
}

#labels {
	position: fixed;
	z-index: 100;
	bottom: 60px;
	left: 40px;
	display: flex;
	flex-direction: column-reverse;
}

#labels > * {
	color: #FFF;
	background-color: #0096aa;
	display: inline-block;
	margin-top: 5px;
	overflow-y: hidden;
	transform: skew(-20deg) translate(100px, 0);
	max-height: 30px;
	transition: transform 0.5s, opacity 0.5s, max-height 0.5s, margin-top 0.5s;
	opacity: 0;
	width: 400px;
	text-align: left;
}

#labels > .appear {
	opacity: 1;
	transform: skew(-20deg) translate(0px, 0);
}

#labels > .done {
	background-color: green;
}

#labels > .done:after {
	position: absolute;
	font-family: FontAwesome;
	content: '\00f00c';
	right: 10px;
	top: 5px;
	color: white;
}

#labels > .removing {
	max-height: 0px;
	margin-top: 0;
	opacity: 0;
	transform: skew(-20deg) translate(100px, 0);
}

#labels > * > p {
	transform: skew(20deg);
	position: relative;
	margin: 4px 6%;
	padding: 0;
}

#labels > .error {
	background-color: rgba(169, 68, 66, 1);
}

#labels > .warning {
	background-color: #bb9107;
}

#curtain{
	position: absolute;
	width: 100%;
	height: calc(100vh - 50px);
	display: none;
	z-index: 99;
}

#curtain > .curtain {
	height: 50%;
	background-color: #1c2020;
}

#curtain > .curtain.top { border-bottom: 1px solid #5d5d5d; }

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
#curtain.forceShowCurtain > .curtain { animation: none !important; }
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

#loader {
	margin: 0 auto;
	width: 60px;
	height: 50px;
	text-align: center;
	font-size: 10px;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translateY(-50%) translateX(-50%);
	opacity: 0;
}

#loader > div {
	height: 100%;
	width: 8px;
	display: inline-block;
	float: left;
	margin-left: 2px;
}

#loader .bar1 {
	background-color: #754fa0;
}

#loader .bar2 {
	background-color: #09b7bf;
	animation-delay: -0.7s !important;
}

#loader .bar3 {
	background-color: #90d36b;
	animation-delay: -0.6s !important;
}

#loader .bar4 {
	background-color: #f2d40d;
	animation-delay: -0.5s !important;
}

#loader .bar5 {
	background-color: #fcb12b;
	animation-delay: -0.4s !important;
}

#loader .bar6 {
	background-color: #ed1b72;
	animation-delay: -0.3s !important;
}
</style>
