<script class="reload">
	function get_default(val, def) {
		return val !== undefined ? val : def;
	}
</script>

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

			<p style="margin: 5px 0;">
				{if $prev.num_to_make}<span class="nowrap prev">Crafted: {@$prev.num_to_make}x:</span>{/if}
				<span class="nowrap data">Crafted: {@$recipe.num_to_make}x:</span>
			</p>

			{if $prev.targets}
				<div class="targets prev nowrap"">
					{for i = 0; i < 4; i++}
						<div class="target">
							{if !$prev.targets[$i]}
								<span class="nowrap data prob">0%</span>
								<pw-item data-icon="-1"></pw-item>
							{else}
								{assign tgt_item = $find_by_id($db.items, $prev.targets[$i].id || recipe.targets[$i].id) || { icon: 0 \}}
								<span class="nowrap data prob">{@get_default($prev.targets[$i].prob, $recipe.targets[$i].prob) * 100}%</span>
								<pw-item data-icon="{@$tgt_item.icon}" title="{@$tgt_item.name}"></pw-item>
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
							<pw-item data-icon="{@$tgt_item.icon}" title="{@$tgt_item.name}"></pw-item>
						{/if}
					</div>
				{/for}
			</div>

			<p style="margin-top: 5px;">
				{if $prev.craft_id !== undefined || $prev.craft_level !== undefined || $prev.fail_prob !== undefined}
					<div class="nowrap prev flex-equal">
						<span>
							{if get_default($prev.craft_id, $recipe.craft_id) === 0}
								Generic Craft
							{else}
								(Craft #{@get_default($prev.craft_id, $recipe.craft_id)})
								Lv {@get_default($prev.craft_level, $recipe.craft_level)}
							{/if}
						</span>
						<span>Fail chance: {@get_default($prev.fail_prob, $recipe.fail_prob) * 100}%</span>
					</div>
				{/if}
				<div class="nowrap data flex-equal">
					<span>
						{if $recipe.craft_id === 0}
							Generic Craft
						{else}
							(Craft #{@$recipe.craft_id})&nbsp;
							Lv {@$recipe.craft_level}
						{/if}
					</span>
					<span>Fail chance: {@$recipe.fail_prob * 100}%</span>
				</div>
			</p>

			<p style="margin: 5px 0;">Mats:</p>
			{for off = 0; off < 8; off += 4}
				{if $prev.mats && ($prev.mats[$off] || $prev.mats[$off + 1] || $prev.mats[$off + 2] || $prev.mats[$off + 3])}
					<div class="materials prev nowrap"">
						{for i = $off; i < $off + 4; i++}
							<div class="target">
								{if !$prev.mats[$i]}
									<span class="nowrap data num">0</span>
									<pw-item data-icon="-1"></pw-item>
								{else}
									{assign tgt_item = $find_by_id($db.items, $prev.mats[$i].id || $recipe.mats[$i].id) || { icon: 0 \}}
									<span class="nowrap data num">{@$prev.mats[$i].num || "0"}</span>
									<pw-item data-icon="{@$tgt_item.icon}" title="{@$tgt_item.name}"></pw-item>
								{/if}
							</div>
						{/for}
					</div>
				{/if}
				<div class="materials data nowrap"">
					{for i = $off; i < $off + 4; i++}
						<div class="target">
							{if !$recipe.mats[$i]}
								<span class="nowrap data num">0</span>
								<pw-item data-icon="-1"></pw-item>
							{else}
								{assign tgt_item = $find_by_id($db.items, $recipe.mats[$i].id) || { icon: 0 \}}
								<span class="nowrap data num">{@$recipe.mats[$i].num || "0"}</span>
								<pw-item data-icon="{@$tgt_item.icon}" title="{@$tgt_item.name}"></pw-item>
							{/if}
						</div>
					{/for}
				</div>
			{/for}

			<p style="margin-top: 5px;">
				{if $prev.coins}
					<div class="nowrap prev flex-equal">
						<span>Coins: {@$prev.coins}</span>
					</div>
				{/if}
				<div class="nowrap data flex-equal">
					<span>Coins: {@$recipe.coins}</span>
				</div>
			</p>

			<p style="margin-top: 5px;">
			{if $prev.xp !== undefined || $prev.sp !== undefined || $prev.duration !== undefined}
				<div class="nowrap prev flex-equal">
					<span>Craft time {@get_default($prev.duration, $recipe.duration)}s</span>
					<span>Gained XP: {@get_default($prev.xp, $recipe.xp)}</span>
					<span>SP: {@get_default($prev.sp, $recipe.sp)}</span>
				</div>
			{/if}
			<div class="nowrap data flex-equal">
				<span>Craft time {@$recipe.duration}s</span>
				<span>Gained XP: {@$recipe.xp}</span>
				<span>SP: {@$recipe.sp}</span>
			</div>

			<p style="margin-top: 3px;"></p>

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
		{assign prev = $npc_recipes._db.prev || {\}}
		<div class="header">
			{if $prev.name}<p class="prev">Recipe list: {@$npc_recipes.name || "(unnamed)"} #{@$npc_recipes.id}</p>{/if}
			<p class="data">Recipe list: {@$npc_recipes.name || "(unnamed)"} #{@$npc_recipes.id}</p>
		</div>
		<div class="content">
			<div id="tabs">
				{for i = 0; i < 8; i++}
					{assign tab = $npc_recipes.tabs[i]}
					{assign prev_tab = $prev.tabs ? $prev.tabs[i] : null}
					<span class="tab" data-idx="{@$i}" onclick="{@@$this}.setTab({@$i});">
						{if $prev_tab}<p class="prev">{@$prev_tab.title || "(unnamed)"}</p>{/if}
						{if $tab}<p class="data">{@$tab.title || "(unnamed)"}</p>{/if}
					</span>
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
