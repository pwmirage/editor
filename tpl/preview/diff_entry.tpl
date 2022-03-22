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
	{else if $f.type == 10}
		{assign added = ($val || 0) & ~($prev || 0)}
		{assign removed = ($prev || 0) & ~($val || 0)}
		{for pwclass of PWDBMeta.classes}
			{if $removed & (1 << $pwclass.id)}
				<span class="minus">{@$pwclass.name}</span>
			{/if}
		{/for}
		{for pwclass of PWDBMeta.classes}
			{if $added & (1 << $pwclass.id)}
				<span class="plus">{@$pwclass.name}</span>
			{/if}
		{/for}
	{/if}
</div>

