<script id="recipe-tpl" type="text/x-dot-template">
	{assign tgt_item = $db.items[$recipe.targets[0].id] || $db.items[0] }
	<span id="header">
		<pw-item data-icon="{@$tgt_item.icon}"></pw-item>
		<span class="name-container">
			<p class="title">{@$tgt_item.name} (ID #{@$tgt_item.id})</p>
			<p class="type">{@$Item.TYPE_NAME[$tgt_item.type]}</p>
		</span>
	</span>
</script>

<script id="recipe-tooltip-tpl" type="text/x-dot-template">
	<span class="pw-tooltip">
		{include id='recipe-tpl'}
	</span>
</script>

<script id="recipe-list" type="text/x-dot-template">
	<div id="recipes" class="item-container">
		{foreach $npc_recipes.tabs[0].recipes as recipe_id}
			{if $recipe_id == 0}
				<pw-item data-icon="-1"></pw-item>
				{continue}
			{/if}

			{try}
				{assign recipe = $find_by_id($db.recipes, $recipe_id)}
				{assign tgt_item = $find_by_id($db.items, $recipe.targets[0].id)}
				<pw-item data-icon="{@$tgt_item.icon}">
					<pw-recipe-tooltip></pw-recipe-tooltip>
				</pw-item>
			{catch}
				<pw-item data-icon="0"></pw-item>
			{/try}
		{/foreach}
	</div>
</script>

<script id="diff" type="text/x-dot-template">
</script>
