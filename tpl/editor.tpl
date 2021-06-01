<script id="tpl-editor" type="text/x-dot-template">

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
	<div id="pw-overlay">
		<span id="pw-version"></span>
		<div id="pw-map-info">
			<div id="map-static-info" style="display: flex; flex-direction: column; row-gap: 6px; font-size: 10.5pt;">
				<div id="select-menu" style="display: none;">
					<span class="count"></span> spawners
				</div>
				<div style="display: flex; column-gap: 6px;">
					<i id="open-legend" title="Map legend"></i>
					<div id="pw-project-info"></div>
				</div>
				<div style="display: flex; column-gap: 6px;">
					<div id="pw-map-pos-label">X: 0, Y: 0</div>
					<div id="map-name"></div>
				</div>
			</div>
			<div id="changed-objects-container">
				<div style="display: flex;">
					<div style="flex: 1;"></div>
					<div id="more-objects">+ more</div>
				</div>
				<div id="changed-objects"></div>
			</div>
		</div>
		<div id="project-info" class="{if !$project}collapsed{/if}">
			<div class="contents" style="position: relative;">
			<div class="scroll">
			{if $project}
				<div>
					<div>{@$project.name} #{@$project.id}
						{assign type = Projects.type.find(t => t.id == $project.type)}
						<div style="float: right;" class="badge {@$type.color}">{@$type.name}</div>
					</div>
					<div>by <a class="externalURL" href="http://miragetest.ddns.net/user/{@$project.author_id}" target="_blank">{@$project.author}</a></div>
					<div>
						Status:&nbsp;
						{assign status = Projects.status.find(s => s.id == $project.status)}
						<div class="badge {@$status.color}">{@$status.name}</div>
					</div>
					<div class="review-status" style="margin-top: 4px;">
						<div class="minus">-1 by Beta</div>
						<div class="plus">+1 by Someone</div>
					</div>
					<div style="margin-top: 10px;">
						<label>
							<input type="checkbox" id="showOnlyLatestComments" checked oninput="Editor.hide_previous_comments(this.checked);">
							<span>Hide comments from previous revisions</span>
						</label>
					</div>
				</div>
				{for entry of $project.log}
					<div class="log" data-type="{@$entry.actionID}" data-param1="{@$entry.param1}">
						<div style="float:right;">
							{@Projects.DateUtil.getTimeElement(new Date($entry.time * 1000)).outerHTML}
						</div>
						<div><a class="externalURL" href="http://miragetest.ddns.net/user/{@$entry.userID}" target="_blank">{@$entry.username}</a></div>
						{if $entry.type == 0 && $entry.param1 != 0}
							<div class="review-status" style="margin-top: 4px;">
								{if $entry.param1 < 0}
									<div class="minus">Review -1</div>
								{else}
									<div class="plus">Review +1</div>
								{/if}
							</div>
						{else if $entry.type == 1}
							<div>
								Published revision {@$entry.param1}
							</div>
						{/if}
						<div>
							{@escape($entry.text).replaceAll('\n', '<br>')}
						</div>
					</div>
				{/for}
				<div id="post_comment" class="collapsed" style="margin-top: auto;">
					<span class="header" onclick="this.parentNode.classList.toggle('collapsed');">Post comment</span>
					<div class="votes" style="display: flex; column-gap: 20px;">
						<label>
							<input type="radio" name="vote" value="-1">
							Vote -1
						</label>
						<label>
							<input type="radio" name="vote" value="0" checked>
							Don't vote
						</label>
						<label>
							<input type="radio" name="vote" value="+1">
							Vote +1
						</label>
					</div>
					<textarea style="width: 100%; min-height: 100px; max-height: 600px; resize: none;" oninput="this.style.height = ''; this.style.height = this.scrollHeight +'px'"></textarea>
					<a class="button buttonPrimary" style="float: right; float: right; margin-top: 6px; font-size: 12px; padding: 4px 9px;" href="javascript:void(0);" onclick="Editor.add_comment(this);">Post comment</a>
				</div>
			{/if}
			</div>
			<div id="project-info-expand" onclick="Editor.map_shadow.querySelector('#project-info').classList.toggle('collapsed')"></div>
			</div>
		</div>
		<div id="rotate-circle" style="display: none;">
			<div class="dot"></div>
		</div>
	</div>
	<div id="pw-loading">
		<div class="loading-spinner"></div>
	</div>
	<div id="pw-windows"></div>
