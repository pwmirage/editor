<script id="tpl-diff" type="text/x-dot-template">
{assign type = $obj._db.type}
{assign generic_fields = PWDB.get_type_fields($type) || \{\} }

{if $diff}
	{for fname in $diff}
		{assign f = $generic_fields[$fname]}
		{if !$f}{continue}{/if}
		{* there might be no diff in the end (happens sometimes) *}
		{if DB.cmp($diff[$fname], $prev[$fname]) == 0}{continue}{/if}

		<div class="block">
			<span class="header">{@$f.name}</span>
			<span class="minus">{@$prev[$fname] || '(unnamed)'}</span>
			<span class="plus">{@$diff[$fname] || '(unnamed)'}</span>
		</div>
	{/for}
{/if}

{if !$diff}
	<div class="block">No changes</div>
{else if $type == 'npc_sells'}
	{for i = 0; i < 8; i++}
		{if !$diff.pages}{break}{/if}
		{if !$diff.pages[$i]}{continue}{/if}
		{assign pageid = $i}
		{assign page = $diff.pages[$i]}
		{assign prev_page = $prev.pages[$i]}
		<div class="block">
			<span class="header">Tab "{@($page.title ?? $prev.pages?.[$i]?.title) || '(unnamed)'}" #{@$i}</span>
			{if $page.title !== undefined}
				<div class="block">
					<span class="header">Name</span>
					<span class="minus">{@$prev.pages?.[$i]?.title || '(unnamed)'}</span>
					<span class="plus">{@$page.title}</span>
				</div>
			{/if}
			{assign rows = new Set()}
			{for p_item_id in ($page.item_id || \{\})}
				{assign rowid = Math.floor($p_item_id / 8)}
				{$rows.add($rowid)}
			{/for}
			{for rowid of $rows}
				<div class="block">
					<span class="header">Row {@$rowid}</span>
					<div class="goods">
					<div class="flex-rows" style="gap: 2px;">
						<span class="minus"></span>
						<span class="plus"></span>
					</div>
					{for i = 0; i < 8; i++}
						{assign prev_id = $prev_page?.item_id?.[$rowid * 8 + $i] || 0}
						{assign cur_id = $page?.item_id?.[$rowid * 8 + $i] ?? $prev_id}
						<div class="flex-rows" style="gap: 2px;">
							<span class="item {if $prev_id == $cur_id}unchanged{/if}" data-id="{@$prev_id}"><img{ } src="{@PWPreview.get_item_icon($db, $prev_id)}" alt=""></span>
							<span class="item {if $prev_id == $cur_id}unchanged{/if}" data-id="{@$cur_id}"><img{ } src="{@PWPreview.get_item_icon($db, $cur_id)}" alt=""></span>
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
		{assign prev_page = $prev.pages[$i]}
		<div class="block">
			<span class="header">Tab "{@($page.title ?? $prev.pages?.[$i]?.title) || '(unnamed)'}" #{@$i}</span>
			{if $page.title !== undefined}
				<div class="block">
					<span class="header">Name</span>
					<span class="minus">{@$prev.pages?.[$i]?.title || '(unnamed)'}</span>
					<span class="plus">{@$page.title}</span>
				</div>
			{/if}
			{assign rows = new Set()}
			{for p_recipe_id in ($page.recipe_id || \{\})}
				{assign rowid = Math.floor($p_recipe_id / 8)}
				{$rows.add($rowid)}
			{/for}
			{for rowid of $rows}
				<div class="block">
					<span class="header">Row {@$rowid}</span>
					<div class="crafts">
					<div class="flex-rows" style="gap: 2px;">
						<span class="minus"></span>
						<span class="plus"></span>
					</div>
					{for i = 0; i < 8; i++}
						{assign prev_id = $prev_page?.recipe_id?.[$rowid * 8 + $i] || 0}
						{assign cur_id = $page?.recipe_id?.[$rowid * 8 + $i] ?? $prev_id}
						<div class="flex-rows" style="gap: 2px;">
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
			<table style="width: 300px;">
				<tr class="header">
					<td style="text-align: left;">Pos</td><td>X</td><td>Y</td><td>Z</td>
				</tr>
				<tr>
					<td style="text-align: right;"><span class="minus">&nbsp;&nbsp;</span></td>
					{for i = 0; i < 3; i++}
						<td>{@Math.floor(($prev.pos[$i] || 0) * 100) / 100}</td>
					{/for}
				</tr>
				<tr>
					<td style="text-align: right;"><span class="plus">&nbsp;&nbsp;</span></td>
					{for i = 0; i < 3; i++}
						<td>{@Math.floor(($diff.pos[$i] || $prev.pos[$i] || 0) * 100) / 100}</td>
					{/for}
				</tr>
			</table>
		</div>
	{/if}

	{if $diff.dir}
		<div class="block">
			{* assume one dir can't be changed without the other *}
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
					{assign pspawned_id = $prev.groups?.[$groupidx]?.type}
					{assign pspawned = db.npcs[$pspawned_id] || db.monsters[$pspawned_id] || db.mines[$pspawned_id]}
					{if $obj.type != 'npc'}<span class="header">Group {@(parseInt($groupidx) + 1)}.</span>{/if}
					{if $pspawned}<span class="minus">{@$pspawned?.name || '(unnamed)'} {@DB.serialize_id($pspawned_id)}</span>{/if}
					<span class="plus">{@$dspawned?.name || '(unnamed)'} {@DB.serialize_id($dspawned_id)}</span>
				</div>
			{/if}
		</div>
	{/for}
{/if}
</script>
