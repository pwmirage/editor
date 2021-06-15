<script id="tpl-history" type="text/x-dot-template">
<div class="window resizable" style="width: 800px; height: 600px;">
<div class="header">
	<span>Project: {@Editor.current_project?.name ?? '(none)'} #{@Editor.current_project?.id || 0}</span>
	<div class="menu">
		<i class="refresh fa fa-refresh"></i>
	</div>
	<div class="menu">
		<i class="minimize fa"></i>
		<i class="maximize fa"></i>
		<i class="close fa fa-close"></i>
	</div>
</div>
<div class="content flex-rows" style="overflow: hidden; padding: 0;">
	<div id="changes" class="changes">
		<div id="changed-objects"></div>
	</div>
</div>
</div>

{@@
<style>
.tabs {
	border-bottom: 1px solid #e0b0b0;
	margin: 0 -6px;
	padding: 0 6px;
}

.tabs > .tab {
	background-color: #dddddd;
	padding: 4px 10px;
	vertical-align: baseline;
	border: 1px solid #e0b0b0;
	margin-bottom: -1px;
	cursor: pointer;
}

.tabs > .tab.active {
	background-color: #fafafa;
	border-bottom: 1px solid #fafafa;
}

.tabcontents {
	overflow: hidden;
}

.tabcontents > *:not(.active) {
	display: none;
}

.history {
	display: flex;
	flex-direction: column-reverse;
	overflow-y: auto;
	overflow-x: hidden;
	height: 100%;
	font-size: 13px;
	line-height: 15px;
}

.collapsible {
	padding: 4px 4px;
	border-bottom: 2px solid #c5c5c5;
}

.collapsible:hover {
    background-color: #dadada;
}

.collapsible + * {
	padding: 0;
}

.collapsible.active + * {
	border-bottom: 2px solid #c5c5c5;
}

.block {
	display: flex;
	flex-direction: column;
	padding: 2px 5px;
	background-color: rgba(0, 0, 0, 0.03);
	font-size: 11px;
	line-height: 12px;
}

#changed-objects table {
	font-size: 11px;
}

.block > * {
	margin-left: 6px;
}

.block > table {
	margin-left: 0;
}

.block .header {
	margin-left: 3px;
	font-weight: bold;
}

.plus:before,
.minus:before {
	content: '+';
	display: inline-block;
	width: 10px;
	font-weight: bold;
	color: green;
}

.minus:before {
	content: '-';
	color: red;
}

.minus {
	color: #9e9e9e;
}

table {
	width: fit-content;
	table-layout: fixed;
	font-size: 13px;
}

.crafts,
.goods {
	display: flex;
	flex-direction: columns;
	gap: 2px;
}

.crafts .recipe,
.goods .item,
.crafts .recipe > img,
.goods .item > img,
.crafts .minus,
.goods .minus,
.crafts .plus,
.goods .plus {
	width: 22px;
	height: 22px;
}

.crafts .minus,
.goods .minus,
.crafts .plus,
.goods .plus {
	line-height: 24px;
	width: auto;
}

.item,
.recipe {
	position: relative;
}

.recipe.unchanged:after,
.item.unchanged:after {
	content: ' ';
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background-color: #fff;
	opacity: 0.45;
}

#changes {
	display: flex;
	overflow-y: auto;
	overflow-x: hidden;
	height: 100%;
	margin-bottom: 16px;
	padding: 8px 12px;
}

#changed-objects {
	display: flex;
	flex-wrap: wrap;
	column-gap: 5px;
	padding: 2px;
	width: 100%;
}

#changed-objects > div {
	background-color: #ffffff;
	border: 1px solid #dadce0;
	box-shadow: 0px 0px 2px 0px rgb(0 0 0 / 10%);
	border-radius: 2px;
	color: rgba(33, 33, 33, 1);
	cursor: pointer;
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	font-weight: 400;
	margin: 0;
	padding: 4px;
	padding-right: 6px;
	text-decoration: none;
	line-height: 1.48;
	user-select: none;
	column-gap: 3px;
	min-width: 250px;
	min-height: 32px;
	margin-top: 5px;
	overflow: hidden;
}

#changed-objects > div:hover {
	background-color: #efefef;
	text-decoration: none;
}


#changed-objects > div > .header {
	display: flex;
	column-gap: 3px;
	margin-bottom: 5px;
}

#changed-objects > div > .header > img {
	width: 32px;
	height: 32px;
}

#changed-objects > div > .header > span {
	align-self: center;
	line-height: 16px;
	overflow: hidden;
	margin: auto;
	margin-left: 0;
}

#changed-objects .item,
#changed-objects .item > img {
	width: auto;
	height: 22px;
	font-size: 12px;
	vertical-align: middle;
}

#changed-objects .item-row > div {
	display: flex;
	flex-direction: column;
	row-gap: 2px;
	margin-right: 5px;
}

#changed-objects .item-row > div:not(:first-child) .plus:before,
#changed-objects .item-row > div:not(:first-child) .minus:before {
	content: none;
}

</style>
@@}

</script>
