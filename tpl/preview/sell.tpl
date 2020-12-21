<script id="pw-preview-sells" type="text/x-dot-template">
<div class="window loading">
	{assign prev = $goods._db.prev || {\}}
	<div class="header">
		<div>
			{if $prev.id == -1}
				<p class="data diff-plus">(New) NPC Goods: {@$goods.name || "(unnamed)"} {@serialize_db_id($goods.id)}</p>
			{else}
				<p class="data">NPC Goods: {@$goods.name || "(unnamed)"} {@serialize_db_id($goods.id)}</p>
				{if $prev.name}<p class="prev">NPC Goods: {@$goods.name || "(unnamed)"} {@serialize_db_id($goods.id)}</p>{/if}
			{/if}
		</div>
		{if $goods._db.refs}<span class="" style="margin-left: auto; padding-left: 3px;"><i class="fa fa-share" aria-hidden="true"></i> ({@$goods._db.refs.length})</span>{/if}
	</div>
	<div class="content">
		<div id="pages">
			{for i = 0; i < 8; i++}
				{assign tab = $goods.pages[i]}
				{assign prev_tab = $prev.pages? $prev.pages[$i] : null}
				<span class="tab {if $win.selected_tab == $i}selected{/if} {if $win.is_tab_modified($i)}modified{/if}" onclick="{serialize $win}.select_tab(this, {@$i});">
					{if $tab}<p class="data">{@$tab.title || "(unnamed)"}</p>{/if}
					{if $prev_tab}<p class="prev">{@$prev_tab.title || "(unnamed)"}</p>{/if}
				</span>
			{/for}
		</div>

		<div id="items" class="item-container">
			{assign tab = $goods.pages[$win.selected_tab]}
			{for i = 0; i < 32; i++}
				{assign item_id = $tab.item_id[$i]}
				<span class="item {if $win.is_item_modified($i)}modified{/if}" data-id="{@$item_id}" tabindex="0">
					<img{ } src="{@$preview.get_item_icon($item_id)}">
				</span>
			{/for}
		</div>
	</div>
</div>

{@@
<style>
.window {
	width: 280px;
}

.window > .header .prev,
.window > .header .data.new {
	margin-left: 8px;
}

#pages {
	display: flex;
	flex-wrap: wrap;
	max-width: calc(68.5px * 4);
	margin: -1px;
	margin-bottom: 3px;
}

#pages > .tab {
	width: 64.5px;
	min-height: 24px;
	box-sizing: border-box;
	margin: 2px;
	padding: 5px;
	background-color: var(--color-button-bg);
	color: var(--color-button-fg);
	border: 1px solid #b47a63;
	font-size: 11px;
	cursor: pointer;
}

#pages > .tab:empty {
	background-color: #afabab;
	cursor: initial;
}

#pages > .tab:empty:after {
	content: '-';
	color: gray;
}

#pages > .tab:not(.modified) {
	color: gray;
}

#pages > .tab.selected,
#pages > .tab.selected > .prev:before,
#pages > .tab.selected > .data:before {
	background-color: var(--color-button-bg-darker);
}

#pages > .tab > .prev:before,
#pages > .tab > .data:before {
	border-left: 1px solid #b47a63;
	background-color: var(--color-button-bg);
}

pw-recipe {
	position: relative;
	width: 32px;
	height: 32px;
}

pw-recipe:not(.modified):after,
.item:not(.modified):after {
	content: ' ';
	position: absolute;
	left: 0;
	top: 0;
	width: 32px;
	height: 32px;
	background-color: rgba(255, 255, 255, 0.5);
	pointer-events: none;
}

pw-recipe.mini-item[pw-id="0"] {
	visibility: hidden;
}

pw-recipe.mini-item.force-visible[pw-id="0"]:after,
pw-item.mini-item.force-visible[pw-id="0"]:after {
	visibility:visible;
	content: ' ';
	position: absolute;
	left: 4px !important;
	top: 0px!important;
	width: 7px !important;
	height: 7px !important;
	background-color: rgba(48, 224, 48, 0.7);
	border-radius: 50%;
	border: solid 1px #7aff7b;
	pointer-events: none;
	box-shadow: 0px 0px 10px 2px white;
}

.item {
	position: relative;
	margin: 1px;
}
</style>
@@}
</script>

