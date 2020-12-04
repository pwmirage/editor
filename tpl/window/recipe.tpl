<script id="tpl-recipe-info" type="text/x-dot-template">
{assign sanitize_f = (f) => Math.round(f * Math.pow(10, 5)) / Math.pow(10, 5)}

<div class="window resizable" style="{if !$edit}display: none;{/if}">
<div class="header">
	<span>
		#TODO
		Item {@$recipe.name || ""} {@serialize_db_id($recipe.id || 0)}
	</span>
	<div class="menu">
		<i class="minimize fa" aria-hidden="true"></i>
		<i class="maximize fa" aria-hidden="true"></i>
		<i class="close fa fa-close" aria-hidden="true"></i>
	</div>
</div>
<div class="content" style="overflow: hidden; padding-right: 28px;">
<div id="recipe_info" class="recipe_info {if $edit}edit{/if}">
	{assign recipe_id = $recipe.id}
	{assign data_preview = 'data-preview'}
	{if $recipe_id > 0 && !$recipe._db?.type}
			<p class="data nowrap">Unknown Recipe #{@$recipe_id}</p>
	{else if $recipe_id > 0}
			{assign prev = $recipe._db?.prev || {\}}

			<p>
				{if $prev.id == -1}
					<p class="diff-plus" style="color: #32dc32;">(New) Recipe #{@$recipe.id}</p>
				{else}
					<p class="data">Recipe #{@$recipe.id}</p>
				{/if}
				<div class="hr"></div>
			</p>

			<p class="data">Name: {@$recipe.name || "(unnamed)"}</p>
			{if $prev.name}<p class="prev">Name: {@$prev.name || "(unnamed)"}</p>{/if}
			<p class="data">Tpl: {@$recipe._db.tpl_name || "(unnamed)"}</p>
			{if $prev._tpl_name}<p class="prev">Tpl: {@$prev._tpl_name || "(unnamed)"}</p>{/if}

			<p style="display: flex; flex-direction: column; margin: 5px 0;">
				<span class="data">Crafted: {@$recipe.num_to_make}x:</span>
				{if $prev.num_to_make}<span class="prev">Crafted: {@$prev.num_to_make}x:</span>{/if}
			</p>

			<div class="targets">
				{assign targets = ($simplified ? ($recipe.targets?.filter(t => t?.id)) : $recipe.targets) || []}
				{for i = 0; i < 4; i++}
					<div class="target">
						{assign tgt = $targets[$i] || \{ id: 0 \}}
						<span class="prob">{@$sanitize_f(($tgt.prob || 0) * 100)}%</span>
						<span class="item" data-id="{@$tgt.id}" tabindex="0">
							<img{ } src="{@$tgt.id ? Item.get_icon($db.items[$tgt.id]?.icon || 0) : (ROOT_URL + 'img/itemslot.png')}">
						</span>
					</div>
				{/for}
			</div>
			{if $prev.targets}
				<div class="targets prev">
					{for i = 0; i < 4; i++}
						<div class="target">
							{assign tgt = $prev.targets[$i] || \{ id: 0 \}}
							<span class="prob">{@$sanitize_f(($tgt.prob || 0) * 100)}%</span>
							<span class="item" data-id="{@$tgt.id}" tabindex="0">
								<img{ } src="{@$tgt.id ? Item.get_icon($db.items[$tgt.id]?.icon || 0) : (ROOT_URL + 'img/itemslot.png')}">
							</span>
						</div>
					{/for}
				</div>
			{/if}

			<p style="margin-top: 5px;">
				<div class="data flex-equal">
					<span>
						{if !$recipe.skill_id}
							Generic Craft
						{else}
							(Req. {@RecipeTooltip.craft_types[$recipe.skill_id]?.name} Lv {@$recipe.skill_level})
						{/if}
					</span>
					<span>Fail chance: {@$sanitize_f(($recipe.fail_prob || 0) * 100)}%</span>
				</div>
				{if $prev.skill_id !== undefined || $prev.skill_level !== undefined || $prev.fail_prob !== undefined}
					<div class="prev flex-equal">
						<span>
							{if get_default($prev.skill_id, $recipe.skill_id) === 0}
								Generic Craft
							{else}
								(Req. {@RecipeTooltip.craft_types[get_default($prev.skill_id, $recipe.skill_id)]?.name} Lv {@get_default($prev.skill_level, $recipe.skill_level)})
							{/if}
						</span>
						<span>Fail chance: {@get_default($prev.fail_prob, $recipe.fail_prob || 0) * 100}%</span>
					</div>
				{/if}
			</p>

			<p style="margin: 5px 0;">Mats:</p>
			{assign materials = ($simplified ? ($recipe.mats?.filter(t => t?.id)) : $recipe.mats) || []}
			{for off = 0; off < 8; off += 4}
				<div class="materials">
					{for i = $off; i < $off + 4; i++}
						<div class="material">
							{assign tgt = $materials[$i] || \{ id: 0 \}}
							<span class="num">{@$tgt.num || "0"}</span>
							<span class="item" data-id="{@$tgt.id}" tabindex="0">
								<img{ } src="{@$tgt.id ? Item.get_icon($db.items[$tgt.id]?.icon || 0) : (ROOT_URL + 'img/itemslot.png')}">
							</span>
						</div>
					{/for}
				</div>
				{if $prev.mats && ($prev.mats[$off] || $prev.mats[$off + 1] || $prev.mats[$off + 2] || $prev.mats[$off + 3])}
					<div class="materials prev">
						{for i = $off; i < $off + 4; i++}
							<div class="material">
								{assign tgt = $prev.mats[$i] || \{ id: 0 \}}
								<span class="num">{@$tgt.num || "0"}</span>
								<span class="item" data-id="{@$tgt.id}" tabindex="0">
									<img{ } src="{@$tgt.id ? Item.get_icon($db.items[$tgt.id]?.icon || 0) : (ROOT_URL + 'img/itemslot.png')}">
								</span>
							</div>
						{/for}
					</div>
				{/if}
			{/for}

			<p style="margin-top: 5px;">
				<div class="data flex-equal">
					<span>Coins: {@$recipe.coins || 0}</span>
				</div>
				{if $prev.coins}
					<div class="prev flex-equal">
						<span>Coins: {@$prev.coins || 0}</span>
					</div>
				{/if}
			</p>

			<p style="margin-top: 5px;">
			<div class="data flex-equal">
				<span>Craft time {@$recipe.duration || 0}s</span>
				<span>Gained XP: {@$recipe.xp || 0}</span>
				<span>SP: {@$recipe.sp || 0}</span>
			</div>
			{if $prev.xp !== undefined || $prev.sp !== undefined || $prev.duration !== undefined}
				<div class="prev flex-equal">
					<span>Craft time {@get_default($prev.duration, $recipe.duration || 0)}s</span>
					<span>Gained XP: {@get_default($prev.xp, $recipe.xp || 0)}</span>
					<span>SP: {@get_default($prev.sp, $recipe.sp || 0)}</span>
				</div>
			{/if}

		</span>
	{/if}
	</span>

