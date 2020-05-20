<script id="pw-recipe-tooltip" type="text/x-dot-template">
	{assign recipe_id = $this.getAttribute('pw-id') || this.getRootNode().host.getAttribute('pw-id')}
	{if $recipe_id > 0}
		<span class="pw-tooltip">
			{assign recipe = $find_by_id($db.recipes, $recipe_id)}
			{assign tgt_item = $find_by_id($db.items, $recipe.targets[0].id) || $db.items[0] }
			<span id="header">
				<pw-item data-icon="{@$tgt_item.icon}"></pw-item>
				<span class="name-container">
					<p class="title">{@$tgt_item.name} (ID #{@$tgt_item.id})</p>
					<p class="type">{@$Item.TYPE_NAME[$tgt_item.type]}</p>
				</span>
			</span>
		</span>
	{/if}
</script>

<script id="pw-recipe" type="text/x-dot-template">
	{try}
		{assign recipe_id = $this.getAttribute('pw-id')}
		{if $recipe_id == 0}
			<pw-item data-icon="-1"></pw-item>
		{else}
			{assign recipe = $find_by_id($db.recipes, $recipe_id)}
			{assign tgt_item = $find_by_id($db.items, $recipe.targets[0].id)}
			<pw-item data-icon="{@$tgt_item.icon}">
				<pw-recipe-tooltip></pw-recipe-tooltip>
			</pw-item>
		{/if}
	{catch}
		<pw-item data-icon="0"></pw-item>
	{/try}
</script>

<script id="pw-recipe-list" type="text/x-dot-template">
	<div class="window">
		<div class="header"><p>Recipe list: {@$npc_recipes.name}</p></div>
		<div class="content">
			<div id="tabs">
				{for i = 0; i < 8; i++}
					{assign tab = $npc_recipes.tabs[i]}
					<span class="tab" data-idx="{@$i}" onclick="{@@$this}.setTab({@$i});">{if $tab}{@$tab.title}{/if}</span>
				{/foreach}
			</div>

			<div id="recipes" class="item-container">
				{for i = 0; i < 32; i++}
					<pw-recipe data-idx="{@$i}"></pw-recipe>
				{/for}
			</div>
		</div>
	</div>
</script>

<script id="pw-diff" type="text/x-dot-template">
</script>
