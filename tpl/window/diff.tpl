<div class="window resizable" style="width: 376px: min-width: 376px; height: 400px;">
{assign project = db.metadata[1]}
<div class="header">
	<span>Diff: {@$obj.name || PWPreview.get_obj_type($obj).name } {@DB.serialize_id($obj.id)}</span>
	<div class="menu">
		<i class="minimize fa"></i>
		<i class="maximize fa"></i>
		<i class="close fa fa-close"></i>
	</div>
</div>
<div class="content flex-rows" style="overflow: hidden;">
</div>
</div>

{@@
<style>
.block {
	display: flex;
	flex-direction: column;
	padding: 2px 5px;
	background-color: rgba(0, 0, 0, 0.03);
	font-size: 11px;
	line-height: 12px;
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

.item,
.item > img {
	width: auto;
	height: 22px;
	font-size: 12px;
	vertical-align: middle;
}

.item-row > div {
	display: flex;
	flex-direction: column;
	row-gap: 2px;
	margin-right: 5px;
}

.item-row > div:not(:first-child) .plus:before,
.item-row > div:not(:first-child) .minus:before {
	content: none;
}
</style>
@@}
