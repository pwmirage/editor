<script id="tpl-history" type="text/x-dot-template">
<div class="window resizable" style="width: 800px; height: 600px;">
{assign project = db.metadata[1]}
<div class="header">
	<span>Project: XYZ #{@$project.pid}</span>
	<div class="menu">
		<i class="minimize fa"></i>
		<i class="maximize fa"></i>
		<i class="close fa fa-close"></i>
	</div>
</div>
<div class="content flex-rows" style="overflow: hidden;">
	<div class="flex-columns tabs" style="margin-bottom: 8px;">
		<div class="tab" onclick="{serialize $win}.select_tab(0);">Base</div>
		<div class="tab" onclick="{serialize $win}.select_tab(1);">History</div>
		<div class="tab" onclick="{serialize $win}.select_tab(2);">Changes</div>
	</div>

	<div class="tabcontents">
		<div id="base"></div>
		<div id="history" class="history">
			{assign cur_generation = 0}
			{for gen of db.changelog}{for diff of $gen}
				{assign obj = $diff._db.obj}
				{assign type = $obj._db.type}
				{if $diff._db.generation > $cur_generation}
					{assign cur_generation = $diff._db.generation}
					{assign project = $win.get_project(gen)}
					{if !$project_reached && $diff._db.generation == db.project_changelog_start_gen}
						{assign project_reached = true}
						<div>Your changes start here</div>
					{/if}
					{if $project?.pid || $project?.edit_time}
						<div>Project {if $project.pid}#{@$project.pid}{/if} {if $project.edit_time}{@(new Date($project.edit_time * 1000)).toLocaleString()}{/if}</div>
					{else}
						{* <div>New generation</div> *}
					{/if}
				{/if}
				{assign generic_fields = PWDB.get_type_fields($type) || \{\} }
				{if $type == 'metadata'}{continue}{/if}

				<div>
					<div class="collapsible" onclick="{serialize $win}.collapse(this);">
						{if $type.startsWith('spawners_')}
							{assign spawned_id = $obj.groups?.[0]?.type || 0}
							{assign typename = $obj.type == 'npc' ? 'NPC' : ($obj.type == 'resource' ? 'Resource' : 'Monster')}
							{assign spawned = db.npcs[$spawned_id] || db.monsters[$spawned_id] || db.mines[$spawned_id]}
							<span>{@$typename} Spawner: {@$obj.name || $spawned.name || ''} {@serialize_db_id($obj.id)} {@$win.used_by($obj)}</span>
						{else}
							<span>{@PWDB.get_type_name($obj._db.type)}: {@$obj.name || ''} {@serialize_db_id($obj.id)} {@$win.used_by($obj)}</span>
						{/if}
					</div>
					<div>

					{for fname in $diff}
						{assign f = $generic_fields[$fname]}
						{if !$f}{continue}{/if}
						{assign prev = $win.find_previous($diff, (d) => d[$fname])}
						{* there might be no diff in the end (happens sometimes) *}
						{if DB.cmp($diff[$fname], $prev[$fname]) == 0}{continue}{/if}

						<div class="block">
							<span class="header">{@$f.name}</span>
							<span class="minus">{@$prev[$fname] || '(unnamed)'}</span>
							<span class="plus">{@$diff[$fname] || '(unnamed)'}</span>
						</div>
					{/for}

					{if $type == 'npc_sells'}
						{for i = 0; i < 8; i++}
							{if !$diff.pages}{break}{/if}
							{if !$diff.pages[$i]}{continue}{/if}
							{assign pageid = $i}
							{assign page = $diff.pages[$i]}
							{assign prev = $win.find_previous($diff, (d) => d.pages && d.pages[$i]?.title)}
							<div class="block">
								<span class="header">Tab "{@($page.title ?? $prev.pages[$i].title) || '(unnamed)'}" #{@$i}</span>
								{if $page.title !== undefined}
									<div class="block">
										<span class="header">Name</span>
										<span class="minus">{@$prev.pages[$i].title}</span>
										<span class="plus">{@$page.title}</span>
									</div>
								{/if}
								{assign rows = new Set()}
								{for p_item_id in ($page.item_id || \{\})}
									{assign rowid = Math.floor($p_item_id / 8)}
									{$rows.add($rowid)}
								{/for}
								{if $rows.size}
									{assign prev_arr = $win.filter_previous(diff, (d) => d.pages && d.pages[$pageid]?.item_id)}
									{assign get_item_id = (id) => \{ const obj = $prev_arr.find((d) => d.pages?.[$pageid]?.item_id?.[id]); if (obj) return obj.pages[$pageid].item_id[id]; return 0; \}}
								{/if}
								{for rowid of $rows}
									<div class="block">
										<span class="header">Row {@$rowid}</span>
										<div class="goods">
										<div class="flex-rows" style="gap: 2px;">
											<span class="minus"></span>
											<span class="plus"></span>
										</div>
										{for i = 0; i < 8; i++}
											{assign prev_id = $get_item_id($rowid * 8 + $i)}
											{assign cur_id = $page.item_id[$rowid * 8 + $i] ?? $prev_id}
											<div class="flex-rows" style="gap: 2px;" onmousemove="PWPreview.try_show_obj_tooltip(db, event);" onmouseleave="this.onmousemove(event);">
												<span class="item {if $prev_id == $cur_id}unchanged{/if}" data-id="{@$prev_id}"><img{ } src="{@PWPreview.get_item_icon(db, $prev_id)}" alt=""></span>
												<span class="item {if $prev_id == $cur_id}unchanged{/if}" data-id="{@$cur_id}"><img{ } src="{@PWPreview.get_item_icon(db, $cur_id)}" alt=""></span>
											</div>
										{/for}
										</div>
									</div>
								{/for}
							</div>
						{/for}
					{else if $type == 'npc_crafts'}
						{for i = 0; i < 8; i++}
							{if !$diff.pages}{break}{/if}
							{if !$diff.pages[$i]}{continue}{/if}
							{assign pageid = $i}
							{assign page = $diff.pages[$i]}
							{assign prev = $win.find_previous($diff, (d) => d.pages && d.pages[$i]?.title)}
							<div class="block">
								<span class="header">Tab "{@($page.title ?? $prev.pages[$i].title) || '(unnamed)'}" #{@$i}</span>
								{if $page.title !== undefined}
									<div class="block">
										<span class="header">Name</span>
										<span class="minus">{@$prev.pages[$i].title}</span>
										<span class="plus">{@$page.title}</span>
									</div>
								{/if}
								{assign rows = new Set()}
								{for p_recipe_id in ($page.recipe_id || \{\})}
									{assign rowid = Math.floor($p_recipe_id / 8)}
									{$rows.add($rowid)}
								{/for}
								{if $rows.size}
									{assign prev_arr = $win.filter_previous(diff, (d) => d.pages && d.pages[$pageid]?.recipe_id)}
									{assign get_recipe_id = (idx) => \{ const obj = $prev_arr.find((d) => d.pages?.[$pageid]?.recipe_id?.[idx]); if (obj) return obj.pages[$pageid].recipe_id[idx]; return 0; \}}
								{/if}
								{for rowid of $rows}
									<div class="block">
										<span class="header">Row {@$rowid}</span>
										<div class="crafts">
										<div class="flex-rows" style="gap: 2px;">
											<span class="minus"></span>
											<span class="plus"></span>
										</div>
										{for i = 0; i < 8; i++}
											{assign prev_id = $get_recipe_id($rowid * 8 + $i)}
											{assign cur_id = $page.recipe_id[$rowid * 8 + $i] ?? $prev_id}
											<div class="flex-rows" style="gap: 2px;" onmousemove="PWPreview.try_show_obj_tooltip(db, event);" onmouseleave="this.onmousemove(event);">
												<span class="recipe {if $prev_id == $cur_id}unchanged{/if}" data-id="{@$prev_id}"><img{ } src="{@NPCCraftsWindow.get_recipe_icon($prev_id)}" alt=""></span>
												<span class="recipe {if $prev_id == $cur_id}unchanged{/if}" data-id="{@$cur_id}"><img{ } src="{@NPCCraftsWindow.get_recipe_icon($cur_id)}" alt=""></span>
											</div>
										{/for}
										</div>
									</div>
								{/for}
							</div>
						{/for}
					{else if $type.startsWith('spawners_')}
						{if $diff.pos && ($diff.pos[0] || $diff.pos[1] || $diff.pos[2])}
							<div class="block">
								{assign prev = []}
								{for i = 0; i < 3; i++}
									{$prev[$i] = $win.find_previous($diff, (d) => d.pos?.[$i]).pos?.[$i]}
								{/for}

								<table style="width: 300px;">
									<tr class="header">
										<td style="text-align: left;">Pos</td><td>X</td><td>Y</td><td>Z</td>
									</tr>
									<tr>
										<td style="text-align: right;"><span class="minus">&nbsp;&nbsp;</span></td>
										{for i = 0; i < 3; i++}
											<td>{@Math.floor(($prev[$i] || 0) * 100) / 100}</td>
										{/for}
									</tr>
									<tr>
										<td style="text-align: right;"><span class="plus">&nbsp;&nbsp;</span></td>
										{for i = 0; i < 3; i++}
											<td>{@Math.floor(($diff.pos[$i] || $prev[$i] || 0) * 100) / 100}</td>
										{/for}
									</tr>
								</table>
							</div>
						{/if}

						{if $diff.dir}
							<div class="block">
								{* assume one dir can't be changed without the other *}
								{assign prev = $win.find_previous($diff, (d) => d.dir)}
								<span class="header">Direction</span>
								<span class="minus">{@Math.round(Math.atan2($prev.dir[2], $prev.dir[0]) * 10000) / 10000}</span>
								<span class="plus">{@Math.round(Math.atan2($diff.dir[2], $diff.dir[0]) * 10000) / 10000}</span>
							</div>
						{/if}

						{for groupidx in ($diff.groups || \{\}) }
							{assign dgroup = $diff.groups[$groupidx]}
							<div class="block">

								{assign dspawned_id = $dgroup.type}
								{assign dspawned = db.npcs[$dspawned_id] || db.monsters[$dspawned_id] || db.mines[$dspawned_id]}
								<span class="header">{if $obj.type == 'npc'}Type{else}Group {@$groupidx + 1}{/if}</span>
								{if $dgroup.type}
									<div class="block">
										{assign prev = $win.find_previous($diff, (d) => d?.groups?.[$groupidx]?.type)}
										{assign pspawned_id = $prev.groups?.[$groupidx]?.type}
										{assign pspawned = db.npcs[$pspawned_id] || db.monsters[$pspawned_id] || db.mines[$pspawned_id]}
										{if $obj.type != 'npc'}<span class="header">Group {@(parseInt($groupidx) + 1)}.</span>{/if}
										{if $pspawned}<span class="minus">{@$pspawned?.name || '(unnamed)'} {@serialize_db_id($pspawned_id)}</span>{/if}
										<span class="plus">{@$dspawned?.name || '(unnamed)'} {@serialize_db_id($dspawned_id)}</span>
									</div>
								{/if}
							</div>
						{/for}
				{/if}
				</div>
				</div>
			{/for}{/for}
		</div>
		<div id="changes" class="changes">
		<div id="changed-objects">
			{assign cur_generation = 0}
			{assign mod_objects = new Set()}
			{for gen_idx = db.changelog.length - 1; gen_idx >= db.project_changelog_start_gen; gen_idx--}
				{assign gen = db.changelog[$gen_idx]}
				{for diff of $gen}
					{$mod_objects.add($diff._db.obj)}
				{/for}
			{/for}
			{for obj of $mod_objects}
				{if !$obj._db.project_initial_state}
					{continue}
				{/if}
				{assign diff = get_obj_diff($obj, $obj._db.project_initial_state)}
				{if !$diff}
					{continue}
				{/if}
				{if $obj._db.type == 'metadata'}{continue}{/if}
				{assign type = PWPreview.get_obj_type($obj)}
				<div style="font-size: 13px;" onclick="{serialize $type}.open_fn();">
					<div class="header">
						<img src="{@PWPreview.get_obj_img(db, $obj)}">
						<span>{@$obj.name || $type.name } {@serialize_db_id($obj.id)}</span>
					</div>

					{@PWPreview.diff(\{ db, obj: $obj, diff: $diff, prev: $obj._db.project_initial_state \})}
				</div>
			{/for}
		</div>
		</div>
	</div>
</div>
</div>

{@@
<style>
.tabs {
	border-bottom: 1px solid #e0b0b0;
	margin: 0 -6px;
	padding: 0 6px;
}

.tabs > .tab {
	background-color: #dddddd;
	padding: 4px 10px;
	vertical-align: baseline;
	border: 1px solid #e0b0b0;
	margin-bottom: -1px;
	cursor: pointer;
}

.tabs > .tab.active {
	background-color: #fafafa;
	border-bottom: 1px solid #fafafa;
}

.tabcontents {
	overflow: hidden;
}

.tabcontents > *:not(.active) {
	display: none;
}

.history {
	display: flex;
	flex-direction: column-reverse;
	overflow-y: auto;
	overflow-x: hidden;
	height: 100%;
	font-size: 13px;
	line-height: 15px;
}

.collapsible {
	padding: 4px 4px;
	border-bottom: 2px solid #c5c5c5;
}

.collapsible:hover {
    background-color: #dadada;
}

.collapsible + * {
	padding: 0;
}

.collapsible.active + * {
	border-bottom: 2px solid #c5c5c5;
}

.block {
	display: flex;
	flex-direction: column;
	padding: 4px 5px;
	background-color: rgba(0, 0, 0, 0.05);
}

.block > * {
	margin-left: 6px;
}

.block > table {
	margin-left: 0;
}

.block .header {
	margin-left: 3px;
	font-weight: bold;
}

.plus:before,
.minus:before {
	content: '+';
	display: inline-block;
	width: 10px;
	font-weight: bold;
	color: green;
}

.minus:before {
	content: '-';
	color: red;
}

.minus {
	color: #9e9e9e;
}

table {
	width: fit-content;
	table-layout: fixed;
	font-size: 13px;
}

.crafts,
.goods {
	display: flex;
	flex-direction: columns;
	gap: 2px;
}

.crafts .recipe,
.goods .item,
.crafts .recipe > img,
.goods .item > img,
.crafts .minus,
.goods .minus,
.crafts .plus,
.goods .plus {
	width: 22px;
	height: 22px;
}

.crafts .minus,
.goods .minus,
.crafts .plus,
.goods .plus {
	line-height: 24px;
	width: auto;
}

.item,
.recipe {
	position: relative;
}

.recipe.unchanged:after,
.item.unchanged:after {
	content: ' ';
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background-color: #fff;
	opacity: 0.45;
}

#changes.active {
	display: flex;
	overflow-y: auto;
	overflow-x: hidden;
	height: 100%;
}

#changed-objects {
	display: flex;
	flex-wrap: wrap;
	column-gap: 5px;
}

#changed-objects > div {
	background-color: #dccfcf;
	border-radius: 2px;
	border-width: 0;
	color: rgba(33, 33, 33, 1);
	cursor: pointer;
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	font-weight: 400;
	margin: 0;
	padding: 4px;
	padding-right: 6px;
	text-decoration: none;
	line-height: 1.48;
	user-select: none;
	column-gap: 3px;
	min-width: 250px;
	min-height: 32px;
	margin-top: 5px;
	overflow: hidden;
}

#changed-objects > div:hover {
	background-color: #d0c5c5;
	text-decoration: none;
}


#changed-objects > div > .header {
	display: flex;
	column-gap: 3px;
	margin-bottom: 5px;
}

#changed-objects > div > .header > img {
	width: 32px;
	height: 32px;
}

#changed-objects > div > .header > span {
	align-self: center;
	line-height: 16px;
	overflow: hidden;
	margin: auto;
	margin-left: 0;
}
</style>
@@}

</script>
