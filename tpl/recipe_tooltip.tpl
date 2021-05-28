<script id="tpl-recipe-info" type="text/x-dot-template">
{assign sanitize_f = (f) => Math.round(f * Math.pow(10, 5)) / Math.pow(10, 5)}

<div id="recipe_info" class="recipe_info {if $edit}edit{/if} {if $prev.id == -1}no-diff{/if}">
{assign recipe_id = $recipe.id}
{assign data_preview = 'data-preview'}
{assign get_default = (a,b) => (a ?? b) || 0}
{assign is_modified = (field) => $recipe[field] !== $prev[field] }
{if $recipe_id > 0 && !$recipe._db?.type}
	<p class="data nowrap">Unknown Recipe #{@$recipe_id}</p>
{else if $recipe_id > 0}

	{if $prev.name && $is_modified('name')}<p class="prev">Name: {@$prev.name || "(unnamed)"}</p>{/if}
	<p class="data {if $recipe.name && !$prev.name}diff-plus{/if}">Name: {@$recipe.name || "(unnamed)"}</p>

	<p style="display: flex; flex-direction: column; margin: 5px 0;">
		{if $prev.num_to_make && $is_modified('num_to_make')}<span class="prev">Crafted: {@$prev.num_to_make || 0}x:</span>{/if}
		<span class="data {if $recipe.num_to_make && !$prev.num_to_make}diff-plus{/if}">Crafted: {@$recipe.num_to_make || 0}x:</span>
	</p>

	{if DB.is_obj_nonempty($prev.targets) && DB.cmp($recipe.targets, $prev.targets)}
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
	<div class="targets data {if !DB.is_obj_nonempty($prev.targets)}diff-plus{/if}">
		{for i = 0; i < 4; i++}
			<div class="target">
				{assign tgt = $recipe.targets[$i] || \{ id: 0 \}}
				<span class="prob">{@$sanitize_f(($tgt.prob || 0) * 100)}%</span>
				<span class="item" data-id="{@$tgt.id}" tabindex="0">
					<img{ } src="{@$tgt.id ? Item.get_icon($db.items[$tgt.id]?.icon || 0) : (ROOT_URL + 'img/itemslot.png')}">
				</span>
			</div>
		{/for}
	</div>

	<p style="margin-top: 5px;">
		{if ($prev.skill_id || $prev.skill_level || $prev.fail_prob) && ($is_modified('skill_id') || $is_modified('skill_level') || $is_modified('fail_prob'))}
			<div class="prev flex-equal">
				<span>
					{if $get_default($prev.skill_id, $recipe.skill_id) === 0}
						Generic Craft
					{else}
						(Req. {@RecipeTooltip.craft_types[$get_default($prev.skill_id, $recipe.skill_id)]?.name} Lv {@$get_default($prev.skill_level, $recipe.skill_level)})
					{/if}
				</span>
				<span>Fail chance: {@$get_default($prev.fail_prob, $recipe.fail_prob || 0) * 100}%</span>
			</div>
		{/if}
		<div class="data flex-equal {if ($recipe.skill_id || $recipe.skill_level || $recipe.fail_prob) && !($prev.skill_id || $prev.skill_level || $prev.fail_prob)}diff-plus{/if}">
			<span>
				{if !$recipe.skill_id}
					Generic Craft
				{else}
					(Req. {@RecipeTooltip.craft_types[$recipe.skill_id]?.name} Lv {@$recipe.skill_level})
				{/if}
			</span>
			<span>Fail chance: {@$sanitize_f(($recipe.fail_prob || 0) * 100)}%</span>
		</div>
	</p>

	<p style="margin: 5px 0;" class="{if $recipe.mats && !$prev.mats}diff-plus{/if}">Mats:</p>
	{for off = 0; off < 8; off += 4}
		{assign if_4 = (func) => \{ for (let i = 0; i < 4; i++) if (func($off + i)) return true; return false \}}
		{assign prev_printed = false}
		{if $if_4((i) => DB.is_obj_nonempty($prev.mats?.[i]) && DB.cmp($recipe.mats?.[i], $prev?.mats[i]))}
			{assign prev_printed = false}
			<div class="materials prev">
				{for i = $off; i < $off + 4; i++}
					<div class="material">
						{assign tgt = $prev.mats?.[$i] || \{ id: 0 \}}
						<span class="num">{@$tgt.num || "0"}</span>
						<span class="item" data-id="{@$tgt.id}" tabindex="0">
							<img{ } src="{@$tgt.id ? Item.get_icon($db.items[$tgt.id]?.icon || 0) : (ROOT_URL + 'img/itemslot.png')}">
						</span>
					</div>
				{/for}
			</div>
		{/if}
		<div class="materials data {if !$prev_printed && $if_4((i) => (DB.is_obj_nonempty($recipe.mats?.[i]) && !DB.is_obj_nonempty($prev.mats?.[i])))}diff-plus{/if}">
			{for i = $off; i < $off + 4; i++}
				<div class="material">
					{assign tgt = $recipe.mats?.[$i] || \{ id: 0 \}}
					<span class="num">{@$tgt.num || "0"}</span>
					<span class="item" data-id="{@$tgt.id}" tabindex="0">
						<img{ } src="{@$tgt.id ? Item.get_icon($db.items[$tgt.id]?.icon || 0) : (ROOT_URL + 'img/itemslot.png')}">
					</span>
				</div>
			{/for}
		</div>
	{/for}

	<p style="margin-top: 5px;">
		{if $prev.coins && $is_modified('coins')}
			<div class="prev flex-equal">
				<span>Coins: {@$prev.coins || 0}</span>
			</div>
		{/if}
		<div class="data flex-equal {if $recipe.coins && !$prev.coins}diff-plus{/if}">
			<span>Coins: {@$recipe.coins || 0}</span>
		</div>
	</p>

	<p style="margin-top: 5px;">
		{if ($prev.xp || $prev.sp || $prev.duration) && ($is_modified('xp') || $is_modified('sp') || $is_modified('duration'))}
			<div class="prev flex-equal">
				<span>Craft time {@$get_default($prev.duration, $recipe.duration || 0)}s</span>
				<span>Gained XP: {@$get_default($prev.xp, $recipe.xp || 0)}</span>
				<span>SP: {@$get_default($prev.sp, $recipe.sp || 0)}</span>
			</div>
		{/if}
		<div class="data flex-equal {if ($recipe.xp || $recipe.sp || $recipe.duration) && !($prev.xp || $prev.sp || $prev.duration)}diff-plus{/if}">
			<span>Craft time {@$recipe.duration || 0}s</span>
			<span>Gained XP: {@$recipe.xp || 0}</span>
			<span>SP: {@$recipe.sp || 0}</span>
		</div>
	</p>
{/if}
</div>

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
	text-align: left;
	padding-left: 13px;
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

.data,
.prev,
.diff-plus {
	position: relative;
}

.prev + .data:before,
.diff-plus:before,
.prev:before {
	content: '+';
	color: #32dc32;
	font-family: Arial, Helvetica, sans-serif;
	font-size: 12px;
	font-weight: bold;
	position: absolute;
	left: -8px;
}

.no-diff .prev + .data:before,
.no-diff .diff-plus:before,
.no-diff .prev:before {
	content: none;
}

.no-diff .diff-plus {
	color: #fff;
}

.prev:before {
	content: '-';
	color: red;
}

.targets.prev:before,
.materials.prev:before,
.targets.diff-plus:before,
.materials.diff-plus:before,
.targets.prev + .targets.data:before,
.materials.prev + .targets.data:before {
	top: 5px;
}
</style>
@@}
</script>
