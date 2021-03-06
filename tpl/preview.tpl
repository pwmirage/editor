<script class="reload">
	function get_default(val, def) {
		return val !== undefined ? val : def;
	}
</script>

<script id="pw-recipe-tooltip" type="text/x-dot-template">
	{assign recipe_id = $this.getAttribute('pw-id') || this.getRootNode().host.getAttribute('pw-id')}
	{assign recipe = $find_by_id($db.recipes, $recipe_id)}
	{if $recipe_id > 0 && !$recipe}
		<span class="pw-tooltip">
			<p class="data nowrap">Unknown Recipe #{@$recipe_id}</p>
		</span>
	{else if $recipe_id > 0}
		<span class="pw-tooltip">
			{assign prev = $recipe._db.prev || {\}}

			<p>
				{if $prev.id == -1}
					<p class="diff-plus" style="color: #32dc32;">(New) Recipe #{@$recipe.id}</p>
				{else}
					<p class="data">Recipe #{@$recipe.id}</p>
				{/if}
				<hr style="width: 100%"/>
			</p>

			<p class="data">Name: {@$recipe.name || "(unnamed)"}</p>
			{if $prev.name}<p class="prev">Name: {@$prev.name || "(unnamed)"}</p>{/if}
			<p class="data">Tpl: {@$recipe._db.tpl_name || "(unnamed)"}</p>
			{if $prev._tpl_name}<p class="prev">Tpl: {@$prev._tpl_name || "(unnamed)"}</p>{/if}

			<p style="display: flex; flex-direction: column; margin: 5px 0;">
				<span class="data">Crafted: {@$recipe.num_to_make}x:</span>
				{if $prev.num_to_make}<span class="prev">Crafted: {@$prev.num_to_make}x:</span>{/if}
			</p>

			<div class="targets data "">
				{for i = 0; i < 4; i++}
					<div class="target">
						{if !$recipe.targets[$i]}
							<span class="prob">0%</span>
							<pw-item pw-icon="-1"></pw-item>
						{else}
							{assign tgt_item = $find_by_id($db.items, $recipe.targets[$i].id) || { icon: 0 \}}
							<span class="prob">{@($recipe.targets[$i].prob * 100) || "0"}%</span>
							<pw-item pw-icon="{@$tgt_item.icon}" title="{@$tgt_item.name}"></pw-item>
						{/if}
					</div>
				{/for}
			</div>
			{if $prev.targets}
				<div class="targets prev "">
					{for i = 0; i < 4; i++}
						<div class="target">
							{if !$prev.targets[$i]}
								<span class="prob">0%</span>
								<pw-item pw-icon="-1"></pw-item>
							{else}
								{assign tgt_item = $find_by_id($db.items, $prev.targets[$i].id || $recipe.targets[$i].id) || { icon: 0 \}}
								<span class="prob">{@get_default($prev.targets[$i].prob, $recipe.targets[$i] ? $recipe.targets[$i].prob : 0) * 100}%</span>
								<pw-item pw-icon="{@$tgt_item.icon}" title="{@$tgt_item.name}"></pw-item>
							{/if}
						</div>
					{/for}
				</div>
			{/if}

			<p style="margin-top: 5px;">
				<div class="data flex-equal">
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
				{if $prev.craft_id !== undefined || $prev.craft_level !== undefined || $prev.fail_prob !== undefined}
					<div class="prev flex-equal">
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
			</p>

			<p style="margin: 5px 0;">Mats:</p>
			{for off = 0; off < 8; off += 4}
				<div class="materials data "">
					{for i = $off; i < $off + 4; i++}
						<div class="target">
							{if !$recipe.mats[$i]}
								<span class="num">0</span>
								<pw-item pw-icon="-1"></pw-item>
							{else}
								{assign tgt_item = $find_by_id($db.items, $recipe.mats[$i].id) || { icon: 0 \}}
								<span class="num">{@$recipe.mats[$i].num || "0"}</span>
								<pw-item pw-icon="{@$tgt_item.icon}" title="{@$tgt_item.name}"></pw-item>
							{/if}
						</div>
					{/for}
				</div>
				{if $prev.mats && ($prev.mats[$off] || $prev.mats[$off + 1] || $prev.mats[$off + 2] || $prev.mats[$off + 3])}
					<div class="materials prev "">
						{for i = $off; i < $off + 4; i++}
							<div class="target">
								{if !$prev.mats[$i]}
									<span class="num">0</span>
									<pw-item pw-icon="-1"></pw-item>
								{else}
									{assign tgt_item = $find_by_id($db.items, $prev.mats[$i].id || $recipe.mats[$i].id) || { icon: 0 \}}
									<span class="num">{@$prev.mats[$i].num || "0"}</span>
									<pw-item pw-icon="{@$tgt_item.icon}" title="{@$tgt_item.name}"></pw-item>
								{/if}
							</div>
						{/for}
					</div>
				{/if}
			{/for}

			<p style="margin-top: 5px;">
				<div class="data flex-equal">
					<span>Coins: {@$recipe.coins}</span>
				</div>
				{if $prev.coins}
					<div class="prev flex-equal">
						<span>Coins: {@$prev.coins}</span>
					</div>
				{/if}
			</p>

			<p style="margin-top: 5px;">
			<div class="data flex-equal">
				<span>Craft time {@$recipe.duration}s</span>
				<span>Gained XP: {@$recipe.xp}</span>
				<span>SP: {@$recipe.sp}</span>
			</div>
			{if $prev.xp !== undefined || $prev.sp !== undefined || $prev.duration !== undefined}
				<div class="prev flex-equal">
					<span>Craft time {@get_default($prev.duration, $recipe.duration)}s</span>
					<span>Gained XP: {@get_default($prev.xp, $recipe.xp)}</span>
					<span>SP: {@get_default($prev.sp, $recipe.sp)}</span>
				</div>
			{/if}

			<p style="margin-top: 3px;"></p>

		</span>
	{/if}
