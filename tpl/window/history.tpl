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
						<div>New generation</div>
					{/if}
				{/if}
				{if $type == 'npc_sells'}
					<div>
					<div class="collapsible" onclick="{serialize $win}.collapse(this);">
						<span>Goods: {@$obj._name || $obj.name || ''} {@serialize_db_id($obj.id)} {@$win.used_by($obj)}</span>
					</div>
					<div>
						{if $diff._name}
							<div class="block">
								{assign prev = $win.find_previous(diff, (d) => d._name)}
								<span class="header">Name</span>
								<span class="minus">{@$prev._name}</span>
								<span class="plus">{@$diff._name}</span>
							</div>
						{/if}
						{if $diff.name}
							<div class="block">
								{assign prev = $win.find_previous(diff, (d) => d.name)}
								<span class="header">NPC Option</span>
								<span class="minus">{@$prev.name}</span>
								<span class="plus">{@$diff.name}</span>
							</div>
						{/if}
						{for i = 0; i < 8; i++}
							{if !$diff.pages}{break}{/if}
							{if !$diff.pages[$i]}{continue}{/if}
							{assign pageid = $i}
							{assign page = diff.pages[$i]}
							<div class="block">
								<span class="header">Tab "{@$page.title || '(unnamed)'}" #{@$i}</span>
								{if $page.title}
									<div class="block">
										{assign prev = $win.find_previous(diff, (d) => d.pages && d.pages[$i]?.title)}
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
											<div class="flex-rows" style="gap: 2px;" onmousemove="{serialize $win}.onmousemove(event);" onmouseleave="this.onmousemove(event);">
												<span class="item {if $prev_id == $cur_id}unchanged{/if}" data-id="{@$prev_id}"><img{ } src="{@$win.get_item($prev_id)}" alt=""></span>
												<span class="item {if $prev_id == $cur_id}unchanged{/if}" data-id="{@$cur_id}"><img{ } src="{@$win.get_item($cur_id)}" alt=""></span>
											</div>
										{/for}
										</div>
									</div>
								{/for}
							</div>
						{/for}
					</div>
					</div>
				{else if $type == 'npc_crafts'}
					<div>
					<div class="collapsible" onclick="{serialize $win}.collapse(this);">
						<span>Crafts: {@$obj._name || $obj.name || ''} {@serialize_db_id($obj.id)} {@$win.used_by($obj)}</span>
					</div>
					<div>
						{if $diff._name}
							<div class="block">
								{assign prev = $win.find_previous(diff, (d) => d._name)}
								<span class="header">Name</span>
								<span class="minus">{@$prev._name}</span>
								<span class="plus">{@$diff._name}</span>
							</div>
						{/if}
						{if $diff.name}
							<div class="block">
								{assign prev = $win.find_previous(diff, (d) => d.name)}
								<span class="header">NPC Option</span>
								<span class="minus">{@$prev.name}</span>
								<span class="plus">{@$diff.name}</span>
							</div>
						{/if}
						{for i = 0; i < 8; i++}
							{if !$diff.pages}{break}{/if}
							{if !$diff.pages[$i]}{continue}{/if}
							{assign pageid = $i}
							{assign page = diff.pages[$i]}
							<div class="block">
								<span class="header">Tab "{@$page.title || '(unnamed)'}" #{@$i}</span>
								{if $page.title}
									<div class="block">
										{assign prev = $win.find_previous(diff, (d) => d.pages && d.pages[$i]?.title)}
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
											<div class="flex-rows" style="gap: 2px;" onmousemove="{serialize $win}.onmousemove(event);" onmouseleave="this.onmousemove(event);">
												<span class="recipe {if $prev_id == $cur_id}unchanged{/if}" data-id="{@$prev_id}"><img{ } src="{@NPCCraftsWindow.get_recipe_icon($prev_id)}" alt=""></span>
												<span class="recipe {if $prev_id == $cur_id}unchanged{/if}" data-id="{@$cur_id}"><img{ } src="{@NPCCraftsWindow.get_recipe_icon($cur_id)}" alt=""></span>
											</div>
										{/for}
										</div>
									</div>
								{/for}
							</div>
						{/for}
					</div>
					</div>
				{else if $type.startsWith('spawners_')}
					<div>
					<div class="collapsible" onclick="{serialize $win}.collapse(this);">
						{assign spawned_id = $obj.groups?.[0]?.type || 0}
						{assign typename = $obj.type == 'npc' ? 'NPC' : ($obj.type == 'resource' ? 'Resource' : 'Monster')}
						{assign spawned = db.npcs[$spawned_id] || db.monsters[$spawned_id] || db.mines[$spawned_id]}
						<span>{@$typename} Spawner: {@$obj.name || $spawned.name || ''} {@serialize_db_id($obj.id)} {@$win.used_by($obj)}</span>
					</div>
					<div>
						{if $diff.name}
							<div class="block">
								{assign prev = $win.find_previous(diff, (d) => d.name)}
								<span class="header">Name</span>
								<span class="minus">{@$prev.name}</span>
								<span class="plus">{@$diff.name}</span>
							</div>
						{/if}

						{if $diff.pos && ($diff.pos[0] || $diff.pos[1] || $diff.pos[2])}
							<div class="block">
								{assign prev = []}
								{for i = 0; i < 3; i++}
									{$prev[$i] = $win.find_previous(diff, (d) => d.pos[$i]).pos?.[$i]}
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

						{for groupidx in ($diff.groups || \{\}) }
							{assign dgroup = $diff.groups[$groupidx]}
							<div class="block">

								{assign dspawned_id = $dgroup.type}
								{assign dspawned = db.npcs[$dspawned_id] || db.monsters[$dspawned_id] || db.mines[$dspawned_id]}
								<span class="header">{if $obj.type == 'npc'}Type{else}Group {@$groupidx + 1}{/if}</span>
								{if $dgroup.type}
									<div class="block">
										{assign prev = $win.find_previous(diff, (d) => d?.groups?.[$groupidx]?.type)}
										{assign pspawned_id = $prev.groups?.[$groupidx]?.type}
										{assign pspawned = db.npcs[$pspawned_id] || db.monsters[$pspawned_id] || db.mines[$pspawned_id]}
										{if $obj.type != 'npc'}<span class="header">Group {@(parseInt($groupidx) + 1)}.</span>{/if}
										{if $pspawned}<span class="minus">{@$pspawned?.name || '(unnamed)'} {@serialize_db_id($pspawned_id)}</span>{/if}
										<span class="plus">{@$dspawned?.name || '(unnamed)'} {@serialize_db_id($dspawned_id)}</span>
									</div>
								{/if}
							</div>
						{/for}
					</div>
					</div>
				{else}
					<span>{@$diff._db.obj._db.type}</span>
				{/if}
			{/for}{/for}
		</div>
		<div id="changes" class="changes"></div>
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
</style>
@@}

</script>
