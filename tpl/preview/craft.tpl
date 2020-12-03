<script id="pw-preview-crafts" type="text/x-dot-template">
<div class="window loading">
	{assign prev = $crafts._db.prev || {\}}
	<div class="header">
		<div>
			{if $prev.id == -1}
				<p class="data diff-plus">(New) NPC Crafts: {@$crafts.name || "(unnamed)"} #{@$crafts.id}</p>
			{else}
				<p class="data">NPC Crafts: {@$crafts.name || "(unnamed)"} #{@$crafts.id}</p>
				{if $prev.name}<p class="prev">NPC Crafts: {@$crafts.name || "(unnamed)"} #{@$crafts.id}</p>{/if}
			{/if}
		</div>
		{if $crafts._db.refs}<span class="" style="margin-left: auto; padding-left: 3px;"><i class="fa fa-share" aria-hidden="true"></i> ({@$crafts._db.refs.length})</span>{/if}
	</div>
	<div class="content">
		<div id="tabs">
			{for i = 0; i < 8; i++}
				{assign tab = $crafts.tabs[i]}
				{assign prev_tab = $prev.tabs ? $prev.tabs[i] : null}
				<span class="tab {if $win.selected_tab == $i}selected{/if} {if $win.is_tab_modified($i)}modified{/if}" onclick="{serialize $win}.select_tab(this, {@$i});">
					{if $tab}<p class="data">{@$tab.title || "(unnamed)"}</p>{/if}
					{if $prev_tab}<p class="prev">{@$prev_tab.title || "(unnamed)"}</p>{/if}
				</span>
			{/for}
		</div>

		<div id="recipes" class="item-container">
			{assign tab = $crafts.tabs[$win.selected_tab]}
			{for i = 0; i < 32; i++}
				{assign recipe_id = $tab.recipes[$i]}
				<span class="recipe {if $win.is_recipe_modified($i)}modified{/if}" data-id="{@$recipe_id}" tabindex="0">
					<img{ } src="{@$win.get_recipe_icon($recipe_id)}">
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

#tabs {
	display: flex;
	flex-wrap: wrap;
	max-width: calc(68.5px * 4);
	margin: -1px;
	margin-bottom: 3px;
}

#tabs > .tab {
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

#tabs > .tab:empty {
	background-color: #afabab;
	cursor: initial;
}

#tabs > .tab:empty:after {
	content: '-';
	color: gray;
}

#tabs > .tab:not(.modified) {
	color: gray;
}

#tabs > .tab.selected,
#tabs > .tab.selected > .prev:before,
#tabs > .tab.selected > .data:before {
	background-color: var(--color-button-bg-darker);
}

#tabs > .tab > .prev:before,
#tabs > .tab > .data:before {
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