</script>

<script id="pw-recipe" type="text/x-dot-template">
		{assign recipe_id = $this.getAttribute('pw-id')}
		{assign classes = $this.classList.contains('mini-item') ? 'mini-item' : ''}
		{if $recipe_id == 0}
			<pw-item pw-icon="-1" class="{@$classes}"></pw-item>
		{else}
			{assign recipe = $find_by_id($db.recipes, $recipe_id) || { targets: [] \}}
			{assign tgt_item = $find_by_id($db.items, $recipe.targets[0] ? ($recipe.targets[0].id || 0) : 0) || { icon: 0 \}}
			<pw-item pw-icon="{@$tgt_item.icon}" class="{@$classes}" onclick="this.classList.toggle('force-visible');">
				<div class="blackfocusbox" title=""></div>
				<pw-recipe-tooltip onclick="event.stopPropagation();"></pw-recipe-tooltip>
			</pw-item>
		{/if}
</script>

<script id="pw-recipe-list" type="text/x-dot-template">
	<div class="window loading">
		{assign prev = $npc_recipes._db.prev || {\}}
		<div class="header">
			<div>
				{if $prev.id == -1}
					<p class="data diff-plus">(New) NPC Crafts: {@$npc_recipes.name || "(unnamed)"} #{@$npc_recipes.id}</p>
				{else}
					<p class="data">NPC Crafts: {@$npc_recipes.name || "(unnamed)"} #{@$npc_recipes.id}</p>
					{if $prev.name}<p class="prev">NPC Crafts: {@$npc_recipes.name || "(unnamed)"} #{@$npc_recipes.id}</p>{/if}
				{/if}
			</div>
			{if $npc_recipes._db.refs}<span class="" style="margin-left: auto; padding-left: 3px;"><i class="fa fa-share" aria-hidden="true"></i> ({@$npc_recipes._db.refs.length})</span>{/if}
		</div>
		<div class="content">
			<div id="tabs">
				{for i = 0; i < 8; i++}
					{assign tab = $npc_recipes.tabs[i]}
					{assign prev_tab = $prev.tabs ? $prev.tabs[i] : null}
					<span class="tab" data-idx="{@$i}" onclick="{@@$this}.setTab({@$i});">
						{if $tab}<p class="data">{@$tab.title || "(unnamed)"}</p>{/if}
						{if $prev_tab}<p class="prev">{@$prev_tab.title || "(unnamed)"}</p>{/if}
					</span>
				{/foreach}
			</div>

			<div id="recipes" class="item-container">
				{for i = 0; i < 32; i++}
					<div style="position: relative;">
						<pw-recipe data-idx="{@$i}"></pw-recipe>
						<pw-recipe data-idx="{@$i}" class="mini-item"></pw-recipe>
					</div>
				{/for}
			</div>
		</div>
	</div>
</script>

<script id="pw-npc" type="text/x-dot-template">
	<div class="window loading">
		{assign prev = $npc._db.prev || {\}}
		<div class="header">
			<div>
				{if $prev.id == -1}
					<p class="diff-plus">(New) NPC: {@$npc.name || "(unnamed)"} #{@$npc.id}</p>
				{else}
					<p class="data">NPC: {@$npc.name || "(unnamed)"} #{@$npc.id}</p>
					{if $prev.name}<p class="prev">NPC: {@$prev.name || "(unnamed)"} #{@$npc.id}</p>{/if}
				{/if}
			</div>
		</div>
		<div class="content">
			<p class="data">Tpl: {@$npc._db.tpl_name || "(unnamed)"}</p>
			{if $prev._tpl_name}<p class="prev">Tpl: {@$prev._tpl_name || "(unnamed)"}</p>{/if}
			<div class="data flex-equal">
				<p class="data">Goods: #{@$npc.id_sell_service || "-"}</p>
				<p class="data">Craft: #{@$npc.id_make_service || "-"}</p>
			</div>
			{if $prev.id_sell_service || $prev.id_make_service}
				<div class="prev flex-equal">
					<p class="prev">Goods: {@$prev.id_sell_service  || "-"}</p>
					<p class="prev">Craft: {@$prev.id_make_service || "-"}</p>
				</div>
			{/if}
			<p class="data">Greeting: {@$npc.greeting || ""}</p>
			{if $prev.greeting}<p class="prev">Greeting: {@$prev.greeting || ""}</p>{/if}
		</div>
	</div>
