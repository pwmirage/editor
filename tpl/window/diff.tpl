<script id="tpl-diff-window" type="text/x-dot-template">
<div class="window resizable" style="width: 376px: min-width: 376px;">
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
	{@PWPreview.diff(\{ db, obj: $obj, diff: $diff, prev: $obj._db.project_initial_state \})}
</div>
</div>

{@@
<style>
.block {
	display: flex;
	flex-direction: column;
	padding: 4px 5px;
	background-color: rgba(0, 0, 0, 0.05);
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
</style>
@@}

</script>
