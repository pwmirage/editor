<script id="pw-recipe-tooltip" type="text/x-dot-template">
	{assign recipe_id = $this.getAttribute('pw-id') || this.getRootNode().host.getAttribute('pw-id')}
	{if $recipe_id > 0}
		<span class="pw-tooltip">
			{assign recipe = $find_by_id($db.recipes, $recipe_id)}
			{assign prev = $recipe._db.prev || {\}}

			<p>
				{if $prev.id == -1}
					<p class="nowrap diff-plus" style="color: #32dc32;">(New) Recipe #{@$recipe.id}</span>
				{else}
					<p class="nowrap data">Recipe #{@$recipe.id}</p>
				{/if}
				<hr style="width: 100%"/>
			</p>

			{if $prev.name}<p class="nowrap prev">Name: {@$prev.name || "(unnamed)"}</p>{/if}
			<p class="nowrap data">Name: {@$recipe.name || "(unnamed)"}</p>
			{if $prev._tpl_name}<p class="nowrap prev">Tpl: {@$prev._tpl_name || "(unnamed)"}</p>{/if}
			<p class="nowrap data">Tpl: {@$recipe._db.tpl_name || "(unnamed)"}</p>

			<p style="margin: 5px 0;">Crafted:</p>
			{if $prev.targets}
				<div class="targets prev nowrap"">
					{for i = 0; i < 4; i++}
						<div class="target">
							{if !$prev.targets[$i]}
								<span class="nowrap data prob">0%</span>
								<pw-item data-icon="-1"></pw-item>
							{else}
								{assign tgt_item = $find_by_id($db.items, $prev.targets[$i].id) || { icon: 0 \}}
								<span class="nowrap data prob">{@($prev.targets[$i].prob * 100) || "0"}%</span>
								<pw-item data-icon="{@$tgt_item.icon}"></pw-item>
							{/if}
						</div>
					{/for}
				</div>
			{/if}
			<div class="targets data nowrap"">
				{for i = 0; i < 4; i++}
					<div class="target">
						{if !$recipe.targets[$i]}
							<span class="nowrap data prob">0%</span>
							<pw-item data-icon="-1"></pw-item>
						{else}
							{assign tgt_item = $find_by_id($db.items, $recipe.targets[$i].id) || { icon: 0 \}}
							<span class="nowrap data prob">{@($recipe.targets[$i].prob * 100) || "0"}%</span>
							<pw-item data-icon="{@$tgt_item.icon}"></pw-item>
						{/if}
					</div>
				{/for}
			</div>

			<p style="margin: 5px 0;">Mats:</p>
			{if $prev.mats}
				<div class="materials prev nowrap"">
					{for i = 0; i < 4; i++}
						<div class="target">
							{if !$prev.mats[$i]}
								<span class="nowrap data num">0</span>
								<pw-item data-icon="-1"></pw-item>
							{else}
								{assign tgt_item = $find_by_id($db.items, $prev.mats[$i].id) || { icon: 0 \}}
								<span class="nowrap data num">{@$prev.mats[$i].num || "0"}</span>
								<pw-item data-icon="{@$tgt_item.icon}"></pw-item>
							{/if}
						</div>
					{/for}
				</div>
			{/if}
			<div class="materials data nowrap"">
				{for i = 0; i < 4; i++}
					<div class="target">
						{if !$recipe.mats[$i]}
							<span class="nowrap data num">0</span>
							<pw-item data-icon="-1"></pw-item>
						{else}
							{assign tgt_item = $find_by_id($db.items, $recipe.mats[$i].id) || { icon: 0 \}}
							<span class="nowrap data num">{@$recipe.mats[$i].num || "0"}</span>
							<pw-item data-icon="{@$tgt_item.icon}"></pw-item>
						{/if}
					</div>
				{/for}
			</div>

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
			{assign tgt_item = $find_by_id($db.items, $recipe.targets[0].id) || { icon: 0 \}}
			<pw-item data-icon="{@$tgt_item.icon}" onclick="this.classList.toggle('force-visible');">
				<div class="blackfocusbox"></div>
				<pw-recipe-tooltip onclick="event.stopPropagation();"></pw-recipe-tooltip>
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