</div>

{@@
<style>
:host {
	position: relative;
	color: white;
}

#pw-overlay {
	font-family: Verdana;
	font-size: 10pt;
}

#map-static-info > *,
#changed-objects > *,
#more-objects {
	pointer-events: all;
}

#rotate-circle {
	position: absolute;
	top: 0;
	left: 0;
	width: 200px;
	height: 200px;
	border-radius: 50%;
	background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='100' ry='100' stroke='white' stroke-width='4' stroke-dasharray='2%2c 8' stroke-dashoffset='3' stroke-linecap='round'/%3e%3c/svg%3e");
	margin-left: -100px;
	margin-top: -100px;
	pointer-events: none !important;
}

#rotate-circle > .dot {
	position: relative;
	width: 20px;
	height: 20px;
	border-radius: 50%;
	border: 1px solid white;
	background-color: #000;
	margin-top: -10px;
	margin-left: 88px;
	pointer-events: all !important;
	cursor: pointer;
	transform-origin: 11px 109px;
}

#rotate-circle > .dot:after {
	content: '';
	position: absolute;
	top: 20px;
	left: 9px;
	width: 0;
	height: 85px;
	border-left: 2px dotted white;
}

#pw-map-canvas, #pw-overlay, #pw-windows, #pw-loading {
	position: absolute;
	top: 0;
	width: 100vw;
	height: calc(100vh - 50px);
	text-align: left;
}

#project-info {
	pointer-events: all;
	position: absolute;
	top: 0;
	left: 0;
	width: 353px;
	height: calc(100vh - 50px);
	background: #ececec;
	color: black;
	margin-left: 0;
	transition: margin-left 0.3s;
	border-right: 3px solid #dccfcf;
	font-family: "Open Sans", Arial, Helvetica, sans-serif;
}

#project-info.collapsed {
	margin-left: -350px;
}

#project-info > .contents {
	height: 100%;
}

#project-info .scroll {
	overflow-x: hidden;
	overflow-y: auto;
	padding: 10px 8px;
	display: flex;
	flex-direction: column;
	row-gap: 5px;
	min-height: 100%;
	height: 100%;
}

#project-info .scroll > * {
	background-color: white;
	box-shadow: 0px 0px 2px 0px rgb(0 0 0 / 10%);
	padding: 5px 8px;
}

#project-info .review-status {
	display: flex;
	flex-wrap: wrap;
	column-gap: 3px;
}

#project-info .review-status > * {
	padding: 2px 4px;
	background: #ececec;
	border: 1px solid #cacaca;
	border-radius: 2px;
	width: max-content;
	position: relative;
}

#project-info .review-status > *:after {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(255, 0, 0, 0.2);
	pointer-events: none;
}

#project-info .review-status > .plus:after {
	background: rgba(0, 255, 0, 0.2);
}

#project-info input {
	vertical-align: top;
}

#project-info .votes label {
	padding: 4px;
}

#project-info #post_comment.loading-spinner {
	position:relative;
}

#project-info #post_comment.collapsed {
	min-height: 30px;
	max-height: 30px;
	overflow: hidden;
}

#project-info #post_comment > .header {
	cursor: pointer;
}

#project-info #post_comment > .header:hover {
	text-decoration: underline;
}

#project-info #post_comment.loading-spinner:after {
	content: '';
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background: #000;
	opacity: 0.2;
}

#project-info #project-info-expand {
	position: absolute;
	left: 0;
	top: 50px;
	margin-left: calc(100% + 3px);
	width: 39px;
	height: 40px;
	background-color: #dccfcf;
	border-radius: 5px;
	border-bottom-left-radius: 0;
	border-top-left-radius: 0;
	border-width: 0;
	color: rgba(33, 33, 33, 1);
	cursor: pointer;
	padding-top: 4px;
	padding-left: 8px;
}

#project-info-expand:after {
	font-family: FontAwesome;
	font-size: 22px;
	content: '\\00f02d';
}

#project-info #project-info-expand:hover {
	background-color: rgba(156, 120, 120, 1);
	text-decoration: none;
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
	user-select: none;
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

#pw-map-canvas > .label {
	display: none;
	position: absolute;
	width: auto;
	font-size: 12px;
	background-color: black;
	border-radius: 5px;
	padding: 3px 6px;
}