{@@
<style>
#recipe_info {
	border-radius: 3px;
	padding: 5px;
	position: relative;
	writing-mode: vertical-lr;
	display: flex;
	align-content: flex-start;
	flex-wrap: wrap;
	margin-right: -4px;
}

#recipe_info:not(.edit) {
	background-color: rgba(0, 0, 0, 0.9);
}

#recipe_info > * {
	writing-mode: horizontal-tb;
	margin-right: 4px;
}

.recipe_info .section {
	width: 282px;
}

.recipe_info.edit .section {
	background-color: rgb(251 241 241);
	border: 1px solid #e0b0b0;
	padding: 6px;
	padding-left: 14px;
	padding-right: 14px;
	margin-top: 4px;
}

.recipe_info.edit .section-header {
	margin-left: -6px;
	font-weight: bold;
	align-self: end;
}

.materials,
.targets {
	display: flex;
}

.target,
.material {
	display: flex;
	margin: 1px 3px;
	min-width: 60px;
}

.targets .prob,
.materials .num {
	display: inline-block;
	margin: 5px 3px 0 0;
	vertical-align: top;
	white-space: nowrap;
	min-width: 26px;
	text-align: right;
}

.target .item,
.target .item > img,
.material .item,
.material .item > img {
	width: 24px;
	height: 24px;
}

.diff-plus {
	margin-left: 0;
}

.width-5c,
.input.width-5c {
	width: 38px;
}

.width-4c,
.input.width-4c {
	width: 30px;
}

.width-3c,
.input.width-3c {
	width: 22px;
}

.recipe_info.edit .input {
	margin: 2px 0;
	white-space: nowrap;
}

.recipe_info.edit span:not(.input) {
	display: flex;
	align-items: baseline;
	white-space: pre-wrap;
}

.flex-columns {
	align-items: baseline;
}

.hr {
	background-color: #fff;
	height: 1px;
	margin: 2px -1px;
}

.flex-equal > * {
	flex-basis: unset;
}
</style>
@@}
</script>
