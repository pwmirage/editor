<script id="tpl-recipe" type="text/x-dot-template">
{assign sanitize_f = (f) => Math.round(f * Math.pow(10, 5)) / Math.pow(10, 5)}

<div class="window resizable" style="position: static; width: 312px;">
<div class="header">
	<span>
		Recipe {@$recipe.name || ""} {@DB.serialize_id($recipe.id || 0)}
	</span>
	<div class="menu">
		<i class="minimize fa"></i>
		<i class="maximize fa"></i>
		<i class="close fa fa-close"></i>
	</div>
</div>
<div class="content" style="">
	<div class="flex-columns" style="align-items: center; margin-top: -2px; margin-bottom: 4px; column-gap: 3px;">
		<span>x</span>
		<span data-input class="input-number" style="width: 20px;" data-link="{serialize $recipe} => 'num_to_make'" data-placeholder="(0)"></span>
		<span>of one of the following:</span>
		<span style="flex: 1;"></span>
		<span style="white-space: pre;">Or fail %:</span>
		<span data-input class="is_float input-number" style="width: 30px;" data-link="{serialize $recipe} => 'fail_prob'" data-placeholder="(0)"></span>
	</div>
	<div id="targets" class="flex-columns" style="flex-wrap: wrap; column-gap: 5px; margin-bottom: 5px;">
		{for i = 0; i < 4; i++}
			<div class="target">
				{assign target = $recipe?.targets?.[$i] || \{ \} }
				<span class="item menu-triangle" oncontextmenu="this.onclick(event);" onclick="{serialize $win}.item_onclick(event, this, 'targets', {@$i});" ondblclick="{serialize $win}.item_ondblclick(event, this, 'targets', {@$i});" data-id="{@$target.id}" data-idx="{@$i}" tabindex="0"><img{ } src="{@Item.get_icon_by_item(db, $target.id)}" alt=""></span>
				<span data-input class="input-number is_float" style="width: 28px; font-size: 12px; padding: 3px;" data-link="{serialize $recipe} => 'targets', {@$i}, prob" data-placeholder="(unnamed)"></span>
			</div>
		{/for}
	</div>
	<div>Materials:</div>
	<div id="mats" class="flex-columns" style="flex-wrap: wrap; column-gap: 5px; row-gap: 3px;">
		{assign i = 0}
		{for i = 0; i < 8; i++}
			{assign mat = $recipe?.mats?.[$i]}
			<div class="target">
				<span class="item menu-triangle" oncontextmenu="this.onclick(event);" onclick="{serialize $win}.item_onclick(event, this, 'mats', {@$i});" ondblclick="{serialize $win}.item_ondblclick(event, this, 'mats', {@$i});" data-id="{@$mat?.id || 0}" data-idx="{@$i}" tabindex="0"><img{ } src="{@Item.get_icon_by_item(db, $mat?.id || 0)}" alt=""></span>
				<span data-input class="input-number" style="width: 28px; font-size: 12px; padding: 3px;" data-link="{serialize $recipe} => 'mats', {@$i}, num" data-placeholder="(unnamed)"></span>
			</div>
		{/for}
	</div>

	<div class="flex-columns" style="align-items: center; margin-bottom: 5px; margin-top: 5px;">
		<span style="">Req. Skill:</span>
		<span data-select="RecipeTooltip.craft_types" style="flex: 1;" data-link="{serialize $recipe} => 'skill_id'"></span>
		<span>Lv.</span>
		<span data-input class="input-number" style="" data-link="{serialize $recipe} => 'skill_level'" data-placeholder="(unnamed)"></span>
	</div>
	<div class="flex-columns" style="align-items: center; margin-bottom: 5px;">
		<span style="flex: 1"></span>
		<span>Recipe Lv.</span>
		<span data-input class="input-number" style="" data-link="{serialize $recipe} => 'recipe_level'" data-placeholder="(unnamed)"></span>
	</div>

	<div class="flex-columns flex-all">
		<div class="flex-columns" style="align-items: center; margin-bottom: 5px;">
			<span style="">XP:</span>
			<span data-input class="input-number" style="flex: 1;" data-link="{serialize $recipe} => 'xp'" data-placeholder="(unnamed)"></span>
		</div>
		<div class="flex-columns" style="align-items: center; margin-bottom: 5px;">
			<span style="">SP:</span>
			<span data-input class="input-number" style="flex: 1;" data-link="{serialize $recipe} => 'sp'" data-placeholder="(unnamed)"></span>
		</div>
	</div>

	<div class="flex-columns flex-all">
		<div class="flex-columns" style="align-items: center; margin-bottom: 5px;">
			<span style="">Coins:</span>
			<span data-input class="input-number" style="flex: 1;" data-link="{serialize $recipe} => 'coins'" data-placeholder="(unnamed)"></span>
		</div>
		<div class="flex-columns" style="align-items: center; margin-bottom: 5px;">
			<span style="">Duration: (s)</span>
			<span data-input class="input-number is_float" style="flex: 1;" data-link="{serialize $recipe} => 'duration'" data-placeholder="(unnamed)"></span>
		</div>
	</div>

</div>
</div>

{@@
<style>
.input {
	width: 35px;
}

.item:hover {
	box-shadow: 0px 0px 10px 1px rgba(0,0,0,0.5);
}

.item:focus:before {
	content: ' ';
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background-color: var(--header-color);
	opacity: 0.4;
}

.menu-triangle:after {
	border-color: transparent transparent #a0b2a6 transparent !important;
}

</style>
@@}
</script>