#pw-overlay,
#pw-windows {
	pointer-events: none;
}

#pw-windows > * {
	pointer-events: all;
}

#pw-windows.force-map-focus > *:not(.unforce-map-focus) {
	opacity: 0.2;
	pointer-events: none;
}

#pw-map-canvas {
	display: block;
	background-image: radial-gradient(circle, rgb(35, 31, 20) 1px, #736e66 1px);
	background-size: 10px 10px;
}

#pw-map-pos-label {
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

#pw-map-info {
	position: absolute;
	bottom: 0;
	box-sizing: border-box;
	color: #ffffff;
	display: flex;
	column-gap: 8px;
	width: 100%;
	padding: 6px;
	align-items: flex-end;
}

#map-name {
	display: flex;
	column-gap: 8px;
	justify-content: flex-end;
	align-items: flex-end;
	text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
	font-family: Arial, Helvetica, sans-serif;
	font-weight: bold;
	text-align: center;
	line-height: 34px;
	white-space: pre;
}

#changed-objects-container {
	position: absolute;
	left: 360px;
	width: calc(100vw - 370px);
}

#changed-objects {
	display: flex;
	flex: 1;
	flex-wrap: wrap-reverse;
	column-gap: 5px;
	align-items: baseline;
	margin-top: -3px;
	max-height: 86px;
	overflow: hidden;
}

#more-objects,
#changed-objects > div {
	background-color: #dccfcf;
	border-radius: 2px;
	border-width: 0;
	color: rgba(33, 33, 33, 1);
	cursor: pointer;
	display: flex;
	font-weight: 400;
	margin: 0;
	padding: 4px;
	padding-right: 6px;
	text-decoration: none;
	line-height: 1.48;
	user-select: none;
	column-gap: 3px;
	max-width: 150px;
	height: 32px;
	margin-top: 5px;
	overflow: hidden;
	box-sizing: initial;
	min-width: initial;
}

#more-objects:hover,
#changed-objects > div:hover {
	background-color: rgba(156, 120, 120, 1);
	color: rgba(255, 255, 255, 1);
	text-decoration: none;
}

#more-objects {
	display: none;
	line-height: 31px;
	min-width: 75px;
	text-align: center;
	overflow: hidden;
	margin-bottom: 7px;
}

#changed-objects > div > img {
	width: 32px;
	height: 32px;
	box-sizing: initial;
	min-width: initial;
}

#changed-objects > div > span {
	align-self: center;
	line-height: 16px;
	overflow: hidden;
	margin: auto;
}

#pw-version {
	position: absolute;
	right: 6px;
	bottom: 6px;
	display: block;
	font-size: 10.5pt;
	line-height: 36px;
	align-self: flex-start;
	margin-bottom: -10px;
	flex: 1;
	text-align: right;
	box-sizing: border-box;
	color: #ffffff;
	text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
	font-family: Arial, Helvetica, sans-serif;
	font-weight: bold;
	white-space: pre;
}

#pw-project-info {
	line-height: 15px;
	box-sizing: border-box;
	color: #ffffff;
	text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
	font-family: Arial, Helvetica, sans-serif;
	font-weight: bold;
	text-align: left;
}

#open-legend {
	width: fit-content;
	height: fit-content;
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
	content: '\\00f278';
}

#open-legend:hover {
	background-color: rgba(156, 120, 120, 1);
	color: rgba(255, 255, 255, 1);
	text-decoration: none;
}


#select-menu {
	width: fit-content;
	display: block;
	background-color: rgba(207, 69, 69, 1);
	color: rgba(255, 255, 255, 1);
	text-transform: uppercase;
	cursor: pointer;
	padding: 8px 18px;
	user-select: none;
	border-radius: 2px;
	font-size: 10pt;
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

#pw-loading {
	display: none;
	top: 40%;
}

#pw-loading:before {
	content: '';
	width: 300vw;
	height: 300vh;
	position: absolute;
	left: -100vw;
	top: -100vh;
	background: #000;
	opacity: 0.5;
	user-events: none;
}

#pw-loading > .loading-spinner:before {
	width: 40px;
	height: 40px;
	border-top-color: white;
}

.gpu {
	will-change: transform;
}
</style>
@@}

</script>