</script>

<script id="pw-npc-spawn" type="text/x-dot-template">
	<div class="window loading">
		{assign prev = $npc_spawn._db.prev || {\}}
		<div class="header">
			<div>
				{if $prev.id == -1}
					<p class="diff-plus">(New) NPC Spawner #{@$npc_spawn.id}</p>
				{else}
					<p class="data">NPC Spawner#{@$npc_spawn.id}</p>
				{/if}
			</div>
			{if $npc_spawn._db.refs}<span class="" style="margin-left: auto; padding-left: 3px;"><i class="fa fa-share" aria-hidden="true"></i> ({@$npc_spawn._db.refs.length})</span>{/if}
		</div>
		<div class="content">
			{assign rounddot2 = (f) => parseInt(f * 100) / 100}
			<p class="data">Pos: {@$rounddot2($npc_spawn.pos[0])},{@$rounddot2($npc_spawn.pos[2])} ({@$rounddot2($npc_spawn.pos[1])})</p>
			{if $prev.pos}<p class="prev">Pos: {@$rounddot2($prev.pos[0] || $npc_spawn.pos[0])},{@$rounddot2($prev.pos[2] || $npc_spawn.pos[2])} ({@$rounddot2($prev.pos[1] || $npc_spawn.pos[1])})</p>{/if}
			{assign npc = $find_by_id($db.npcs, $npc_spawn.type)}
			<p class="data">NPC: {if $npc}{@$npc.name} (Tpl: {@$npc.tpl_name || "unnamed"}){else}("unknown"){/if} #{@$npc_spawn.type}</p>
			{if $prev.type}
				{assign npc = $find_by_id($db.npcs, $prev.type)}
				<p class="prev">NPC: {if $npc}{@$npc.name} (Tpl: {@$npc.tpl_name || "unnamed"}){else}("unknown"){/if} #{@$prev.type}</p>
			{/if}
		</div>
	</div>
</script>

<script id="pw-item-list" type="text/x-dot-template">
	<div class="window loading">
		<div class="header">
			<div>
				<p class="data">Modified Items</p>
			</div>
		</div>
		<div class="content">
			<div id="items" class="item-container">
				{for i = 0; i < 32; i++}
					{assign item = $items[i]}
					{if !$item}
						<pw-item pw-icon="-1"></pw-item>
						{continue}
					{/if}
					<pw-item pw-icon="{@$item.icon}" class="modified" title="{@$item.name}" onclick="this.classList.toggle('force-visible');">
						<div class="blackfocusbox" title=""></div>
						<span class="tooltip">
							<pre class="pw-tooltip" style="width: 300px;">
								<p>
									Under construction, raw data only
									<hr style="width: 100%"/>
								</p>
								{@JSON.stringify($item, null, 2)}
							</pre>
						</span>
					</pw-item>
				{/for}
			</div>
		</div>
	</div>

{@@
<style>
#changed-objects {
	display: flex;
	flex: 1;
	flex-wrap: wrap-reverse;
	column-gap: 5px;
	align-items: baseline;
	margin-top: -3px;
	max-height: 86px;
	overflow: hidden;
}

#more-objects,
#changed-objects > div {
	background-color: #dccfcf;
	border-radius: 2px;
	border-width: 0;
	color: rgba(33, 33, 33, 1);
	cursor: pointer;
	display: flex;
	font-weight: 400;
	margin: 0;
	padding: 4px;
	padding-right: 6px;
	text-decoration: none;
	line-height: 1.48;
	user-select: none;
	column-gap: 3px;
	max-width: 150px;
	height: 32px;
	margin-top: 5px;
	overflow: hidden;
}

#more-objects:hover,
#changed-objects > div:hover {
	background-color: rgba(156, 120, 120, 1);
	color: rgba(255, 255, 255, 1);
	text-decoration: none;
}

#more-objects {
	display: none;
	line-height: 31px;
	min-width: 75px;
	text-align: center;
	overflow: hidden;
}

#changed-objects > div > img {
	width: 32px;
	height: 32px;
}

#changed-objects > div > span {
	align-self: center;
	line-height: 16px;
	overflow: hidden;
	margin: auto;
}

</style>
@@}
</script>

