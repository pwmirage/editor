<script id="tpl-spawner-group-info" type="text/x-dot-template">

<div class="window popup square-left" style="position: absolute; width: 340px; height: 150px;">
<div class="content flex-rows" style="padding: 25px;">
	<span>
		{if $spawner._db.type.startsWith("resources_")}
			{assign obj = db.mines[$group.type]}
		{else}
			{assign obj = ($spawner.is_npc ? db.npcs : db.monsters)[$group.type]}
		{/if}
		{@($obj?.id ? (($obj?.name ?? "(unknown)") || "(unnamed)") : "(none)")} #{@$group.type}
	</span>
	<div class="flex-columns" style="align-items: center; margin-bottom: 2px;">
		<span>Count:</span>
		<input type="number" data-link="win.group => 'count'" style="width: 20px; margin-bottom: 4px" placeholder="0" size="1">
		<div style="flex: 1"></div>
		<label><input type="checkbox" data-link="win.group => 'aggro'" class="checkbox"><span>Is Aggressive</span></label>
	</div>

	<div class="flex-columns" style="align-items: center; margin-bottom: 4px;">
		<span>Path:</span>
		<a class="button no-break flex-columns" style="flex: 1;" data-onclick="MessageWindow.open({{ msg: 'Not implemented yet' }})">
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

	<div class="flex-columns flex-all" style="align-items: center;">
		<span>Group:</span>
		<span>Accept help group:</span>
	</div>

	<div class="flex-columns" style="align-items: center;">
		<a class="button no-break flex-columns" style="flex: 1;" data-onclick="MessageWindow.open({{ msg: 'Not implemented yet' }})">
			<span style="flex: 1;">
				{if $group.group_id}
					(unnamed) #{@$group.group_id}
				{else}
					(none)
				{/if}
			</span>
			<i class="fa fa-angle-right"></i>
		</a>
		<a class="button no-break flex-columns" style="flex: 1;" data-onclick="MessageWindow.open({{ msg: 'Not implemented yet' }})">
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

</div>
</div>

TEMPLATE_END
<style>
.window:after {
	content: ' ';
	position: absolute;
	left: -1px;
	top: -2px;
	width: 12px;
	height: calc(100% + 64px);
	background-color: #fafafa;
}
</style>
</script>

<script id="tpl-spawner" type="text/x-dot-template">

<div class="window resizable" style="width: 305px; height: 448px;">
<div class="header">
	<span>
		{if $spawner._db.type.startsWith("resources_")}Resource{/if}
		{if $spawner._db.type.startsWith("spawners")}{if $spawner.is_npc}NPC{else}Monster{/if}{/if}
		&nbsp;Spawner #{@$spawner.id}
	</span>
	<div class="menu">
		<i class="minimize fa" aria-hidden="true"></i>
		<i class="maximize fa" aria-hidden="true"></i>
		<i class="close fa fa-close" aria-hidden="true"></i>
	</div>
