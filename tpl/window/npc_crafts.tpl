<div class="window" style="width: 316px;">
<div class="header {if $crafts._removed}removed{/if}">
	<span>
		Crafts: {@$crafts.name || ""} {@DB.serialize_id($crafts.id)}
	</span>
	<div class="menu">
		<i class="details fa fa-ellipsis-v"></i>
	</div>
	<div class="menu">
		<i class="minimize fa"></i>
		<i class="maximize fa"></i>
		<i class="close fa fa-close"></i>
	</div>
</div>
<div class="content flex-rows">
	<div class="flex-columns" style="align-items: center; margin-bottom: 5px;">
		<span style="width: 75px;">Name</span>
		<span data-input style="flex: 1;" data-link="{serialize $crafts} => 'name'" data-placeholder="(unnamed)"></span>
	</div>
	<div class="flex-columns" style="align-items: center; margin-bottom: 5px;">
		<span style="width: 75px;">NPC option</span>
		<span data-input style="flex: 1;" data-link="{serialize $crafts} => 'option'" data-placeholder="(unnamed)"></span>
	</div>
	<div class="flex-columns" style="align-items: center; margin-bottom: 5px;">
		<span style="width: 75px;">Shown skill</span>
		<span data-select="RecipeTooltip.craft_types" style="flex: 1;" data-link="{serialize $crafts} => 'make_skill_id'"></span>
	</div>
	<div id="tabs" class="flex-columns" style="flex-wrap: wrap; margin-bottom: 5px;">
	{for i = 0; i < 8; i++}
		<span class="tabname" data-input onfocus="{serialize $win}.select_tab({@$i});" data-link="{serialize $crafts} => 'pages', {@$i}, 'title'" data-placeholder="(none)"></span>
	{/for}
	</div>
	<div id="items" class="flex-columns" style="flex-wrap: wrap;" onmousedown="return {serialize $win}.onclick(event);" oncontextmenu="return {serialize $win}.onclick(event);">
		{assign tab = $crafts.pages[$win.selected_tab || 0]}
		{for i = 0; i < 32; i++}
			{assign id = $tab?.recipe_id ? $tab?.recipe_id[i] : 0}
			<span class="recipe menu-triangle" data-id="{@$id}" data-nopreview="1" data-idx="{@$i}" tabindex="0"><img{ } src="{@NPCCraftsWindow.get_recipe_icon($id)}" alt=""></span>
		{/for}
	</div>
	<div id="recipe"></div>
</div>
</div>

{@@
<style>
#tabs {
	margin-right: -8px;
	margin-top: 0px;
}

span.tabname {
	width: 57px;
	padding: 2px 4px;
	margin-right: -2px;
	margin-top: 4px;
	position:relative;
	margin-bottom: 4px;
}

span.tabname.selected {
	border-bottom: 5px solid #e0b0b0;
	margin-bottom: 0px;
	box-shadow: 1px 1px 5px #ceccc7;
}

#items {
	background-color: #000;
	gap: 4px;
	padding: 4px;
	padding-right: 3px;
}

#items > * {
	width: 32px;
	height: 32px;
	position: relative;
}

#items > .recipe,
#items > .recipe > img {
	outline: none;
}

#items > .recipe:hover {
	box-shadow: 0px 0px 10px 1px rgba(0,0,0,0.75);
	border: 1px solid var(--header-color);
	margin: -1px;
}

.menu-triangle:after {
	border-color: transparent transparent #a0b2a6 transparent !important;
}

#items > .recipe:focus:before,
#items > .recipe.focus:before {
	content: ' ';
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background-color: var(--header-color);
	opacity: 0.4;
}

#recipe {
	margin-top: 10px;
	min-height: 336px;
}

#recipe-details {
	padding: 2px 9px;
	font-size: 14px;
	word-break: break-word;
}

#recipe-details:hover {
	cursor: pointer;
}
</style>
@@}
