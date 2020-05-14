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
		{foreach $recipes.tabs[0].items as item_id}
			{assign item = $db.items[$item_id] }
			{if $item}
				<pw-item data-icon="{@$item.icon}">
					<pw-recipe-tooltip></pw-recipe-tooltip>
				</pw-item>
			{else}
				<pw-item data-icon="-1"></pw-item>
			{/if}
		{/foreach}
	</div>
</script>