</div>
<div class="content flex-rows">
	<div class="flex-columns" style="align-items: center; margin-bottom: 2px;">
		<span>Name:</span>
		<input type="text" style="flex: 1; width: 100%; margin-bottom: 4px;" placeholder="(unnamed)" data-link="win.spawner => 'name'">
	</div>
	<div class="flex-columns flex-all" style="align-items: center;">
		<a class="button" style="visibility:hidden; max-height: 0;" data-onclick="MessageWindow.open({{ msg: 'Not implemented yet' }})">Pos:</a>
		<span>X:</span>
		<span>Y:</span>
		<span>Z:</span>
	</div>
	<div class="flex-columns flex-all" style="margin-bottom: 8px; align-items: center;">
		<a class="button" data-onclick="MessageWindow.open({{ msg: 'Not implemented yet' }})">Pos:</a>
		<span>{@Math.floor($spawner.pos[0] * 100) / 100}</span>
		<span>{assign ypos = Math.floor($spawner.pos[1] * 100) / 100}{@$ypos}
			 {if $ypos == 0}&nbsp; (auto){/if}</span>
		<span>{@Math.floor($spawner.pos[2] * 100) / 100}</span>
	</div>
	<div class="flex-columns flex-all" style="margin-bottom: 8px; align-items: center;">
		<a class="button" data-onclick="MessageWindow.open({{ msg: 'Not implemented yet' }})">Spread:</a>
		<span>{@Math.floor($spawner.spread[0] * 100) / 100}</span>
		<span>{@Math.floor($spawner.spread[1] * 100) / 100}</span>
		<span>{@Math.floor($spawner.spread[2] * 100) / 100}</span>
	</div>
	{if $spawner._db.type.startsWith('spawners_')}
		<label><input type="checkbox" data-oninput="win.set_is_npc(this.currentTarget.checked);" class="checkbox" {if $spawner.is_npc}checked{/if}><span>Is NPC</span></label>
	{/if}
	<div id="groups" class="flex-rows" style="margin-bottom: 4px;">
		{assign idx = 0}
		{foreach $spawner.groups as group}
			<div class="group-row flex-columns" data-onhover="queueTask('spawner_group_hover', () => win.info_group({@$idx}, this, is_hover));" data-onclick="win.select_group({@$idx});">
				{if $spawner._db.type.startsWith("resources_")}
					{assign obj = db.mines[$group.type]}
				{else}
					{assign obj = db.npcs[$group.type] || db.monsters[$group.type]}
				{/if}
				<div>{@$idx + 1}. {@($obj?.id ? (($obj?.name ?? "(unknown)") || "(unnamed)") : "(none)")}{if $group.type} <span style="font-size: 12px; vertical-align: bottom;">x{@$group.count || 0}</span>{/if} #{@$group.type}</div>
				<div style="flex: 1;"></div>
				{if $spawner._db.type.startsWith("resources_")}
					<a class="button no-break" data-onclick="MessageWindow.open({{ msg: 'Not implemented yet' }})"><i class="fa fa-angle-right"></i></a>
				{else}
					{if $obj._db.type == 'npcs'}
						<a class="button no-break" data-onclick="NPCWindow.open({{ npc: {@@$obj} }})"><i class="fa fa-angle-right"></i></a>
					{else}
						<a class="button no-break" data-onclick="MessageWindow.open({{ msg: 'Not implemented yet' }})"><i class="fa fa-angle-right"></i></a>
					{/if}
				{/if}

			</div>
			{$idx++}
		{/foreach}
	</div>
	<div class="flex-columns" style="margin-bottom: 8px; align-items: center;">
		<div style="flex: 1;"></div>
		<a class="button no-break" data-onclick="win.add_group()">(add) &nbsp;<i class="fa fa-plus" aria-hidden="true"></i></a>
	</div>
	<div class="flex-columns" style="margin-bottom: 8px; align-items: center;">
		<div class="no-break">Max groups:</div>
		<input type="number" style="flex: 1;" data-link="win.spawner => 'max_num'">
	</div>
	<div class="flex-columns" style="margin-bottom: 8px; align-items: center;">
		<div>Trigger:</div>
		<a class="button" data-onclick="MessageWindow.open({{ msg: 'Not implemented yet' }})">(none) &nbsp;<i class="fa fa-angle-right" aria-hidden="true"></i></a>
	</div>
	{if $spawner._db.type.startsWith('spawners_')}
		<div class="flex-columns" style="margin-bottom: 8px; align-items: center;">
			<div class="no-break">Lifetime: (sec) </div>
			<input type="number" style="flex: 1;" data-link="win.spawner => 'lifetime'">
		</div>
	{/if}
</div>
</div>

TEMPLATE_END
<style>
.group-row {
	padding: 5px;
	background-color: #ececec;
	border: 1px solid #e0b0b0;
	align-items: center;
	margin-bottom: -1px;
	position: relative;
	box-sizing: border-box;
}

.group-row > .window {
	display: none;
	position: relative;
	border-left: none;
	align-self: start;
	top: -32px;
	right: -7px;
	width: 0;
}

.group-row.selected:after,
.group-row:hover:after {
	content: '';
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background-color: #000;
	opacity: 0.1;
	pointer-events: none;
}

.group-row.selected > .window,
#groups:not(.has-selected) > .group-row:hover > .window {
	display: block;
}

.on-group-hover {
	display: none;
}

.group-row.selected .on-group-hover,
#groups:not(.has-selected) > .group-row:hover .on-group-hover {
	display: inline;
}

</style>

</script>

