<script id="tpl-diff-entry" type="text/x-dot-template">
<div class="block">
	{if $f.name}
		<span class="header">{@$f.name}</span>
	{/if}
	{if $f.type == 0}
		{if $prev}
			<span class="minus">{@$prev}</span>
		{/if}
		<span class="plus">{@$val || '(none)'}</span>
	{else if $f.type == 1}
		{if $prev}
			<span class="minus">{@$prev}</span>
		{/if}
		<span class="plus">{@$val || 0}</span>
	{else if $f.type == 2}
		{* TODO *}
		<span class="minus">{@$prev || 0}</span>
		<span class="plus">{@$val || 0}</span>
	{else if $f.type == 3}
		<span class="plus">{if $val}yes{else}no{/if}</span>
	{else if $f.type == 4}
		{for cf of $f.schema}
			{if $val[$cf.id] === undefined}
				{continue}
			{/if}
			{@PWPreview.render_diff_entry($cf, $val[$cf.id], $prev?.[$cf.id])}
		{/for}
	{else if $f.type == 5}
		{assign is_item_row = $f.schema.length == 2 && $f.schema[0].id == 'amount' && $f.schema[1].id == 'id' }
		<div style="display: flex; flex-wrap: wrap;" class="{if $is_item_row}item-row{/if}">
		{for idx in $val}
			{assign cval = $val[$idx]}
			{assign cprev = $prev?.[$idx]}

			{if $f.schema.length == 2 && $f.schema[0].id == 'amount' && $f.schema[1].id == 'id' }
				<div>
					<span class="minus" style="margin-top: 2px;">
						<span>{@$cprev?.amount || 0} x </span>
						<div class="item" data-id="{@$cprev?.id || 0}"><img src="{@Item.get_icon_by_item(db, $cprev?.id || 0)}"></div>
					</span>
					<span class="plus">
						<span>{@$cval?.amount || 0} x </span>
						<div class="item" data-id="{@($cval?.id ?? $cprev?.id) || 0}"><img src="{@Item.get_icon_by_item(db, ($cval?.id ?? $cprev?.id) || 0)}"></div>
					</span>
				</div>
			{else}
				{for cf of $f.schema}
					{if $cval[$cf.id] === undefined}
						{continue}
					{/if}
					{if $cf.id}
						{@PWPreview.render_diff_entry($cf, $cval[$cf.id], $cprev?.[$cf.id])}
					{else}
						{@PWPreview.render_diff_entry($cf, $cval, $cprev)}
					{/if}
				{/for}
			{/if}
		{/for}
		</div>
	{else if $f.type == 6}
		{assign arr = PWDB.get_linked_arr($f.linked_arr)}
		{@PWPreview.render_diff_entry(\{ type: 0, name: '' \}, $arr[$val]?.name, $arr[$prev]?.name)}
	{else if $f.type == 7}
		{for idx in $val}
			{assign id = $val[$idx]}
			{assign prev_id = $prev?.[$idx] || 0}
			{@PWPreview.render_diff_entry(\{ type: 6, name: '', linked_arr: $f.linked_arr \}, $val[$idx], $prev?.[$idx])}
		{/for}
	{else if $f.type == 8}
		<span class="minus"><div class="item" data-id="{@$prev}"><img src="{@Item.get_icon_by_item(db, $prev)}"></div></span>
		<span class="plus" style="margin-top: 2px;"><div class="item" data-id="{@$val}"><img src="{@Item.get_icon_by_item(db, $val)}"></div></span>
	{else if $f.type == 9}
		<div style="display: flex; flex-wrap: wrap;" class="item-row">
		{for idx in $val}
			{assign cval = $val[$idx]}
			{assign cprev = $prev?.[$idx]}

			<div>
				<span class="minus" style="margin-top: 2px;">
					<div class="item" data-id="{@$cprev || 0}"><img src="{@Item.get_icon_by_item(db, $cprev || 0)}"></div>
				</span>
				<span class="plus">
					<div class="item" data-id="{@($cval ?? $cprev) || 0}"><img src="{@Item.get_icon_by_item(db, ($cval ?? $cprev) || 0)}"></div>
				</span>
			</div>
		{/for}
		</div>
	{/if}
</div>
</script>

<script id="tpl-diff" type="text/x-dot-template">
{assign type = $obj._db.type}
{assign generic_fields = PWDB.get_type_fields($type) || \{\} }

{if $diff}
	{for fname in $diff}
		{assign f = $generic_fields[$fname]}
		{if !$f}{continue}{/if}
		{* there might be no diff in the end (happens sometimes) *}
		{if DB.cmp($diff[$fname], $prev[$fname]) == 0}{continue}{/if}

		{@PWPreview.render_diff_entry($f, $diff[$fname], $prev[$fname])}
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
		{assign pageid = $i}
		{assign page = $diff?.pages?.[$i]}
		{assign obj_page = $obj?.pages?.[$i]}
		{assign prev_page = $prev?.pages?.[$i]}
		{if !$obj_page && !$prev_page}{continue}{/if}

		{assign rows = new Set()}
		{assign modified_ids = new Set()}
		{for p_recipe_id in ($obj_page?.recipe_id || \{\})}
			{assign prev_id = $prev_page?.recipe_id?.[$p_recipe_id] || 0}
			{assign cur_id = $obj_page?.recipe_id?.[$p_recipe_id] || $prev_id}
			{assign is_changed = PWPreview.is_recipe_modified(db.recipes[$cur_id], db.recipes[$prev_id]?._db?.project_initial_state)}
			{if !$is_changed}
				{continue}
			{/if}
			{assign rowid = Math.floor($p_recipe_id / 8)}
			{$rows.add($rowid)}
			{$modified_ids.add(parseInt($p_recipe_id))}
		{/for}

		{if !$rows.size && !$page.title}
			{continue}
		{/if}

		<div class="block">
			<span class="header">Tab "{@($obj_page?.title ?? $prev?.pages?.[$i]?.title) || '(unnamed)'}" #{@$i}</span>
			{if $page?.title !== undefined}
				<div class="block">
					<span class="header">Name</span>
					<span class="minus">{@$prev.pages?.[$i]?.title || '(unnamed)'}</span>
					<span class="plus">{@$page?.title}</span>
				</div>
			{/if}
			{for rowid of $rows}
				<div class="block">
					<span class="header">Row {@$rowid}</span>
					<div class="crafts">
					{for i = 0; i < 8; i++}
						{assign prev_id = $prev_page?.recipe_id?.[$rowid * 8 + $i] || 0}
						{assign cur_id = $page?.recipe_id?.[$rowid * 8 + $i] ?? $prev_id}
						<div class="flex-rows" style="gap: 2px;">
							{assign unchanged = !$modified_ids.has($rowid * 8 + $i)}
							{assign icon_id = NPCCraftsWindow.get_recipe_icon_id($cur_id)}
							<span class="recipe {if $unchanged}unchanged{/if}" data-id="{if $unchanged && $icon_id == -1}0{else}{@$cur_id}{/if}" data-prev="{@$prev_id || -1}"><img{ } src="{@Item.get_icon($icon_id)}" alt=""></span>
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
