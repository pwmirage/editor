<div class="window popup square-left" style="position: absolute; width: 240px;">
<div class="content flex-rows" style="padding: 25px;">
	<span>
		{if $spawner.type == 'resource'}
			{assign obj = db.mines[$group.type]}
		{else}
			{assign obj = ($spawner.type == 'npc' ? db.npcs : db.monsters)[$group.type]}
		{/if}
		{@($obj?.id ? (($obj?.name ?? "(unknown)") || "(unnamed)") : "(none)")} #{@$group.type}
	</span>
	{if $spawner.type != 'npc' || $spawner.groups?.length != 1}
		<div class="flex-columns" style="align-items: center; margin-bottom: 2px;">
			<span>Count:</span>
			<input type="number" data-link="{serialize $spawner} => 'groups', {@$group_idx}, 'count'" style="width: 20px; margin-bottom: 4px" placeholder="0" size="1">
			<div style="flex: 1"></div>
			{if $spawner.type == 'monster'}
				<label><input type="checkbox" data-link="{serialize $spawner} => 'groups', {@$group_idx}, 'aggro'" class="checkbox"><span>Is Aggressive</span></label>
			{else if $spawner.type == 'resource'}
				<span>Y offset</span>
				<input type="number" data-link="{serialize $spawner} => 'groups', {@$group_idx}, 'height_offset'" style="width: 30px; margin-bottom: 4px" placeholder="0" size="1">
			{/if}
		</div>
	{/if}

	{if $spawner.type == 'resource'}
		<div class="flex-columns" style="align-items: center; margin-bottom: 2px;">
			<span>Respawn time (sec):</span>
			<input type="number" data-link="{serialize $spawner} => 'groups', {@$group_idx}, 'respawn_time_sec'" style="width: 40px; margin-bottom: 4px" placeholder="0" size="1">
		</div>
	{else}
		<div class="flex-columns" style="align-items: center; margin-bottom: 4px;">
			<span>Path:</span>
			<a class="button no-break flex-columns" style="flex: 1;" onclick="MessageWindow.open({@@{ msg: 'Not implemented yet' }@@})">
				<span style="flex: 1;">
					{if $group.path_id}
						(unnamed) #{@$group.path_id}
					{else}
						(none)
					{/if}
				</span>
				<i class="fa fa-angle-right"></i>
			</a>
		</div>
	{/if}

	{if $spawner.type == 'monster'}
		<div class="flex-columns flex-all" style="align-items: center;">
			<span>Group:</span>
			<span>Accept help group:</span>
		</div>

		<div class="flex-columns" style="align-items: center;">
			<a class="button no-break flex-columns" style="flex: 1;" onclick="MessageWindow.open({@@{ msg: 'Not implemented yet' }@@})">
				<span style="flex: 1;">
					{if $group.group_id}
						(unnamed) #{@$group.group_id}
					{else}
						(none)
					{/if}
				</span>
				<i class="fa fa-angle-right"></i>
			</a>
			<a class="button no-break flex-columns" style="flex: 1;" onclick="MessageWindow.open({@@{ msg: 'Not implemented yet' }@@})">
				<span style="flex: 1;">
					{if $group.accept_help_group_id}
						(unnamed) #{@$group.accept_help_group_id}
					{else}
						(none)
					{/if}
				</span>
				<i class="fa fa-angle-right"></i>
			</a>
		</div>
	{/if}

</div>
</div>

{@@
<style>
.window:after {
	content: '';
	position: absolute;
	left: -1px;
	top: -2px;
	width: 12px;
	height: calc(100% + 3px);
	background-color: #fafafa;
}
</style>
@@}
